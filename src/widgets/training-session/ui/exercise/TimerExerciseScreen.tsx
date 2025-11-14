/**
 * Timer Exercise Screen (5.7, 5.8)
 * Упражнения на время (планка, статические упражнения)
 * Показывает таймер обратного отсчета без pose detection
 */

import { View, Text, Pressable, useWindowDimensions } from 'react-native'
import { useState, useEffect } from 'react'
import {  StepProgress } from '@/shared/ui'
import { Exercise } from '@/entities/training'
import { ExerciseWithCounterWrapper } from '@/shared/ui/ExerciseWithCounterWrapper/ExerciseWithCounterWrapper'
import { CountdownDisplay } from './ExerciseExampleCountdownScreen'
import { useVideoPlayer, VideoView } from 'expo-video'
import { CameraView, useCameraPermissions } from 'expo-camera'


interface TimerExerciseScreenProps {
	onComplete: () => void
	exercise: Exercise
}

export function TimerExerciseScreen({

	onComplete, exercise
}: TimerExerciseScreenProps) {

	const [localCurrentSet, setLocalCurrentSet] = useState(0)
	const [cameraKey, setCameraKey] = useState(0)
	const [permission] = useCameraPermissions()

	useEffect(() => {
		setCameraKey(prev => prev + 1)
	}, [exercise.id])

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

	const height = 500
	const { width } = useWindowDimensions()

	return (
		<ExerciseWithCounterWrapper
			countdownInitial={exercise?.duration }
			onComplete={onComplete}
		>
			<>
				{/* Camera View with Video Overlay */}
				<View style={{ height, position: 'relative', width: '100%', overflow: 'hidden' }}>
					{/* Camera View - Background Layer */}
					<CameraView 
						key={`camera-${cameraKey}`}
						style={{ height, width, position: 'absolute', top: 0, left: 0 }} 
						facing="front" 
					/>
					
					{/* Video Preview Window - Bottom Right Corner - Foreground Layer */}
					{exercise.videoUrl && player && (
						<View 
							style={{
								position: 'absolute',
								bottom: 12,
								right: 12,
								width: 100,
								height: 138,
								zIndex: 9,
								elevation: 10,
							}}
						>
							<View style={{
								width: '100%',
								height: '100%',
								overflow: 'hidden',
								backgroundColor: 'black',
								borderRadius: 8,
								shadowColor: '#000',
								shadowOffset: { width: 0, height: 2 },
								shadowOpacity: 0.25,
								shadowRadius: 3.84,
							}}>
								<VideoView
									player={player}
									style={{ width: '100%', height: '100%' }}
									contentFit="cover"
									nativeControls={false}
								/>
							</View>
						</View>
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
