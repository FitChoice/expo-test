import { PoseCamera } from '@/widgets/pose-camera'
import { View, Text, Dimensions, useWindowDimensions } from 'react-native'
import { useState, useEffect, useRef } from 'react'
import type * as posedetection from '@tensorflow-models/pose-detection'
import * as ScreenOrientation from 'expo-screen-orientation'
import Svg, { Circle } from 'react-native-svg'
import BodySilhouetteDefault from '@/assets/images/body_silhouette_default.svg'
import { BackgroundLayoutNoSidePadding } from '@/shared/ui'
type BodyPositionScreenProps = {
	isVertical?: boolean
	onComplete: () => void
	model: posedetection.PoseDetector
	orientation: ScreenOrientation.Orientation
	title?: string
	subtitle?: string
	titleClassName?: string
	subtitleClassName?: string
	successText?: string
    type?: 'side_switch'
}

export const BodyPositionScreen = ({
    isVertical,
    onComplete,
    model,
    orientation,
    title = 'Примите исходное положение',
    subtitle = 'Встаньте так, чтобы ваше тело полностью попадало в кадр и входило в контур',
    titleClassName,
    subtitleClassName,
    successText = 'Вперёд!',
}: BodyPositionScreenProps) => {
    const isPortrait = () => {
        return (
            orientation === ScreenOrientation.Orientation.PORTRAIT_UP ||
			orientation === ScreenOrientation.Orientation.PORTRAIT_DOWN
        )
    }

    const CAM_PREVIEW_HEIGHT = isPortrait()
        ? Dimensions.get('window').height * 0.6
        : Dimensions.get('window').height

    const [showSuccess, setShowSuccess] = useState(false)
    const successTimerRef = useRef<NodeJS.Timeout | null>(null)
    const allKeypointsDetectedRef = useRef(false)

    const handleAllKeypointsDetected = (allDetected: boolean) => {
        if (allDetected && !allKeypointsDetectedRef.current) {
            allKeypointsDetectedRef.current = true

            // Clear any existing timer
            if (successTimerRef.current) {
                clearTimeout(successTimerRef.current)
            }

            // Set success after 2 seconds
            successTimerRef.current = setTimeout(() => {
                setShowSuccess(true)
            }, 2000)
            successTimerRef.current = setTimeout(() => {
                onComplete()
            }, 2200)
        }
    }

    useEffect(() => {
        return () => {
            if (successTimerRef.current) {
                clearTimeout(successTimerRef.current)
            }
        }
    }, [])

    const { width } = useWindowDimensions()

    // Настройка статус-бара: светлые иконки для темного градиента
    // useStatusBar({
    //     style: 'light',
    //     backgroundColor: '#BA9BF7', // Цвет фона статус-бара на Android (совпадает с градиентом)
    // })

    // useEffect(() => {
    //     // Reset state when component mounts
    //     setShowSuccess(false)
    //
    //     const successTimer = setTimeout(() => {
    //         setShowSuccess(true)
    //     }, 7000)
    //
    //     const completeTimer = setTimeout(() => {
    //         onComplete()
    //     }, 8000)
    //
    //     return () => {
    //         clearTimeout(successTimer)
    //         clearTimeout(completeTimer)
    //     }
    // }, [onComplete])

    return (
        <View className="flex-1 bg-transparent">
            <BackgroundLayoutNoSidePadding>
                <View
                    style={{
                        height: CAM_PREVIEW_HEIGHT,
                        backgroundColor: 'transparent',
                        borderRadius: 24,
                        overflow: 'hidden',
                    }}
                >
                    <PoseCamera
                        model={model}
                        orientation={orientation}
                        onAllKeypointsDetected={handleAllKeypointsDetected}
                    />

                    {/* Grid pattern overlay - inside camera view */}
                    <View className="absolute inset-0" style={{ pointerEvents: 'none' }}>
                        <Svg
                            width={width}
                            height={CAM_PREVIEW_HEIGHT}
                            viewBox={`0 0 ${width} ${CAM_PREVIEW_HEIGHT}`}
                        >
                            {Array.from({ length: Math.ceil(width / 20) }, (_, i) =>
                                Array.from({ length: Math.ceil(CAM_PREVIEW_HEIGHT / 20) }, (_, j) => (
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
                </View>

                {/* Body Silhouette Overlay */}
                {isVertical ? (
                    <View className="absolute inset-0 items-center justify-start pt-20">
                        {
                            <BodySilhouetteDefault
                                stroke={showSuccess ? '#8BC34A' : 'white'}
                                fill={showSuccess ? 'rgba(139,195,74,0.36)' : 'transparent'}
                            />
                        }
                    </View>
                ) : (
                    <View className="absolute inset-0 items-center justify-center">
                        <View style={{ transform: [{ rotate: '90deg' }] }}>
                            <BodySilhouetteDefault
                                stroke={showSuccess ? '#8BC34A' : 'white'}
                                fill={showSuccess ? 'rgba(139,195,74,0.36)' : 'transparent'}
                            />
                        </View>
                    </View>
                )}

                <View className="pl-2 pt-10">
                    <Text className={titleClassName ?? 'mb-2 text-left text-h2 text-light-text-100'}>
                        {title}
                    </Text>
                    {subtitle && (
                        <Text className={subtitleClassName ?? 'text-left text-t2 text-light-text-200'}>
                            {subtitle}
                        </Text>
                    )}

                    {showSuccess && (
                        <View className="mt-6 items-center">
                            <Text className="text-h1 text-brand-green-500">{successText}</Text>
                        </View>
                    )}

                    {!isVertical && (
                        <View className="absolute bottom-0 left-0 right-0 z-10 items-center justify-center bg-black opacity-50">
                            <Text className={titleClassName ?? 'mb-2 text-left text-h2 text-light-text-100'}>
                                {title}
                            </Text>
                            {subtitle && (
                                <Text className={subtitleClassName ?? 'text-left text-t2 text-light-text-200'}>
                                    {subtitle}
                                </Text>
                            )}

                            {showSuccess && (
                                <View className="mb-2 mt-2 items-center">
                                    <Text className="text-h1 text-brand-green-500">Вперёд!</Text>
                                </View>
                            )}
                        </View>
                    )}
                </View>
            </BackgroundLayoutNoSidePadding>
        </View>
    )
}
