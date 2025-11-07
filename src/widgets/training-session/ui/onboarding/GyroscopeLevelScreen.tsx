/**
 * Gyroscope Level Screen (2.3, 2.4)
 * Четвертый шаг onboarding - калибровка гироскопа
 * Показывает текущий угол наклона телефона и подсказку выровнять его
 */

import { View, Text, Animated, Platform } from 'react-native'
import { Gyroscope } from 'expo-sensors'
import { useState, useEffect, useRef } from 'react'
import { useIsFocused } from '@react-navigation/native'
import { Button, Icon } from '@/shared/ui'
import { DotsProgress } from '@/shared/ui/DotsProgress'
import { CloseBtn } from '@/shared/ui/CloseBtn'
import { router } from 'expo-router'

interface GyroscopeLevelScreenProps {
	onNext: () => void
}

export function GyroscopeLevelScreen({ onNext }: GyroscopeLevelScreenProps) {
	const [angle, setAngle] = useState(0)
	const [isCalibrated, setIsCalibrated] = useState(false)
	const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
	const barRotation = useRef(new Animated.Value(0))
	const barColor = useRef(new Animated.Value(0))
	const isFocused = useIsFocused()

useEffect(() => {
		let subscription: { remove: () => void } | null = null

		const init = async () => {
			// On web Gyroscope may be unavailable; guard with feature detection
			try {
				const available = await Gyroscope.isAvailableAsync()
				setIsAvailable(available)
				if (!available || !isFocused) return

				Gyroscope.setUpdateInterval(100)
				subscription = Gyroscope.addListener((data: { x: number; y: number; z: number }) => {
					const calculatedAngle = Math.round((data.y * 180) / Math.PI)
					setAngle(calculatedAngle)
					Animated.timing(barRotation.current, {
						toValue: calculatedAngle,
						duration: 100,
						useNativeDriver: true,
					}).start()
					if (Math.abs(calculatedAngle) <= 5) {
						setIsCalibrated(true)
						Animated.timing(barColor.current, {
							toValue: 1,
							duration: 300,
							useNativeDriver: false,
						}).start()
					} else {
						setIsCalibrated(false)
						Animated.timing(barColor.current, {
							toValue: 0,
							duration: 300,
							useNativeDriver: false,
						}).start()
					}
				})
			} catch {
				setIsAvailable(false)
			}
		}

		init()

		return () => {
			if (subscription) subscription.remove()
		}
	}, [isFocused])

	const handleStop =() => {
		router.back()
	}

	return (
		<View className="bg-background-primary flex-1">
			{/* Close Button */}
			<View className="absolute right-4 top-12 z-10">
				<CloseBtn handlePress={handleStop} classNames={"h-12 w-12 rounded-2xl"} />
			</View>

			{/* Progress Dots */}
			<View className="absolute left-1/2 top-12 z-10 -translate-x-1/2">
				<DotsProgress total={4} current={3} />
			</View>

			{/* Content */}
			<View className="flex-1 items-center justify-center px-6">
				{/* Gyroscope Visualizer */}
				<View className="mb-12 h-64 w-full items-center justify-center">
					{/* eslint-disable react-hooks/refs */}
					<Animated.View
						style={{
							width: 200,
							height: 4,
							backgroundColor: barColor.current.interpolate({
								inputRange: [0, 1],
								outputRange: ['#FFFFFF', '#C5F680'],
							}),
							borderRadius: 2,
							transform: [
								{
									rotate: barRotation.current.interpolate({
										inputRange: [-90, 90],
										outputRange: ['-90deg', '90deg'],
									}),
								},
							],
						}}
					/>
					{/* eslint-enable react-hooks/refs */}
				</View>

			{/* Angle Display / Web fallback */}
			{isAvailable === false && Platform.OS === 'web' ? (
				<Text className="text-body-regular text-text-secondary mb-12 text-center">
					Датчик гироскопа недоступен в веб. Нажмите «Далее», чтобы продолжить.
				</Text>
			) : (
				<Text className="text-h1-medium text-text-primary mb-12 text-center">{angle}°</Text>
			)}

				{/* Title */}
				<Text className="text-h2-medium text-text-primary mb-4 text-center">
					Проверьте уровень
				</Text>

				{/* Description */}
				<Text className="text-body-regular text-text-secondary mb-12 text-center">
					Поставьте телефон так, чтобы он стоял в прямо или наклон был равен 0
				</Text>
			</View>

			{/* Button */}
			<View className="p-6">
				<Button
					variant="primary"
					onPress={onNext}
					disabled={isAvailable !== false && !isCalibrated}
					className="w-full"
				>
					Далее
				</Button>
			</View>
		</View>
	)
}
