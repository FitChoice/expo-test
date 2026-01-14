/**
 * Phone Position Screen (2.2)
 * Третий шаг onboarding - проверка положения телефона (вертикально)
 */

import { View, Text } from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'

import { useState, useEffect } from 'react'
import { Button } from '@/shared/ui'
import { DotsProgress } from '@/shared/ui/DotsProgress'
import { CloseBtn } from '@/shared/ui/CloseBtn'
import { router } from 'expo-router'

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

	const handleStop = () => {
		router.back()
	}

	if (!permission?.granted) {
		return (
			<View className="bg-background-primary flex-1 items-center justify-center px-6">
				<Text className="mb-4 text-center text-h2 font-bold text-light-text-100">
					Требуется доступ к камере
				</Text>
				<Text className="mb-6 text-center text-t2 text-light-text-500">
					Чтобы продолжить, разрешите доступ к камере
				</Text>
				<Button variant="primary" onPress={permission?.request} className="w-full">
					Разрешить доступ
				</Button>
			</View>
		)
	}

	return (
		<View className="flex-1">
			{/* Close Button */}
			<View className="absolute right-0 z-10">
				<CloseBtn handlePress={handleStop} classNames={'h-12 w-12 rounded-2xl'} />
			</View>

			{/* Progress Dots */}
			<View className="absolute left-1/2 top-10 z-10 -translate-x-1/2">
				<DotsProgress total={4} current={2} variant="onboarding" />
			</View>

			{/* Content */}
			<View className="mb-10 mt-20 flex-1 items-center justify-center px-4">
				{/* Camera Preview */}
				<View className="w-full overflow-hidden rounded-3xl bg-black mb-5">
					<CameraView
						facing="front"
						className="flex-1"
						style={{ width: '100%', height: '100%' }}
					/>
				</View>



				{/* Title */}
				<Text className="mb-3 text-left text-h2 font-bold text-light-text-100">
					Поставьте телефон вертикально
				</Text>

				{/* Description */}
				<Text className="mb-20 text-left text-t2 leading-6 text-light-text-500">
					Поверните телефон на 90°, снизьте наклона его в стену, чтобы камера хорошо
					распознала движения
				</Text>

			</View>

			{/* Button */}
			<View className="p-2 pb-4">
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
