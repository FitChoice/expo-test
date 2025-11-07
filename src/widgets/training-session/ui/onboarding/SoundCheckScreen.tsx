/**
 * Sound Check Screen (2.0)
 * Первый шаг onboarding - проверка звука
 */

import { View, Text } from 'react-native'
import { useAudioPlayer } from 'expo-audio'
import { useEffect } from 'react'
import { Button, Icon } from '@/shared/ui'
import { DotsProgress } from '@/shared/ui/DotsProgress'
import Svg, { Defs, LinearGradient, RadialGradient, Stop, Rect } from 'react-native-svg'
import SoundIcon from '@/assets/icons/large/sound.svg'
import { GradientBg } from '@/shared/ui/GradientBG'

interface SoundCheckScreenProps {
	onNext: () => void
}

export function SoundCheckScreen({ onNext }: SoundCheckScreenProps) {
	// Placeholder for audio player - will be used when adding test sound
	const _player = useAudioPlayer('')

	// useEffect(() => {
	// 	// TODO: Add actual test sound asset and play it
	// 	// For now, just simulate sound check
	// 	// Example:
	// 	// const playTestSound = async () => {
	// 	// 	try {
	// 	// 		player.replace(require('@/assets/sounds/test.mp3'))
	// 	// 		player.play()
	// 	// 	} catch (error) {
	// 	// 		console.error('Failed to play test sound:', error)
	// 	// 	}
	// 	// }
	// 	// playTestSound()

	// 	return () => {
	// 		// Cleanup if needed
	// 	}
	// }, [])

	return (
		<View className="flex-1 bg-black">
		{/* Gradient Background */}
			<GradientBg />

			{/* Close Button */}
			<View className="absolute right-4 top-12 z-10">
				<Button variant="ghost" onPress={() => {}} className="h-12 w-12 rounded-2xl">
					<Icon name="close" size={24} color="#FFFFFF" />
				</Button>
			</View>

		{/* Progress Dots */}

        <View className="absolute left-1/2 -translate-x-1/2 top-20 z-10">
		<DotsProgress total={4} current={0} variant="onboarding" />
      </View>


		{/* Icon Section */}
		<View className="flex-1 justify-center items-center ">
			<SoundIcon width={194} height={186} />
		</View>

		{/* Text and Button Section */}
		<View className="px-6 pb-6">
			{/* Title */}
			<Text className="text-h2 font-bold text-light-text-100 mb-3 text-left">
				Включите звук
			</Text>

			{/* Description */}
			<Text className="text-t2 text-light-text-500 text-left leading-6 mb-20">
				Убедитесь, что громкость включена на максимуме, чтобы слышать подсказки во время тренировочки
			</Text>

			{/* Button */}
			<Button variant="primary" onPress={onNext} className="w-full">
				Далее
			</Button>
		</View>
		</View>
	)
}
