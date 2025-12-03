import { View, Text, Animated, Easing, Alert } from 'react-native'

import { useEffect, useRef } from 'react'
import * as ScreenOrientation from 'expo-screen-orientation'
import { GradientBg } from '@/shared/ui/GradientBG'
import { CloseBtn } from '@/shared/ui/CloseBtn'
import { router } from 'expo-router'
import RotatePhoneIcon from 'src/assets/images/rotate_phone_image.svg'

interface RotatePhoneScreenProps {
	onNext: () => void
}

export function RotatePhoneScreen({ onNext }: RotatePhoneScreenProps) {

    const orientationChangedRef = useRef(false)
    const hasShownAlertRef = useRef(false)
	
    const handleStop = () => {
        router.back()
    }

    // // Анимация мерцания
    const opacity = useRef(new Animated.Value(0.5)).current

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.3,
                    duration: 500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start()
    }, [opacity])

    useEffect(() => {
        // Сбрасываем refs при монтировании
        orientationChangedRef.current = false
        hasShownAlertRef.current = false
		
        let checkTimeout: ReturnType<typeof setTimeout> | null = null
        let subscription: { remove: () => void } | null = null

        const checkRotationLock = async () => {
            try {
                await ScreenOrientation.unlockAsync()
				
                // Получаем начальную ориентацию
                const initialOrientation = await ScreenOrientation.getOrientationAsync()
				
                // Слушаем изменения ориентации
                subscription = ScreenOrientation.addOrientationChangeListener(() => {
                    orientationChangedRef.current = true
                    if (checkTimeout) {
                        clearTimeout(checkTimeout)
                        checkTimeout = null
                    }
                    if (subscription) {
                        ScreenOrientation.removeOrientationChangeListener(subscription)
                        subscription = null
                    }
                })
				
                // Проверяем через 3 секунды, изменилась ли ориентация
                // Если нет и мы все еще в портретной ориентации, возможно поворот заблокирован
                checkTimeout = setTimeout(async () => {
                    try {
                        const currentOrientation = await ScreenOrientation.getOrientationAsync()
						
                        if (
                            !orientationChangedRef.current &&
							currentOrientation === initialOrientation &&
							currentOrientation === ScreenOrientation.Orientation.PORTRAIT_UP &&
							!hasShownAlertRef.current
                        ) {
                            hasShownAlertRef.current = true
                            Alert.alert('Пожалуйста, разблокируйте поворот экрана')
                        }
                    } catch (err) {
                        // Игнорируем ошибки при проверке
                    }
                    if (subscription) {
                        ScreenOrientation.removeOrientationChangeListener(subscription)
                        subscription = null
                    }
                }, 3000)
            } catch (err) {
                if (!hasShownAlertRef.current) {
                    hasShownAlertRef.current = true
                    Alert.alert('Пожалуйста, разблокируйте поворот экрана')
                }
            }
        }

        checkRotationLock()

        return () => {
            if (checkTimeout) {
                clearTimeout(checkTimeout)
            }
            if (subscription) {
                ScreenOrientation.removeOrientationChangeListener(subscription)
            }
        }
    }, [])

    useEffect(() => {
        let hasTriggered = false // Защита от дублирования вызова

        const handler = async () => {
            if (hasTriggered) return

            try {
                const orientation = await ScreenOrientation.getOrientationAsync()

                const isLandscape =
					orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
					orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT

                if (isLandscape) {
                    hasTriggered = true
                    onNext()
                }
            } catch (err) {
                console.warn('Error reading orientation:', err)
            }
        }

        const subscription = ScreenOrientation.addOrientationChangeListener(handler)

        return () => {
            ScreenOrientation.removeOrientationChangeListener(subscription)
        }
    }, [onNext])

    useEffect(() => {
        let mounted = true
        let interval: ReturnType<typeof setInterval> | null = null

        const startChecking = async () => {
            interval = setInterval(async () => {
                if (!mounted) {
                    return
                }

                try {
                    const orientation = await ScreenOrientation.getOrientationAsync()

                    if (
                        orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
						orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT
                    ) {
                        if (mounted) {
                            onNext()
                        }
                        if (interval) {
                            clearInterval(interval)
                        }
                    }
                } catch (err) { console.warn('Error reading orientation:', err)
                    // Если ошибка — напр. из-за permissions или unmount
                }
            }, 300)
        }

        startChecking()

        return () => {
            mounted = false
            if (interval) {
                clearInterval(interval)
            }
        }
    }, [onNext])

    return (
        <View className="flex-1 ">
            {/* Close Button */}
					<View className="absolute right-4  z-10">
                <CloseBtn handlePress={handleStop} classNames="h-12 w-12 rounded-2xl" />
            </View>

            {/* Content */}
            <View className="flex-1 justify-center items-center gap-10">
                <Animated.View
                    //style={{ opacity }}
                >
                    <RotatePhoneIcon />
                </Animated.View>

                {/* Description */}
                <Text className="text-h2 text-light-text-200 text-center leading-6 mb-20">
					Поверните телефон горизонтально
                </Text>
            </View>
        </View>
    )
}
