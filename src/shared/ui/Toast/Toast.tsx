/**
 * Toast - уведомление об успехе или ошибке
 * Появляется сверху экрана с анимацией
 */

import React, { useEffect } from 'react'
import { View, Text } from 'react-native'
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    runOnJS,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Icon } from '../Icon'
import type { ToastProps } from './types'

export const Toast: React.FC<ToastProps> = ({
    visible,
    message,
    variant = 'success',
    duration = 3000,
    onHide,
}) => {
    const insets = useSafeAreaInsets()
    const translateY = useSharedValue(-100)
    const opacity = useSharedValue(0)

    useEffect(() => {
        if (visible) {
            translateY.value = withTiming(0, { duration: 300 })
            opacity.value = withTiming(1, { duration: 300 })

            const timer = setTimeout(() => {
                translateY.value = withTiming(-100, { duration: 300 })
                opacity.value = withTiming(0, { duration: 300 }, () => {
                    runOnJS(onHide)()
                })
            }, duration)

            return () => clearTimeout(timer)
        }
        return undefined
    }, [visible, duration, onHide, translateY, opacity])

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        opacity: opacity.value,
    }))

    if (!visible) return null

    const iconName = variant === 'success' ? 'check' : 'warning'
    const iconColor = variant === 'success' ? '#00CF1B' : '#FF2854'

    return (
        <Animated.View
            style={[
                animatedStyle,
                {
                    position: 'absolute',
                    top: insets.top + 12,
                    left: 16,
                    right: 16,
                    zIndex: 9999,
                },
            ]}
        >
            <View className="flex-row items-center gap-3 rounded-2xl bg-fill-800 p-4 shadow-lg">
                <Icon name={iconName} size={24} color={iconColor} />
                <Text className="flex-1 text-t2 text-white">{message}</Text>
            </View>
        </Animated.View>
    )
}
