/**
 * Exercise Countdown Screen (3.0)
 * Показывает обратный отсчет перед началом упражнения
 * Отображает видео тренера и информацию о подходе
 */

import { View, Text } from 'react-native'
import { VideoView, useVideoPlayer } from 'expo-video'
import { useState, useEffect } from 'react'
import { Button, Icon } from '@/shared/ui'
import { LargeNumberDisplay } from '@/shared/ui/LargeNumberDisplay'
import type { Exercise } from '@/entities/training/model/types'

interface ExerciseCountdownScreenProps {
	exercise: Exercise
	currentSet: number
	onComplete: () => void
	onPause: () => void
	onStop: () => void
}

export function ExerciseCountdownScreen({
	exercise,
	currentSet,
	onComplete,
	onPause,
	onStop,
}: ExerciseCountdownScreenProps) {
	const [countdown, setCountdown] = useState(5)
	const player = useVideoPlayer(exercise.videoUrl || '', (player) => {
		player.loop = true
		player.play()
	})

	// useEffect(() => {
	// 	const timer = setInterval(() => {
	// 		setCountdown((prev) => {
	// 			if (prev <= 1) {
	// 				clearInterval(timer)
	// 				// Use setTimeout to make the callback async and avoid setState during render
	// 				setTimeout(() => onComplete(), 0)
	// 				return 0
	// 			}
	// 			return prev - 1
	// 		})
	// 	}, 1000)

	// 	return () => clearInterval(timer)
	// }, [onComplete])

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

		{/* Video */}
		<View className="h-2/3">
			{exercise.videoUrl ? (
				<VideoView
					player={player}
					style={{ flex: 1 }}
					contentFit="cover"
					nativeControls={false}
				/>
			) : (
				<View className="bg-brand-dark-300 flex-1" />
			)}
		</View>

			{/* Exercise Info Overlay */}
			<View className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 p-6">
				{/* Exercise Name */}
				<Text className="text-body-medium text-text-primary mb-4">{exercise.name}</Text>

				{/* Countdown */}
				<View className="mb-6 items-center">
					<LargeNumberDisplay
						value={`00:${countdown.toString().padStart(5, '0')}`}
						size="large"
					/>
				</View>

				{/* Set Info */}
				<View className="flex-row justify-center gap-8">
					<View className="items-center">
						<Text className="text-caption-regular text-text-secondary mb-1">подход</Text>
						<Text className="text-h3-medium text-text-primary">
							{currentSet} / {exercise.sets}
						</Text>
					</View>
					<View className="items-center">
						<Text className="text-caption-regular text-text-secondary mb-1">
							повторений
						</Text>
						<Text className="text-h3-medium text-text-primary">
							{exercise.reps || exercise.duration}
						</Text>
					</View>
				</View>
			</View>
		</View>
	)
}
