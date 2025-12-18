/**
 * TypingIndicator - индикатор печати AI
 * Точное соответствие макету: анимированные точки или стриминговый текст
 */

import React, { useEffect, useMemo } from 'react'
import { View, Text, Animated, Easing } from 'react-native'

interface TypingIndicatorProps {
	content?: string
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ content }) => {
	// Создаём анимированные значения с useMemo для стабильности
	const animatedValues = useMemo(
		() => ({
			dot1: new Animated.Value(0.3),
			dot2: new Animated.Value(0.3),
			dot3: new Animated.Value(0.3),
		}),
		[]
	)

	useEffect(() => {
		if (content) return // Не анимируем если есть стриминговый контент

		const createDotAnimation = (dot: Animated.Value, delay: number) => {
			return Animated.loop(
				Animated.sequence([
					Animated.delay(delay),
					Animated.timing(dot, {
						toValue: 1,
						duration: 400,
						easing: Easing.ease,
						useNativeDriver: true,
					}),
					Animated.timing(dot, {
						toValue: 0.3,
						duration: 400,
						easing: Easing.ease,
						useNativeDriver: true,
					}),
				])
			)
		}

		const anim1 = createDotAnimation(animatedValues.dot1, 0)
		const anim2 = createDotAnimation(animatedValues.dot2, 150)
		const anim3 = createDotAnimation(animatedValues.dot3, 300)

		anim1.start()
		anim2.start()
		anim3.start()

		return () => {
			anim1.stop()
			anim2.stop()
			anim3.stop()
		}
	}, [content, animatedValues])

	if (content) {
		// Показываем стриминговый текст
		return (
			<View className="items-start">
				<Text
					className="text-light-text-100"
					style={{
						fontFamily: 'Inter',
						fontWeight: '400',
						fontSize: 15,
						lineHeight: 22,
					}}
				>
					{content}
					<Text className="text-brand-green-500">▍</Text>
				</Text>
			</View>
		)
	}

	// Анимированные точки как в макете
	const dots = [animatedValues.dot1, animatedValues.dot2, animatedValues.dot3]

	return (
		<View className="flex-row items-center py-2">
			{dots.map((dot, index) => (
				<Animated.View
					key={index}
					className="mx-0.5 h-2 w-2 rounded-full bg-light-text-200"
					style={{
						opacity: dot,
					}}
				/>
			))}
		</View>
	)
}
