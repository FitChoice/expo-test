/**
 * Timer Exercise Screen (5.7, 5.8)
 * Упражнения на время (планка, статические упражнения)
 * Показывает таймер обратного отсчета без pose detection
 */

import { View, Text, Pressable } from 'react-native'
import { CameraView } from 'expo-camera'
import { useState, useEffect, useRef } from 'react'
import { Button, Icon } from '@/shared/ui'
import { LargeNumberDisplay } from '@/shared/ui/LargeNumberDisplay'
import { useTrainingStore } from '@/entities/training'

interface TimerExerciseScreenProps {
	onComplete: () => void
	onPause: () => void
	onStop: () => void
}

export function TimerExerciseScreen({
	onComplete,
	onPause,
	onStop,
}: TimerExerciseScreenProps) {
	const training = useTrainingStore((state) => state.training)
	const currentExerciseIndex = useTrainingStore((state) => state.currentExerciseIndex)
	const currentSet = useTrainingStore((state) => state.currentSet)

	const currentExercise = training?.exercises[currentExerciseIndex]
	const duration = currentExercise?.duration || 0

	const [timeRemaining, setTimeRemaining] = useState(duration)
	const [isTrainerVisible, setIsTrainerVisible] = useState(true)
	const timerRef = useRef<NodeJS.Timeout | null>(null)

	const progress = duration > 0 ? 1 - timeRemaining / duration : 0

	// Timer countdown
	useEffect(() => {
		if (timeRemaining <= 0) {
			onComplete()
			return
		}

		timerRef.current = setInterval(() => {
			setTimeRemaining((prev) => Math.max(0, prev - 1))
		}, 1000)

		return () => {
			if (timerRef.current) {
				clearInterval(timerRef.current)
			}
		}
	}, [timeRemaining, onComplete])

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60)
		const secs = seconds % 60
		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
	}

	if (!currentExercise) return null

	return (
		<View className="bg-background-primary flex-1">
			{/* Camera View */}
			<View className="flex-1">
				<CameraView style={{ flex: 1 }} facing="front">
					{/* No pose overlay for timer exercises */}
				</CameraView>
			</View>

			{/* Control Buttons - Top */}
			<View className="absolute left-4 right-4 top-12 flex-row justify-between">
				<Button
					variant="ghost"
					onPress={onPause}
					className="h-12 w-12 rounded-2xl bg-black/30"
				>
					<Icon name="pause" size={24} color="#FFFFFF" />
				</Button>
				<Button
					variant="ghost"
					onPress={onStop}
					className="h-12 w-12 rounded-2xl bg-black/30"
				>
					<Icon name="close" size={24} color="#FFFFFF" />
				</Button>
			</View>

			{/* Progress Bar - Left */}
			<View className="absolute bottom-32 left-4 top-32">
				<View className="bg-brand-dark-300 h-full w-2 overflow-hidden rounded-full">
					<View
						className="w-full rounded-full bg-brand-green-500"
						style={{ height: `${progress * 100}%`, position: 'absolute', bottom: 0 }}
					/>
				</View>
			</View>

			{/* Trainer Preview - Bottom Right */}
			{isTrainerVisible && currentExercise.videoUrl && (
				<Pressable
					onPress={() => setIsTrainerVisible(false)}
					className="absolute bottom-32 right-4 h-32 w-24 overflow-hidden rounded-2xl bg-black/50"
				>
					{/* TODO: Add Video component for trainer preview */}
					<View className="flex-1 items-center justify-center">
						<Text className="text-caption-regular text-white">Trainer</Text>
					</View>
				</Pressable>
			)}

			{/* Bottom Info Panel */}
			<View className="bg-brand-dark-400/95 absolute bottom-0 left-0 right-0 p-6">
				{/* Exercise Name */}
				<Text className="text-body-medium text-text-primary mb-4 text-center">
					{currentExercise.name}
				</Text>

				{/* Timer Countdown */}
				<View className="mb-6 items-center">
					<LargeNumberDisplay value={formatTime(timeRemaining)} size="xlarge" />
				</View>

				{/* Set Info */}
				<Text className="text-body-regular text-text-secondary text-center">
					Подход {currentSet} / {currentExercise.sets}
				</Text>
			</View>
		</View>
	)
}
