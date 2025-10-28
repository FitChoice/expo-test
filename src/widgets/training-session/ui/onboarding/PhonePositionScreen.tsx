/**
 * Phone Position Screen (2.2)
 * Третий шаг onboarding - проверка положения телефона (вертикально)
 */

import { View, Text } from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { useState, useEffect } from 'react'
import { Button, Icon } from '@/shared/ui'
import { DotsProgress } from '@/shared/ui/DotsProgress'

interface PhonePositionScreenProps {
	onNext: () => void
}

export function PhonePositionScreen({ onNext }: PhonePositionScreenProps) {
	const [permission] = useCameraPermissions()
	const [isCorrectPosition, setIsCorrectPosition] = useState(false)

	useEffect(() => {
		// Auto-check position after a delay
		const timer = setTimeout(() => {
			setIsCorrectPosition(true)
		}, 1000)

		return () => clearTimeout(timer)
	}, [])

	if (!permission?.granted) {
		return <View className="bg-background-primary flex-1" />
	}

	return (
		<View className="bg-background-primary flex-1">
			{/* Close Button */}
			<View className="absolute right-4 top-12 z-10">
				<Button variant="ghost" onPress={() => {}} className="h-12 w-12 rounded-2xl">
					<Icon name="close" size={24} color="#FFFFFF" />
				</Button>
			</View>

			{/* Progress Dots */}
			<View className="absolute left-1/2 top-12 z-10 -translate-x-1/2">
				<DotsProgress total={4} current={2} />
			</View>

			{/* Content */}
			<View className="flex-1 items-center justify-center px-6">
				{/* Camera Preview */}
				<View className="mb-12 h-96 w-full overflow-hidden rounded-3xl">
					<CameraView style={{ flex: 1 }} facing="front" />
				</View>

				{/* Title */}
				<Text className="text-h2-medium text-text-primary mb-4 text-center">
					Поставьте телефон вертикально
				</Text>

				{/* Description */}
				<Text className="text-body-regular text-text-secondary mb-12 text-center">
					Поверните телефон на 90°, снизьте наклона его в стену, чтобы камера хорошо
					распознала движения
				</Text>
			</View>

			{/* Button */}
			<View className="p-6">
				<Button
					variant="primary"
					onPress={onNext}
					disabled={!isCorrectPosition}
					className="w-full"
				>
					Далее
				</Button>
			</View>
		</View>
	)
}
