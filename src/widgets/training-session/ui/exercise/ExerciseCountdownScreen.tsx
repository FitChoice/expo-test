/**
 * Exercise Countdown Screen (3.0)
 * Показывает обратный отсчет перед началом упражнения
 * Отображает видео тренера и информацию о подходе
 */

import { View, Text } from 'react-native'
import { VideoView, useVideoPlayer } from 'expo-video'
import { useState, useEffect } from 'react'
import { ControlButton, StepProgress } from '@/shared/ui'
import { LargeNumberDisplay } from '@/shared/ui/LargeNumberDisplay'
import { GreenGradient } from '@/shared/ui/GradientBG'
import type { Exercise } from '@/entities/training/model/types'
import Entypo from '@expo/vector-icons/Entypo'
import AntDesign from '@expo/vector-icons/AntDesign'


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
		<View className="flex-1">
			{/* Gradient Background */}
			<GreenGradient />

			{/* Control Buttons */}
			<View className="absolute left-4 right-4 top-16 z-10 flex-row justify-end gap-2">
				<ControlButton
					icon={<AntDesign name="pause" size={24} color="#FFFFFF" />}
					onPress={onPause}
				/>
				<ControlButton
					icon={<Entypo name="cross" size={24} color="#FFFFFF" />}
					onPress={onStop}
				/>
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

			{/* Step Progress */}
			<View className="w-full px-4 py-4">
				<StepProgress current={0} total={5} />
			</View>

			{/* Exercise Info */}
			<View className="absolute bottom-0 left-0 right-0 p-6">
				{/* Exercise Name */}
				<Text className="text-t1 text-light-text-200 text-center">{exercise.name}</Text>

				{/* Countdown */}
				<View className="mb-6 items-center">
					<LargeNumberDisplay
						value={`00:${countdown.toString().padStart(2, '0')}`}
						size="large"
					/>
				</View>

				{/* Set Info */}
				<View className="flex-row px-1 gap-2">
					<View className="flex-1 basis-0 items-center bg-fill-800 rounded-3xl p-2 ">
						<Text className="text-[64px] leading-[72px] text-light-text-200">
							{currentSet}
							<Text className="text-[32px] leading-[36px] color-[#949494] "> / {exercise.sets}</Text>
						</Text>
						<Text className="text-t2 color-[#949494] mb-1">подход</Text>
					</View>
					<View className="flex-1 basis-0 items-center bg-fill-800 rounded-3xl p-2">
						<Text className="text-[64px] leading-[72px] text-light-text-200">
							{exercise.reps || exercise.duration}
						</Text>
						<Text className="text-t2 color-[#949494] mb-1">повторения</Text>
					</View>
				</View>
			</View>
		</View>
	)
}
