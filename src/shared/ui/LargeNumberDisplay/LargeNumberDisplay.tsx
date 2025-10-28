/**
 * LargeNumberDisplay - крупный анимированный счетчик
 * Используется для таймеров и повторений
 */

import { Text, View, type ViewProps } from 'react-native'
import { useEffect } from 'react'
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withSpring,
} from 'react-native-reanimated'

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

export function LargeNumberDisplay({
	value,
	unit,
	size = 'large',
	variant = 'default',
	className,
	...props
}: LargeNumberDisplayProps) {
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
		default: 'text-text-primary',
		accent: 'text-brand-purple-500',
		success: 'text-brand-green-500',
	}

	return (
		<View {...props} className={`items-center ${className || ''}`}>
			<Animated.View style={animatedStyle}>
				<Text className={`font-rimma-sans ${sizeStyles[size]} ${colorStyles[variant]}`}>
					{value}
				</Text>
			</Animated.View>
			{unit && <Text className="text-body-regular text-text-secondary mt-2">{unit}</Text>}
		</View>
	)
}
