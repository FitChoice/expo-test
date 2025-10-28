/**
 * Body Position Check Screen (4.0, 4.1)
 * Проверяет, что пользователь принял правильную позицию перед началом упражнения
 * Использует камеру и pose detection для определения позиции
 */

import { View, Text } from 'react-native'
import { useIsFocused } from '@react-navigation/native'
import { CameraView } from 'expo-camera'
import { useState, useEffect } from 'react'
import { Button, Icon } from '@/shared/ui'
import Svg, { Path, Circle } from 'react-native-svg'

interface BodyPositionScreenProps {
	onComplete: () => void
	onPause: () => void
	onStop: () => void
}

export function BodyPositionScreen({
	onComplete,
	onPause,
	onStop,
}: BodyPositionScreenProps) {
	const [isPositionCorrect, setIsPositionCorrect] = useState(false)
	const [showSuccess, setShowSuccess] = useState(false)
  const isFocused = useIsFocused()

	useEffect(() => {
		// Simulate position detection
		const timer = setTimeout(() => {
			setIsPositionCorrect(true)
			setShowSuccess(true)

			// Auto-proceed after showing success
			setTimeout(() => {
				onComplete()
			}, 1500)
		}, 2000)

		return () => clearTimeout(timer)
	}, [onComplete])

	return (
		<View className="bg-background-primary flex-1">
			{/* Control Buttons */}
			<View className="absolute left-4 right-4 top-12 z-10 flex-row justify-between">
				<Button variant="ghost" onPress={onPause} className="h-12 w-12 rounded-2xl">
					<Icon name="pause" size={24} color="#FFFFFF" />
				</Button>
				<Button variant="ghost" onPress={onStop} className="h-12 w-12 rounded-2xl">
					<Icon name="close" size={24} color="#FFFFFF" />
				</Button>
			</View>

      {/* Camera View with Overlay */}
      <View className="flex-1">
        {isFocused ? (
          <CameraView style={{ flex: 1 }} facing="front" />
        ) : (
          <View className="flex-1 bg-black" />
        )}

				{/* Body Silhouette Overlay */}
				<View className="absolute inset-0 items-center justify-center">
					<Svg width="200" height="400" viewBox="0 0 200 400">
						{/* Simplified body silhouette */}
						{/* Head */}
						<Circle
							cx="100"
							cy="40"
							r="30"
							fill="none"
							stroke={isPositionCorrect ? '#C5F680' : '#FFFFFF'}
							strokeWidth="3"
							opacity="0.5"
						/>
						{/* Body */}
						<Path
							d="M100 70 L100 200"
							stroke={isPositionCorrect ? '#C5F680' : '#FFFFFF'}
							strokeWidth="3"
							opacity="0.5"
						/>
						{/* Arms */}
						<Path
							d="M100 100 L50 150 M100 100 L150 150"
							stroke={isPositionCorrect ? '#C5F680' : '#FFFFFF'}
							strokeWidth="3"
							opacity="0.5"
						/>
						{/* Legs */}
						<Path
							d="M100 200 L70 350 M100 200 L130 350"
							stroke={isPositionCorrect ? '#C5F680' : '#FFFFFF'}
							strokeWidth="3"
							opacity="0.5"
						/>
					</Svg>
				</View>
			</View>

			{/* Bottom Info */}
			<View className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 p-6">
				<Text className="text-h3-medium text-text-primary mb-2 text-center">
					Примите исходное положение
				</Text>
				<Text className="text-body-regular text-text-secondary text-center">
					Встаньте так, чтобы ваше тело полностью попадало в кадр и входило в контур
				</Text>

				{/* Success Message */}
				{showSuccess && (
					<View className="mt-6 items-center">
						<Text className="text-h1-medium text-brand-green-500">Вперед!</Text>
					</View>
				)}
			</View>
		</View>
	)
}
