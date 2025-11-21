import React, { useEffect, useState, useRef } from 'react'
import { StyleSheet, Text, View, Dimensions, Platform } from 'react-native'

import { Camera } from 'expo-camera'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - ExpoCamera is not exported but needed for tensorflow
import ExpoCamera from 'expo-camera/build/ExpoCamera'
import * as tf from '@tensorflow/tfjs'
import * as posedetection from '@tensorflow-models/pose-detection'
import * as ScreenOrientation from 'expo-screen-orientation'
import {
    cameraWithTensors,
} from '@tensorflow/tfjs-react-native'
import Svg, { Circle } from 'react-native-svg'
import { type ExpoWebGLRenderingContext } from 'expo-gl'

// Polyfill for Camera.Constants which was removed in expo-camera v17
// @tensorflow/tfjs-react-native still expects this API
if (!(Camera as any).Constants) {
    (Camera as any).Constants = {
        Type: {
            front: 1, // Front camera
            back: 2,  // Back camera
        },
    }
}

// tslint:disable-next-line: variable-name
const TensorCamera = cameraWithTensors(ExpoCamera)

// Use string values for camera type
type CameraType = 'front' | 'back'

const IS_ANDROID = Platform.OS === 'android'
const IS_IOS = Platform.OS === 'ios'

// Camera preview size.
//
// From experiments, to render camera feed without distortion, 16:9 ratio
// should be used fo iOS devices and 4:3 ratio should be used for android
// devices.
//
// This might not cover all cases.

const CAM_PREVIEW_HEIGHT = Dimensions.get('window').height - 180
const CAM_PREVIEW_WIDTH = Dimensions.get('window').width 
// The score threshold for pose detection results.
const MIN_KEYPOINT_SCORE = 0.3

// The size of the resized output from TensorCamera.
//
// For movenet, the size here doesn't matter too much because the model will
// preprocess the input (crop, resize, etc). For best result, use the size that
// doesn't distort the image.
const OUTPUT_TENSOR_WIDTH = 180
const OUTPUT_TENSOR_HEIGHT = OUTPUT_TENSOR_WIDTH / (IS_IOS ? 9 / 16 : 3 / 4)

// Whether to auto-render TensorCamera preview.
const AUTO_RENDER = false

export  const PoseCamera: React.FC = () => {
    const cameraRef = useRef(null)
    const [tfReady, setTfReady] = useState(false)
    const [model, setModel] = useState<posedetection.PoseDetector>()
    const [poses, setPoses] = useState<posedetection.Pose[]>()

    const [orientation, setOrientation] =
		useState<ScreenOrientation.Orientation>()
    // Use front camera by default
    const [cameraType, setCameraType] = useState<CameraType>('front')
    // Use `useRef` so that changing it won't trigger a re-render.
    //
    // - null: unset (initial value).
    // - 0: animation frame/loop has been canceled.
    // - >0: animation frame has been scheduled.
    const rafId = useRef<number | null>(null)

    useEffect(() => {
        async function prepare() {
            rafId.current = null

            // Set initial orientation.
            const curOrientation = await ScreenOrientation.getOrientationAsync()
            setOrientation(curOrientation)

            // Listens to orientation change.
            ScreenOrientation.addOrientationChangeListener((event) => {
                setOrientation(event.orientationInfo.orientation)
            })

            // Camera permission.
            await Camera.requestCameraPermissionsAsync()

            // Wait for tfjs to initialize the backend.
            await tf.ready()

            const movenetModelConfig: posedetection.MoveNetModelConfig = {
                modelType: posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
                enableSmoothing: true,
            }

            const model = await posedetection.createDetector(
                posedetection.SupportedModels.MoveNet,
                movenetModelConfig
            )
            setModel(model)

            // Ready!
            setTfReady(true)
        }

        prepare()
    }, [])

    useEffect(() => {
        // Called when the app is unmounted.
        return () => {
            if (rafId.current != null && rafId.current !== 0) {
                cancelAnimationFrame(rafId.current)
                rafId.current = 0
            }
        }
    }, [])

    const handleCameraStream = async (
        images: IterableIterator<tf.Tensor3D>,
        updatePreview: () => void,
        gl: ExpoWebGLRenderingContext
    ) => {
        const loop = async () => {
            // Get the tensor and run pose detection.
            const imageTensor = images.next().value as tf.Tensor3D
         
            const poses = await model!.estimatePoses(
                imageTensor,
                undefined,
                Date.now()
            )
            setPoses(poses)
            tf.dispose([imageTensor])

            if (rafId.current === 0) {
                return
            }

            // // Render camera preview manually when autorender=false.
            // if (!AUTO_RENDER) {
            //     try {
            //         updatePreview()
            //         if (gl && typeof gl.endFrameEXP === 'function') {
            //             gl.endFrameEXP()
            //         }
            //     } catch (error) {
            //         // Silently continue - preview update is not critical
            //         console.warn('Error updating preview:', error)
            //     }
            // }

            rafId.current = requestAnimationFrame(loop)
        }

        loop()
    }

    const renderPose = () => {
        if (poses != null && poses.length > 0 && poses[0]) {
            const keypoints = poses[0].keypoints
                .filter((k) => (k.score ?? 0) > MIN_KEYPOINT_SCORE)
                .map((k) => {
                    // Flip horizontally on android or when using back camera on iOS.
                    const flipX = IS_ANDROID || cameraType === 'back'
                    const x = flipX ? getOutputTensorWidth() - k.x : k.x
                    const y = k.y
                    const cx =
						(x / getOutputTensorWidth()) *
						(isPortrait() ? CAM_PREVIEW_WIDTH : CAM_PREVIEW_HEIGHT)
                    const cy =
						(y / getOutputTensorHeight()) *
						(isPortrait() ? CAM_PREVIEW_HEIGHT : CAM_PREVIEW_WIDTH)
                    return (
                        <Circle
                            key={`skeletonkp_${k.name}`}
                            cx={cx}
                            cy={cy}
                            r='4'
                            strokeWidth='2'
                            fill='#00AA00'
                            stroke='white'
                        />
                    )
                })

            return <Svg style={styles.svg}>{keypoints}</Svg>
        } else {
            return <View></View>
        }
    }

    const isPortrait = () => {
        return (
            orientation === ScreenOrientation.Orientation.PORTRAIT_UP ||
			orientation === ScreenOrientation.Orientation.PORTRAIT_DOWN
        )
    }

    const getOutputTensorWidth = () => {
        // On iOS landscape mode, switch width and height of the output tensor to
        // get better result. Without this, the image stored in the output tensor
        // would be stretched too much.
        //
        // Same for getOutputTensorHeight below.
        return isPortrait() || IS_ANDROID
            ? OUTPUT_TENSOR_WIDTH
            : OUTPUT_TENSOR_HEIGHT
    }

    const getOutputTensorHeight = () => {
        return isPortrait() || IS_ANDROID
            ? OUTPUT_TENSOR_HEIGHT
            : OUTPUT_TENSOR_WIDTH
    }

    const getTextureRotationAngleInDegrees = () => {
        // On Android, the camera texture will rotate behind the scene as the phone
        // changes orientation, so we don't need to rotate it in TensorCamera.
        if (IS_ANDROID) {
            return 0
        }

        // For iOS, the camera texture won't rotate automatically. Calculate the
        // rotation angles here which will be passed to TensorCamera to rotate it
        // internally.
        switch (orientation) {
        // Not supported on iOS as of 11/2021, but add it here just in case.
        case ScreenOrientation.Orientation.PORTRAIT_DOWN:
            return 180
        case ScreenOrientation.Orientation.LANDSCAPE_LEFT:
            return cameraType === 'front' ? 270 : 90
        case ScreenOrientation.Orientation.LANDSCAPE_RIGHT:
            return cameraType === 'front' ? 90 : 270
        default:
            return 0
        }
    }

    if (!tfReady) {
        return (
            <View style={styles.loadingMsg}>
                <Text>Loading...</Text>
            </View>
        )
    } else {
        return (
            <View
                style={
                    isPortrait() ? styles.containerPortrait : styles.containerLandscape
                }
            >
                <TensorCamera
                    ref={cameraRef}
                    style={styles.camera}
                    autorender={AUTO_RENDER}
                    facing={cameraType}
                    // tensor related props
                    resizeWidth={getOutputTensorWidth()}
                    resizeHeight={getOutputTensorHeight()}
                    resizeDepth={3}
                    rotation={getTextureRotationAngleInDegrees()}
                    onReady={handleCameraStream}
                    useCustomShadersToResize={false}
                    cameraTextureWidth={0}
                    cameraTextureHeight={0}
                />
                {renderPose()}
            </View>
        )
    }
}

const styles = StyleSheet.create({
    containerPortrait: {
        position: 'relative',
        width: CAM_PREVIEW_WIDTH,
        height: CAM_PREVIEW_HEIGHT,
			  borderRadius: 20
    },
    containerLandscape: {
        position: 'relative',
        width: CAM_PREVIEW_HEIGHT,
        height: CAM_PREVIEW_WIDTH,
        marginLeft: Dimensions.get('window').height / 2 - CAM_PREVIEW_HEIGHT / 2,
        borderRadius: 20
    },
    loadingMsg: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    camera: {
        width: '100%',
        height: '100%',
        zIndex: 1,
        borderRadius: 20

    },
    svg: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        zIndex: 30,
    },
    fpsContainer: {
        position: 'absolute',
        top: 10,
        left: 10,
        width: 80,
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, .7)',
        borderRadius: 20,
        padding: 8,
        zIndex: 20,
    },

})