/**
 * RotateScreen
 * Экран для проверки ориентации устройства перед упражнением
 * Проверяет соответствие ориентации устройства и требуемой ориентации упражнения
 */

import { View, Text, Alert } from 'react-native'
import { useEffect, useRef } from 'react'
import * as ScreenOrientation from 'expo-screen-orientation'
import RotatePhoneIcon from 'src/assets/images/rotate_phone_image.svg'

interface RotateScreenProps {
	isVertical: boolean // true = нужна portrait, false = нужна landscape
	onComplete: () => void
}

export function RotateScreen({ isVertical, onComplete }: RotateScreenProps) {
    const orientationChangedRef = useRef(false)
    const hasShownAlertRef = useRef(false)

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
                checkTimeout = setTimeout(async () => {
                    try {
                        const currentOrientation = await ScreenOrientation.getOrientationAsync()

                        const isPortrait =
							currentOrientation === ScreenOrientation.Orientation.PORTRAIT_UP ||
							currentOrientation === ScreenOrientation.Orientation.PORTRAIT_DOWN

                        if (
                            !orientationChangedRef.current &&
							currentOrientation === initialOrientation &&
							((isVertical && !isPortrait) || (!isVertical && isPortrait)) &&
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
    }, [isVertical])

    useEffect(() => {
        let hasTriggered = false

        const handler = async () => {
            if (hasTriggered) return

            try {
                const orientation = await ScreenOrientation.getOrientationAsync()

                const isPortrait =
					orientation === ScreenOrientation.Orientation.PORTRAIT_UP ||
					orientation === ScreenOrientation.Orientation.PORTRAIT_DOWN

                const isLandscape =
					orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
					orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT

                // Проверяем соответствие: isVertical === true нужна portrait, isVertical === false нужна landscape
                if ((isVertical && isPortrait) || (!isVertical && isLandscape)) {
                    hasTriggered = true
                    onComplete()
                }
            } catch (err) {
                console.warn('Error reading orientation:', err)
            }
        }

        const subscription = ScreenOrientation.addOrientationChangeListener(handler)

        return () => {
            ScreenOrientation.removeOrientationChangeListener(subscription)
        }
    }, [onComplete, isVertical])

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

                    const isPortrait =
						orientation === ScreenOrientation.Orientation.PORTRAIT_UP ||
						orientation === ScreenOrientation.Orientation.PORTRAIT_DOWN

                    const isLandscape =
						orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
						orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT

                    if ((isVertical && isPortrait) || (!isVertical && isLandscape)) {
                        if (mounted) {
                            onComplete()
                        }
                        if (interval) {
                            clearInterval(interval)
                        }
                    }
                } catch (err) {
                    console.warn('Error reading orientation:', err)
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
    }, [onComplete, isVertical])

    return (
        <View className="flex-1 items-center justify-center gap-10">
            <RotatePhoneIcon />
            <Text className="mb-20 text-center text-h2 leading-6 text-light-text-200">
                {isVertical ? 'Поверните телефон вертикально' : 'Поверните телефон горизонтально'}
            </Text>
        </View>
    )
}
