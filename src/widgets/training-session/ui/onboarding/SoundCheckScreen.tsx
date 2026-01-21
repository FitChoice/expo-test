/**
 * Sound Check Screen (2.0)
 * Первый шаг onboarding - проверка звука
 */

import { View, Text } from 'react-native'
import { useCallback, useEffect } from 'react'
import { Button } from '@/shared/ui'
import { DotsProgress } from '@/shared/ui/DotsProgress'
import SoundIcon from '@/assets/icons/large/sound.svg'
import { CloseBtn } from '@/shared/ui/CloseBtn'
import { router } from 'expo-router'
import { warmUpSpeech } from '@/shared/lib'

interface SoundCheckScreenProps {
	onNext: () => void
}

export function SoundCheckScreen({ onNext }: SoundCheckScreenProps) {
	useEffect(() => {
		warmUpSpeech()
	}, [])

	const handleStop = useCallback(() => {
		router.back()
	}, [])

	return (
		<View className="flex-1">
			{/* Gradient Background */}

			{/* Close Button */}
			<View className="absolute right-0 z-10">
				<CloseBtn handlePress={handleStop} classNames={'h-12 w-12 rounded-2xl'} />
			</View>

			{/* Progress Dots */}

			<View className="absolute left-1/2 top-10 z-10 -translate-x-1/2">
				<DotsProgress total={4} current={0} variant="onboarding" />
			</View>

			{/* Icon Section */}
			<View className="flex-1 items-center justify-center">
				<SoundIcon />
			</View>

			{/* Text and Button Section */}
			<View className="px-6 pb-6">
				{/* Title */}
				<Text className="mb-3 text-left text-h2 font-bold text-light-text-100">
					Включите звук
				</Text>

				{/* Description */}
				<Text className="mb-20 text-left text-t2 leading-6 text-light-text-500">
					Убедитесь, что громкость включена на максимуме, чтобы слышать подсказки во время
					тренировочки
				</Text>

				{/* Button */}
				<Button variant="primary" onPress={onNext} className="w-full">
					Далее
				</Button>
			</View>
		</View>
	)
}
