/**
 * Sound Check Screen (2.0)
 * Первый шаг onboarding - проверка звука
 */

import { View, Text } from 'react-native'
import { useAudioPlayer } from 'expo-audio'
import { useEffect } from 'react'
import { Button, Icon } from '@/shared/ui'
import { DotsProgress } from '@/shared/ui/DotsProgress'

interface SoundCheckScreenProps {
	onNext: () => void
}

export function SoundCheckScreen({ onNext }: SoundCheckScreenProps) {
	// Placeholder for audio player - will be used when adding test sound
	const _player = useAudioPlayer('')

	useEffect(() => {
		// TODO: Add actual test sound asset and play it
		// For now, just simulate sound check
		// Example:
		// const playTestSound = async () => {
		// 	try {
		// 		player.replace(require('@/assets/sounds/test.mp3'))
		// 		player.play()
		// 	} catch (error) {
		// 		console.error('Failed to play test sound:', error)
		// 	}
		// }
		// playTestSound()

		return () => {
			// Cleanup if needed
		}
	}, [])

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
				<DotsProgress total={4} current={0} />
			</View>

			{/* Content */}
			<View className="flex-1 items-center justify-center px-6">
				{/* Icon */}
				<View className="mb-12">
					<View className="h-32 w-32 items-center justify-center rounded-3xl bg-brand-purple-500/10">
						<Icon name="timer" size={64} color="#BA9BF7" />
					</View>
				</View>

				{/* Title */}
				<Text className="text-h2-medium text-text-primary mb-4 text-center">
					Включите звук
				</Text>

				{/* Description */}
				<Text className="text-body-regular text-text-secondary mb-12 text-center">
					Убедитесь, что помощник включена на телефоне, чтобы слышать подсказки и не
					делать лишних повторений
				</Text>
			</View>

			{/* Button */}
			<View className="p-6">
				<Button variant="primary" onPress={onNext} className="w-full">
					Далее
				</Button>
			</View>
		</View>
	)
}
