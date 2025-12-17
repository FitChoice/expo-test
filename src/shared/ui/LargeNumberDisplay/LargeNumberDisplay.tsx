/**
 * LargeNumberDisplay - крупный анимированный счетчик
 * Используется для таймеров и повторений
 */

import { Text, View, type ViewProps } from 'react-native'
import Animated from 'react-native-reanimated'

export interface LargeNumberDisplayProps extends ViewProps {
	/** Отображаемое значение */
	value: number | string
	/** Единица измерения (опционально) */
	unit?: string
	/** Вариант размера */
	size?: 'large' | 'xlarge'
	/** Цвет */
	variant?: 'default' | 'accent' | 'success' | 'horizontal'
}

export function LargeNumberDisplay({
    value,
    unit,
    size = 'large',
    variant = 'default',
    className,
    ...props
}: LargeNumberDisplayProps) {
    const sizeStyles = {
        large: 'text-[64px] leading-[72px]',
        xlarge: 'text-[80px] leading-[88px]',
    }

    const colorStyles = {
        default: 'text-light-text-200',
        horizontal: 'text-light-text-900',
        accent: 'text-brand-purple-500',
        success: 'text-brand-green-500',
    }

    return (
        <View {...props} className={`items-center ${className || ''}`}>
            <Animated.View>
                <Text
                    className={`font-inter font-weight-bold ${sizeStyles[size]} ${colorStyles[variant]}`}
                >
                    {value}
                </Text>
            </Animated.View>
            {unit && <Text className="text-body-regular text-text-secondary mt-2">{unit}</Text>}
        </View>
    )
}
