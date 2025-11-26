import React, { useEffect, useState, useRef } from 'react'
import { StyleSheet, View, Dimensions, Platform } from 'react-native'

import { Camera } from 'expo-camera'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - ExpoCamera is not exported but needed for tensorflow
import ExpoCamera from 'expo-camera/build/ExpoCamera'
import * as tf from '@tensorflow/tfjs'
import type * as posedetection from '@tensorflow-models/pose-detection'
import * as ScreenOrientation from 'expo-screen-orientation'
import {
    cameraWithTensors,
} from '@tensorflow/tfjs-react-native'
import Svg, { Circle, Line } from 'react-native-svg'
import { type ExpoWebGLRenderingContext } from 'expo-gl'
import {
    type EngineTelemetry,
    ExerciseEngine,
    type RawKeypoint,
} from '../../../../poseflow-js'
import { getExerciseRule } from '../../../../poseflow-js/rules'
import { useBeepSound } from '@/shared/lib'

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

// Размеры экрана
const SCREEN_WIDTH = Dimensions.get('window').width
const SCREEN_HEIGHT = Dimensions.get('window').height

// Ширина = 100% ширины экрана, высота = 60% от высоты экрана (для портрета)
const CAM_PREVIEW_WIDTH = SCREEN_WIDTH
const CAM_PREVIEW_HEIGHT = SCREEN_HEIGHT * 0.6

// Для ландшафта размеры будут вычисляться динамически в функции
// Ширина = вся ширина экрана, высота = 60% от высоты экрана 
// The score threshold for pose detection results.
const MIN_KEYPOINT_SCORE = 0.3

// The size of the resized output from TensorCamera.
//
// For movenet, the size here doesn't matter too much because the model will
// preprocess the input (crop, resize, etc). For best result, use the size that
// doesn't distort the image.
const OUTPUT_TENSOR_WIDTH = 180//CAM_PREVIEW_WIDTH
const OUTPUT_TENSOR_HEIGHT = OUTPUT_TENSOR_WIDTH / (IS_IOS ? 9 / 16 : 3 / 4)

// Whether to auto-render TensorCamera preview.
const AUTO_RENDER = false

type PoseCameraProps = {
    model: posedetection.PoseDetector
    orientation: ScreenOrientation.Orientation,
	exerciseId?: string
	onTelemetry?: (telemetry: EngineTelemetry) => void
	onAllKeypointsDetected?: (allDetected: boolean) => void
}

export const PoseCamera: React.FC<PoseCameraProps> = ({ model, orientation,    exerciseId,
    onTelemetry, onAllKeypointsDetected, }) => {
    const cameraRef = useRef(null)
	  const engineRef = useRef<ExerciseEngine | null>(null)
    const prevRepsRef = useRef<number>(0)
    const { playBeep } = useBeepSound()

    const [poses, setPoses] = useState<posedetection.Pose[]>()

    // Use front camera by default
    const [cameraType] = useState<CameraType>('front')
    // Use `useRef` so that changing it won't trigger a re-render.
    //
    // - null: unset (initial value).
    // - 0: animation frame/loop has been canceled.
    // - >0: animation frame has been scheduled.
    const rafId = useRef<number | null>(null)

    useEffect(() => {
        rafId.current = null
        // Called when the app is unmounted.
        return () => {
            if (rafId.current != null && rafId.current !== 0) {
                cancelAnimationFrame(rafId.current)
                rafId.current = 0
            }
        }
    }, [])

    useEffect(() => {
			
        if (!exerciseId) return
        // Recreate FSM stack whenever the user picks another exercise.
        const rule = getExerciseRule(exerciseId)
        if (!engineRef.current) {
            engineRef.current = new ExerciseEngine(rule)
        } else {
            engineRef.current.updateRule(rule)
        }
        engineRef.current.reset()
        prevRepsRef.current = 0 // Сбрасываем счетчик повторений при смене упражнения
    }, [exerciseId])

    const handleCameraStream = async (
        images: IterableIterator<tf.Tensor3D>,
        updatePreview: () => void,
        gl: ExpoWebGLRenderingContext
    ) => {
        const loop = async () => {
            // Get the tensor and run pose detection.
            const iteratorResult = images.next()
            
            // Only process if we have a valid tensor
            if (iteratorResult.value) {
                const imageTensor = iteratorResult.value as tf.Tensor3D

                try {
                    const detectedPoses = await model.estimatePoses(imageTensor, undefined, Date.now())
                    setPoses(detectedPoses)
                    emitTelemetry(detectedPoses[0])
                    
                    // Check if all 17 keypoints are detected
                    if (detectedPoses.length > 0 && detectedPoses[0]) {
                        const pose = detectedPoses[0]
                        const detectedKeypoints = pose.keypoints.filter(
                            (k) => (k.score ?? 0) > MIN_KEYPOINT_SCORE
                        )
                        const allDetected = detectedKeypoints.length === 17
                        onAllKeypointsDetected?.(allDetected)
                    } else {
                        onAllKeypointsDetected?.(false)
                    }
                } catch (error) {
                    console.error('[PoseCameraView] Error detecting poses:', error)
                    onAllKeypointsDetected?.(false)
                } finally {
                    tf.dispose([imageTensor])
                }
            }

            if (rafId.current === 0) {
                return
            }

            // Render camera preview manually when autorender=false.
            // Always update preview to keep video stream visible
            if (!AUTO_RENDER) {
                try {
                    updatePreview()
                    if (gl && typeof gl.endFrameEXP === 'function') {
                        gl.endFrameEXP()
                    }
                } catch (error) {
                    // Silently continue - preview update is not critical
                    console.warn('Error updating preview:', error)
                }
            }

            rafId.current = requestAnimationFrame(loop)
        }

        loop()
    }

    const renderPose = () => {
        if (poses != null && poses.length > 0 && poses[0]) {
            const pose = poses[0]

            // Создаем карту keypoints по имени для быстрого доступа
            const keypointMap = new Map<string, { x: number; y: number; cx: number; cy: number }>()
            
            pose.keypoints
                .filter((k) => (k.score ?? 0) > MIN_KEYPOINT_SCORE)
                .forEach((k) => {
                    const x = k.x
                    const y = k.y
                    const cameraWidth = getCameraWidth()
                    const cameraHeight = getCameraHeight()
                    const cxRaw =
                        (x / getOutputTensorWidth()) * cameraWidth
                    const cx = IS_ANDROID ? cameraWidth - cxRaw : cxRaw
                    // Для iOS учитываем центрирование камеры в контейнере
                    const yOffset = IS_IOS && isPortrait() 
                        ? (CAM_PREVIEW_HEIGHT - cameraHeight) / 2 
                        : 0
                    const cy =
                        (y / getOutputTensorHeight()) * cameraHeight + yOffset
                    keypointMap.set(k.name ?? '', { x, y, cx, cy })
                })

            // Определяем соединения для скелета (пары имен точек)
            const skeletonConnections: Array<[string, string]> = [
                // Голова и шея
                ['nose', 'left_shoulder'],
                ['nose', 'right_shoulder'],
                // Торс
                ['left_shoulder', 'right_shoulder'],
                ['left_shoulder', 'left_hip'],
                ['right_shoulder', 'right_hip'],
                ['left_hip', 'right_hip'],
                // Левая рука
                ['left_shoulder', 'left_elbow'],
                ['left_elbow', 'left_wrist'],
                // Правая рука
                ['right_shoulder', 'right_elbow'],
                ['right_elbow', 'right_wrist'],
                // Левая нога
                ['left_hip', 'left_knee'],
                ['left_knee', 'left_ankle'],
                // Правая нога
                ['right_hip', 'right_knee'],
                ['right_knee', 'right_ankle'],
            ]

            // Отрисовываем линии скелета
            const skeletonLines = skeletonConnections
                .map(([startName, endName]) => {
                    const start = keypointMap.get(startName)
                    const end = keypointMap.get(endName)
                    
                    if (start && end) {
                        return (
                            <Line
                                key={`skeleton_${startName}_${endName}`}
                                x1={start.cx}
                                y1={start.cy}
                                x2={end.cx}
                                y2={end.cy}
                                stroke='white'
                                strokeWidth='2'
                            />
                        )
                    }
                    return null
                })
                .filter(Boolean)

            // Отрисовываем точки
            const keypointCircles = Array.from(keypointMap.entries()).map(([name, coords]) => (
                <Circle
                    key={`skeletonkp_${name}`}
                    cx={coords.cx}
                    cy={coords.cy}
                    r='4'
                    strokeWidth='2'
                    fill='#00AA00'
                    stroke='white'
                />
            ))

            return (
                <Svg style={styles.svg}>
                    {skeletonLines}
                    {keypointCircles}
                </Svg>
            )
        } else {
            return <View></View>
        }
    }

    // Translate pose-detection output into the engine telemetry feed expected by the UI.
    const emitTelemetry = (pose: posedetection.Pose | undefined) => {
        if (!engineRef.current || !onTelemetry) return
        const keypoints = pose?.keypoints as RawKeypoint[] | undefined
        const telemetry = engineRef.current.process(keypoints ?? [], Date.now())
        
        // Воспроизводим звук при увеличении количества повторений
        if (telemetry.reps > prevRepsRef.current && telemetry.reps > 0) {
            playBeep()
        }
        prevRepsRef.current = telemetry.reps
        
        onTelemetry(telemetry)
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
        return OUTPUT_TENSOR_WIDTH
        // return isPortrait() || IS_ANDROID ? OUTPUT_TENSOR_WIDTH : OUTPUT_TENSOR_HEIGHT
    }

    const getOutputTensorHeight = () => {
        // return isPortrait() //|| IS_ANDROID
        //     ? OUTPUT_TENSOR_HEIGHT
        //     : OUTPUT_TENSOR_WIDTH

        return isPortrait() || IS_ANDROID ? OUTPUT_TENSOR_HEIGHT : OUTPUT_TENSOR_WIDTH
    }

    // Получаем реальные размеры камеры с учетом aspectRatio для iOS
    const getCameraWidth = () => {
        if (IS_IOS && isPortrait()) {
            // Для iOS в портрете камера имеет aspectRatio 9/16, ширина = 100% ширины экрана
            return CAM_PREVIEW_WIDTH
        }
        if (!isPortrait()) {
            // В ландшафте используем всю ширину экрана (в ландшафте width > height)
            const { width } = Dimensions.get('window')
            return width
        }
        return CAM_PREVIEW_WIDTH
    }

    const getCameraHeight = () => {
        if (IS_IOS && isPortrait()) {
            // Для iOS в портрете камера имеет aspectRatio 9/16
            // Но ограничиваем высоту до 60% экрана
            const aspectHeight = CAM_PREVIEW_WIDTH * (16 / 9)
            return Math.min(aspectHeight, CAM_PREVIEW_HEIGHT)
        }
        if (!isPortrait()) {
            // В ландшафте высота = 60% от высоты экрана
            const { height } = Dimensions.get('window')
            return height * 0.6
        }
        return CAM_PREVIEW_HEIGHT
    }

    const getTextureRotationAngleInDegrees = () => {
        // On Android, the camera texture will rotate behind the scene as the phone
        // changes orientation, so we don't need to rotate it in TensorCamera.
        // if (IS_ANDROID) {
        //     return 0
        // }

        // For iOS, the camera texture won't rotate automatically. Calculate the
        // rotation angles here which will be passed to TensorCamera to rotate it
        // internally.
        switch (orientation) {
        // Not supported on iOS as of 11/2021, but add it here just in case.
        case ScreenOrientation.Orientation.PORTRAIT_DOWN:
            return 180
        case ScreenOrientation.Orientation.LANDSCAPE_LEFT:
            return cameraType === 'front' ? 90 : 270
        case ScreenOrientation.Orientation.LANDSCAPE_RIGHT:
            return cameraType === 'front' ? 270 : 90
        default:
            return 0
        }
    }

    const shouldFlipCamera = IS_IOS && cameraType === 'front'

    // Для iOS добавляем aspectRatio для правильного соотношения сторон в портрете
    // В ландшафте используем фиксированную высоту (60% от высоты экрана)
    // Убираем height: '100%' чтобы aspectRatio работал правильно
    const cameraStyle = IS_IOS && isPortrait()
        ? [
            styles.camera, 
            { 
                aspectRatio: 9 / 16, 
                height: undefined,
                maxHeight: CAM_PREVIEW_HEIGHT 
            }
        ]
        : styles.camera

    return (
        <View
            style={[
                isPortrait() ? styles.containerPortrait : styles.containerLandscape,
                !isPortrait() && {
                    width: Dimensions.get('window').width,
                    height: Dimensions.get('window').height * 0.6
                }
            ]}
        >
            <View
                style={[
                    styles.cameraWrapper,
                    IS_IOS && styles.cameraWrapperIOS,
                    shouldFlipCamera && { transform: [{ scaleX: -1 }] }
                ]}
            >
                {/* @ts-ignore - TensorCamera type issue */}
                <TensorCamera
                    ref={cameraRef}
                    style={cameraStyle}
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
            </View>
            {renderPose()}
        </View>
    )
}

const styles = StyleSheet.create({
    containerPortrait: {
        position: 'relative',
        width: CAM_PREVIEW_WIDTH,
        height: CAM_PREVIEW_HEIGHT,
        alignSelf: 'center',
        borderRadius: 20
    },
    containerLandscape: {
        position: 'relative',
        alignSelf: 'center',
        borderRadius: 20
    },
    cameraWrapper: {
        width: '100%',
        height: '100%',
    },
    cameraWrapperIOS: {
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
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