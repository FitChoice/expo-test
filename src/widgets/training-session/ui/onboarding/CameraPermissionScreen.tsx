/**
 * Camera Permission Screen (2.1)
 * Второй шаг onboarding - запрос разрешения на использование камеры
 */

import { View, Text } from 'react-native'
import { Camera } from 'expo-camera'
import { useState } from 'react'
import { Button, Icon } from '@/shared/ui'
import { DotsProgress } from '@/shared/ui/DotsProgress'

interface CameraPermissionScreenProps {
	onNext: () => void
}

export function CameraPermissionScreen({ onNext }: CameraPermissionScreenProps) {
	const [isRequesting, setIsRequesting] = useState(false)

	const handleRequestPermission = async () => {
		setIsRequesting(true)
		try {
			const { status } = await Camera.requestCameraPermissionsAsync()
			if (status === 'granted') {
				onNext()
			}
		} catch (error) {
			console.error('Failed to request camera permission:', error)
		} finally {
			setIsRequesting(false)
		}
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
				<DotsProgress total={4} current={1} />
			</View>

			{/* Content */}
			<View className="flex-1 items-center justify-center px-6">
				{/* Icon */}
				<View className="mb-12">
					<View className="h-32 w-32 items-center justify-center rounded-3xl bg-brand-purple-500/10">
						<Icon name="camera" size={64} color="#BA9BF7" />
					</View>
				</View>

				{/* Title */}
				<Text className="text-h2-medium text-text-primary mb-4 text-center">
					Конфиденциальность
				</Text>

				{/* Description */}
				<Text className="text-body-regular text-text-secondary mb-12 text-center">
					Камера используется только для анализа движения. Видео не сохраняется и не
					передается
				</Text>
			</View>

			{/* Button */}
			<View className="p-6">
				<Button
					variant="primary"
					onPress={handleRequestPermission}
					disabled={isRequesting}
					className="w-full"
				>
					{isRequesting ? 'Запрос разрешения...' : 'Далее'}
				</Button>
			</View>
		</View>
	)
}
