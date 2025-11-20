/**
 * Body Position Check Screen (4.0, 4.1)
 * Проверяет, что пользователь принял правильную позицию перед началом упражнения
 * Использует камеру и pose detection для определения позиции
 */

import { View, Text, useWindowDimensions } from 'react-native'
import { CameraView } from 'expo-camera'
import { useState, useEffect, useRef } from 'react' 
import { LinearGradient } from 'expo-linear-gradient'
import Svg, {  Circle } from 'react-native-svg'
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake'

import BodySilhouetteDefault from '@/assets/images/body_silhouette_default.svg'
import BodySilhouetteRightSide from '@/assets/images/silhouette_side_right.svg'
import BodySilhouetteLeftSide from '@/assets/images/silhouette_side_left.svg'
import {
    ExerciseWithCounterWrapper
} from '@/shared/ui/ExerciseWithCounterWrapper/ExerciseWithCounterWrapper'
import { VIDEO_SCREEN_HEIGHT as height } from '@/shared/constants/sizes'

interface BodyPositionScreenProps {
	onComplete: () => void
	title?: string,
	side?:  'left' | 'right'
    isVertical?: boolean
}

import '@tensorflow/tfjs-backend-webgl'
import * as tf from '@tensorflow/tfjs'
import * as poseDetection from '@tensorflow-models/pose-detection'

export function BodyPositionScreen({
    onComplete, title, side, isVertical
}: BodyPositionScreenProps) {

    const [showSuccess, setShowSuccess] = useState(false)
    const [cameraKey, setCameraKey] = useState(0)
    const [isDetectorReady, setIsDetectorReady] = useState(false)
    const { width, height: windowHeight } = useWindowDimensions()
    const screenHeight = isVertical ? height : windowHeight
    const cameraRef = useRef<CameraView>(null)
    const processingRef = useRef(false)
    const isInitializedRef = useRef(false)

    // // Initialize TensorFlow and Pose Detector
    // useEffect(() => {
    //     let processingInterval: NodeJS.Timeout | null = null

    //     const initTensorFlow = async () => {
    //         try {
    //             // Pre-import MediaPipe to ensure it's available
    //             try {
    //                 await import('@mediapipe/pose')
    //             } catch (e) {
    //                 console.warn('MediaPipe import warning:', e)
    //             }

    //             // Dynamic imports
    //             tf = await import('@tensorflow/tfjs')
    //             await import('@tensorflow/tfjs-react-native')
    //             const tfReactNative = await import('@tensorflow/tfjs-react-native')
    //             decodeJpeg = tfReactNative.decodeJpeg
    //             poseDetection = await import('@tensorflow-models/pose-detection')

    //             await tf.ready()
    //             // eslint-disable-next-line @typescript-eslint/no-require-imports
    //             const tfRN = require('@tensorflow/tfjs-react-native')
    //             if (tfRN.platform && tfRN.platform.initialize) {
    //                 await tfRN.platform.initialize()
    //             }

    //             // Use MoveNet Lightning (doesn't require MediaPipe)
    //             const detector = await poseDetection.createDetector(
    //                 poseDetection.SupportedModels.MoveNet,
    //                 {
    //                     modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
    //                 }
    //             )
    //             detectorRef.current = detector

    //             // Process frames every 1 second
    //             processingInterval = setInterval(async () => {
    //                 if (processingRef.current || !cameraRef.current || !detectorRef.current) return
    //                 processingRef.current = true

    //                 try {
    //                     const photo = await cameraRef.current.takePictureAsync({
    //                         quality: 0.8,
    //                         base64: true,
    //                     })

    //                     if (photo?.base64 && tf && decodeJpeg && poseDetection) {
    //                         const binaryString = atob(photo.base64)
    //                         const imageData = new Uint8Array(binaryString.length)
    //                         for (let i = 0; i < binaryString.length; i++) {
    //                             imageData[i] = binaryString.charCodeAt(i)
    //                         }

    //                         const imageTensor = decodeJpeg(imageData) as any
    //                         const resized = tf.image.resizeBilinear(imageTensor, [256, 256])
    //                         const poses = await detectorRef.current.estimatePoses(resized)

    //                         imageTensor.dispose()
    //                         resized.dispose()

    //                         if (poses && poses.length > 0 && poses[0]) {
    //                             console.log('=== Pose Detection Results ===')
    //                             poses[0].keypoints.forEach((keypoint: any, index: number) => {
    //                                 console.log(
    //                                     `Keypoint ${index} (${keypoint.name || 'unknown'}): ` +
    //                                     `x: ${keypoint.x.toFixed(2)}, y: ${keypoint.y.toFixed(2)}, score: ${keypoint.score?.toFixed(3) || 'N/A'}`
    //                                 )
    //                             })
    //                             console.log('=== End Pose Detection ===')
    //                         }
    //                     }
    //                 } catch (error) {
    //                     console.error('Error processing image:', error)
    //                 } finally {
    //                     processingRef.current = false
    //                 }
    //             }, 1000)
    //         } catch (error) {
    //             console.error('TensorFlow initialization error:', error)
    //         }
    //     }

    //     initTensorFlow()

    //     return () => {
    //         if (processingInterval) {
    //             clearInterval(processingInterval)
    //         }
    //         if (detectorRef.current) {
    //             detectorRef.current.dispose()
    //         }
    //     }
    // }, [])

    useEffect(() => {
        let keepAwakeActivated = false

        const init = async () => {
            try {
                await activateKeepAwakeAsync()
                keepAwakeActivated = true
            } catch (error) {
                console.error('Keep awake activation error:', error)
            }
        }

        init()

        return () => {
            if (keepAwakeActivated) {
                deactivateKeepAwake()
            }
        }
    }, [])

    // useEffect(() => {
    //    // Reset state when component mounts
    //     setShowSuccess(false)
    //     setCameraKey(prev => prev + 1)
		
    //     const successTimer = setTimeout(() => {
    //         setShowSuccess(true)
    //     }, 5000)

    //     const completeTimer = setTimeout(() => {
    //         onComplete()
    //     }, 6000)

    //     return () => {
    //         clearTimeout(successTimer)
    //         clearTimeout(completeTimer)
    //     }
    // }, [onComplete, title])

    const [hasPermission, setHasPermission] = useState(null)
    const detectorRef = useRef<poseDetection.PoseDetector | null>(null)
    const isProcessingRef = useRef(false)

    // Инициализация TensorFlow и модели MoveNet
    useEffect(() => {
        let mounted = true

        const initTensorFlow = async () => {
            try {
                // Инициализация TensorFlow platform для React Native
                await tf.ready()
                
                // Инициализация платформы для React Native
                // eslint-disable-next-line @typescript-eslint/no-require-imports
                const tfRN = require('@tensorflow/tfjs-react-native')
                if (tfRN.platform && tfRN.platform.initialize) {
                    await tfRN.platform.initialize()
                }

                // Создание детектора MoveNet
                const det = await poseDetection.createDetector(
                    poseDetection.SupportedModels.MoveNet,
                    { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
                )
                
                if (mounted) {
                    detectorRef.current = det
                    setIsDetectorReady(true)
                }
            } catch (error) {
                console.error('TensorFlow initialization error:', error)
            }
        }

        initTensorFlow()

        return () => {
            mounted = false
            if (detectorRef.current) {
                detectorRef.current.dispose()
                detectorRef.current = null
            }
        }
    }, [])

    // Обработка кадров из камеры через takePictureAsync
    useEffect(() => {
        if (!isDetectorReady || !cameraRef.current) return

        let processingInterval: NodeJS.Timeout | null = null

        const processFrame = async () => {
            if (isProcessingRef.current || !cameraRef.current || !detectorRef.current) return

            isProcessingRef.current = true

            try {
                // Получаем кадр с камеры
                const photo = await cameraRef.current.takePictureAsync({
                    quality: 0.3,
                    base64: true,
                    skipProcessing: true,
                })

                if (photo?.base64 && detectorRef.current) {
                    // Преобразуем base64 в тензор
                    // eslint-disable-next-line @typescript-eslint/no-require-imports
                    const tfRN = require('@tensorflow/tfjs-react-native')
                    const decodeJpeg = tfRN.decodeJpeg

                    const binaryString = atob(photo.base64)
                    const imageData = new Uint8Array(binaryString.length)
                    for (let i = 0; i < binaryString.length; i++) {
                        imageData[i] = binaryString.charCodeAt(i)
                    }

                    const imageTensor = decodeJpeg(imageData) as tf.Tensor3D
                    const resized = tf.image.resizeBilinear(imageTensor, [256, 256])
                    
                    // Обрабатываем позу
                    const poses = await detectorRef.current.estimatePoses(resized)
                    
                    if (poses && poses.length > 0 && poses[0]) {
                        // Выводим координаты всех ключевых точек в консоль
                        console.log('=== Pose Detection Results ===')
                        poses[0].keypoints.forEach((pt: poseDetection.Keypoint, index: number) => {
                            console.log(
                                `Keypoint ${index} (${pt.name || 'unknown'}): ` +
                                `x: ${pt.x.toFixed(2)}, y: ${pt.y.toFixed(2)}, score: ${pt.score?.toFixed(3) || 'N/A'}`
                            )
                        })
                        console.log('=== End Pose Detection ===')
                    }

                    // Освобождаем память
                    imageTensor.dispose()
                    resized.dispose()
                }
            } catch (error) {
                console.error('Error processing frame:', error)
            } finally {
                isProcessingRef.current = false
            }
        }

        // Обрабатываем кадры каждые 200ms (5 FPS для pose detection)
        processingInterval = setInterval(processFrame, 200)

        return () => {
            if (processingInterval) {
                clearInterval(processingInterval)
            }
        }
    }, [isDetectorReady])

    // if (hasPermission === null) return <View><Text>Requesting camera permission</Text></View>
    // if (hasPermission === false) return <View><Text>No access to camera</Text></View>

    return (
        <ExerciseWithCounterWrapper
            onComplete={onComplete}
        >
            {/* Camera View with Overlay */}
            <View className="flex-1 bg-transparent">
                <CameraView
                    ref={cameraRef}
                    key={`camera-${cameraKey}`}
                    style={{ flex: 1 }}
                    facing="front"
                />
                {/* Grid pattern background - full width and height */}
                <View className="absolute top-0 left-0 right-0 rounded-3xl " style={{ height: screenHeight }}>
                    <Svg width={width} height={screenHeight} viewBox={`0 0 ${width} ${screenHeight}`}>
                        {/* Grid pattern background */}
                        {Array.from({ length: Math.ceil(width / 20) }, (_, i) =>
                            Array.from({ length: Math.ceil(screenHeight / 20) }, (_, j) => (
                                <Circle
                                    key={`grid-${i}-${j}`}
                                    cx={i * 20 + 10}
                                    cy={j * 20 + 10}
                                    r="1.5"
                                    fill="#E5E5E5"
                                    opacity="0.6"
                                />
                            ))
                        )}
                    </Svg>
                </View>

                {/* Body Silhouette Overlay */}
                {isVertical ? (
                    <View className="absolute inset-0 items-center justify-start pt-10">
                        {
                            side == 'right' ? <BodySilhouetteRightSide stroke={showSuccess ? '#8BC34A' : 'white'} /> :
                                side == 'left' ? <BodySilhouetteLeftSide stroke={showSuccess ? '#8BC34A' : 'white'} /> :
                                    <BodySilhouetteDefault
                                        stroke={showSuccess ? '#8BC34A' : 'white'}
                                    />	}
                    </View>
                ) : (
                    <View className="absolute inset-0 bottom-20 items-center justify-center">
                        <View style={{ transform: [{ rotate: '-90deg' }] }}>
                            <BodySilhouetteDefault
                                stroke={showSuccess ? '#8BC34A' : 'white'}
                            />
                        </View>
                    </View>
                )}
            </View>

            {/* Bottom Info */}
            {isVertical ? (
                <LinearGradient
                    colors={['#BA9BF7', '#000000']}
                    locations={[0, 0.8]}
                    start={{ x: -0.5, y: 0.9 }}
                    end={{ x: 0.5, y: 1 }}
                    style={{ 
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        top: height,
                        padding: 24
                    }}
                >
                    {
                        title ? <View className="mt-6 items-center">
                            <Text className="text-h1 text-center text-brand-green-500">{title}</Text>
                        </View> : <>
                            <Text className="text-h2 text-light-text-100 mb-2 text-center">
                                Примите исходное положение
                            </Text>
                            <Text className="text-t2 text-light-text-200 text-center">
                                Встаньте так, чтобы ваше тело полностью попадало в кадр и входило в контур
                            </Text>

                            {/* Success Message */}
                            {showSuccess && (
                                <View className="mt-6 items-center">
                                    <Text className="text-h1 text-brand-green-500">Вперёд!</Text>
                                </View>
                            )}
                        </>

                    }
                </LinearGradient>
            ) : (
                <LinearGradient
                    colors={['#BA9BF7', '#000000']}
                    locations={[0, 0.8]}
                    start={{ x: -0.5, y: 0.9 }}
                    end={{ x: 0.5, y: 1 }}
                    style={{ 
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        height: windowHeight * 0.3,
                        padding: 24,
                        justifyContent: 'center'
                    }}
                >
                    {
                        title ? <View className="items-center">
                            <Text className="text-h1 text-center text-brand-green-500">{title}</Text>
                        </View> : <>
                            <Text className="text-h2 text-light-text-100 mb-2 text-center">
                                Примите исходное положение
                            </Text>
                            <Text className="text-t2 text-light-text-200 text-center">
                                Лягте так, чтобы ваше тело полностью помещалось в кадр и входило в контур
                            </Text>

                            {/* Success Message */}
                            {showSuccess && (
                                <View className="mt-6 items-center">
                                    <Text className="text-h1 text-brand-green-500">Вперёд!</Text>
                                </View>
                            )}
                        </>

                    }
                </LinearGradient>
            )}
        </ExerciseWithCounterWrapper>
    )
}
