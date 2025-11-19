/**
 * LargeNumberDisplay - крупный анимированный счетчик
 * Используется для таймеров и повторений
 */

import { Text, View, type ViewProps, Platform } from 'react-native'
import { useEffect } from 'react'

export interface LargeNumberDisplayProps extends ViewProps {
	/** Отображаемое значение */
	value: number | string
	/** Единица измерения (опционально) */
	unit?: string
	/** Вариант размера */
	size?: 'large' | 'xlarge'
	/** Цвет */
	variant?: 'default' | 'accent' | 'success'
}

// Условный импорт Reanimated только для нативных платформ
let Animated: any
let useSharedValue: any
let useAnimatedStyle: any
let withSpring: any

if (Platform.OS !== 'web') {
    const Reanimated = require('react-native-reanimated')
    Animated = Reanimated.default
    useSharedValue = Reanimated.useSharedValue
    useAnimatedStyle = Reanimated.useAnimatedStyle
    withSpring = Reanimated.withSpring
}

export function LargeNumberDisplay({
    value,
    unit,
    size = 'large',
    variant = 'default',
    className,
    ...props
}: LargeNumberDisplayProps) {
    // На вебе используем простую версию без анимации
    if (Platform.OS === 'web') {
        const sizeStyles = {
            large: 'text-[64px] leading-[72px]',
            xlarge: 'text-[80px] leading-[88px]',
        }

        const colorStyles = {
            default: 'text-light-text-200',
            accent: 'text-brand-purple-500',
            success: 'text-brand-green-500',
        }

        return (
            <View {...props} className={`items-center ${className || ''}`}>
                <View>
                    <Text className={`font-inter font-weight-bold ${sizeStyles[size]} ${colorStyles[variant]}`}>
                        {value}
                    </Text>
                </View>
                {unit && <Text className="text-body-regular text-text-secondary mt-2">{unit}</Text>}
            </View>
        )
    }

    // Нативная версия с анимацией
    const scale = useSharedValue(1)

    useEffect(() => {
        // Animate on value change
        scale.value = withSpring(1.1, { damping: 10 }, () => {
            scale.value = withSpring(1, { damping: 10 })
        })
    }, [value, scale])

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }))

    const sizeStyles = {
        large: 'text-[64px] leading-[72px]',
        xlarge: 'text-[80px] leading-[88px]',
    }

    const colorStyles = {
        default: 'text-light-text-200',
        accent: 'text-brand-purple-500',
        success: 'text-brand-green-500',
    }

    return (
        <View {...props} className={`items-center ${className || ''}`}>
            <Animated.View style={animatedStyle}>
                <Text className={`font-inter font-weight-bold ${sizeStyles[size]} ${colorStyles[variant]}`}>
                    {value}
                </Text>
            </Animated.View>
            {unit && <Text className="text-body-regular text-text-secondary mt-2">{unit}</Text>}
        </View>
    )
}
