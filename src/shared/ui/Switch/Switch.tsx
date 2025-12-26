import React, { useRef, useEffect } from 'react'
import { View, TouchableOpacity, Animated } from 'react-native'
import type { SwitchProps } from './types'

/**
 * Switch - переключатель в стиле Apple
 * Контролируемый компонент с анимацией переключения
 */
export const Switch: React.FC<SwitchProps> = ({
	checked,
	onChange,
	disabled = false,
	className = '',
}) => {
	const translateX = useRef(new Animated.Value(checked ? 1 : 0)).current

	useEffect(() => {
		Animated.spring(translateX, {
			toValue: checked ? 1 : 0,
			useNativeDriver: true,
			tension: 100,
			friction: 8,
		}).start()
	}, [checked, translateX])

	const handlePress = () => {
		if (!disabled) {
			onChange(!checked)
		}
	}

	// Размеры Switch (стандартный iOS размер)
	const TRACK_WIDTH = 51
	const TRACK_HEIGHT = 31
	const THUMB_SIZE = 27
	const THUMB_MARGIN = 2
	const THUMB_TRANSLATE_X = TRACK_WIDTH - THUMB_SIZE - THUMB_MARGIN * 2

	return (
		<TouchableOpacity
			onPress={handlePress}
			disabled={disabled}
			activeOpacity={0.8}
			className={className}
		>
			<View
				className={`rounded-full ${
					checked ? 'bg-[#31C859]' : 'bg-[#3F3F3F]'
				} ${disabled ? 'opacity-50' : ''}`}
				style={{
					width: TRACK_WIDTH,
					height: TRACK_HEIGHT,
					justifyContent: 'center',
				}}
			>
				<Animated.View
					className="absolute rounded-full bg-white"
					style={{
						width: THUMB_SIZE,
						height: THUMB_SIZE,
						shadowColor: '#000',
						shadowOffset: { width: 0, height: 2 },
						shadowOpacity: 0.2,
						shadowRadius: 2,
						elevation: 3,
						transform: [
							{
								translateX: translateX.interpolate({
									inputRange: [0, 1],
									outputRange: [THUMB_MARGIN, THUMB_TRANSLATE_X],
								}),
							},
						],
					}}
				/>
			</View>
		</TouchableOpacity>
	)
}
