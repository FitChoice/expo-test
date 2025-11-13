/**
 * Timer Exercise Screen (5.7, 5.8)
 * Упражнения на время (планка, статические упражнения)
 * Показывает таймер обратного отсчета без pose detection
 */

import { View, Text, Pressable } from 'react-native'
import { useState, useEffect } from 'react'
import { Button, Container, Icon, StepProgress } from '@/shared/ui'
import { Exercise, useTrainingStore } from '@/entities/training'
import { ExerciseWithCounterWrapper } from '@/shared/ui/ExerciseWithCounterWrapper/ExerciseWithCounterWrapper'
import { CountdownDisplay } from './ExerciseCountdownScreen'
import { useVideoPlayer, VideoView } from 'expo-video'

interface TimerExerciseScreenProps {
	onComplete: () => void
	exercise: Exercise
}

export function TimerExerciseScreen({
	onComplete, exercise
}: TimerExerciseScreenProps) {

	const [localCurrentSet, setLocalCurrentSet] = useState(0)

	useEffect(() => {
		const interval = setInterval(() => {
			setLocalCurrentSet((prev) => {
				if (prev >= exercise.sets) {
					return prev
				}
				return prev + 1
			})
		}, 2000)

		return () => clearInterval(interval)
	}, [exercise.sets])

	const player = useVideoPlayer(exercise.videoUrl || '', (player) => {
		player.loop = true
		player.play()
	})

	
	if (!exercise) return null

	return (
		<ExerciseWithCounterWrapper
			//countdownInitial={currentExercise?.duration }
			onComplete={onComplete}
		>
			<>
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
					<CountdownDisplay />

					{/* Set Info */}
					<View className="flex-row px-1 justify-center ">
						<View className="flex-1 basis-0 items-center  ">
							<Text className={`text-[64px] leading-[72px] ${
								localCurrentSet === 0 
									? 'text-light-text-200' 
									: localCurrentSet === exercise.sets 
										? 'text-brand-green-500' 
										: 'text-light-text-200'
							}`}>
								{localCurrentSet}
								<Text className={`text-[32px] leading-[36px] ${
									localCurrentSet === exercise.sets 
										? 'text-brand-green-500' 
										: 'color-[#949494]'
								}`}> / {exercise.sets}</Text>
							</Text>
							<Text className="text-t2 color-[#949494] mb-1">повторения</Text>
						</View>
					</View>
				</View>
			</>
		</ExerciseWithCounterWrapper>

	)
}
