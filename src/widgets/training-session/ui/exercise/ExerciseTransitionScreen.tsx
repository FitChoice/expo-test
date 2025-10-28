/**
 * Exercise Transition Screen (5.6)
 * Показывает переход к следующему упражнению
 * Отображает название следующего упражнения и короткий countdown
 */

import { View, Text } from 'react-native'
import { useState, useEffect } from 'react'
import { LargeNumberDisplay } from '@/shared/ui/LargeNumberDisplay'
import type { Exercise } from '@/entities/training/model/types'

interface ExerciseTransitionScreenProps {
	nextExercise: Exercise
	onComplete: () => void
	countdownDuration?: number // seconds
}

export function ExerciseTransitionScreen({
	nextExercise,
	onComplete,
	countdownDuration = 5,
}: ExerciseTransitionScreenProps) {
	const [countdown, setCountdown] = useState(countdownDuration)

	useEffect(() => {
		if (countdown <= 0) {
			onComplete()
			return
		}

		const timer = setInterval(() => {
			setCountdown((prev) => prev - 1)
		}, 1000)

		return () => clearInterval(timer)
	}, [countdown, onComplete])

	return (
		<View className="bg-background-primary flex-1 items-center justify-center px-6">
			{/* Next Exercise Label */}
			<Text className="text-body-medium text-text-secondary mb-6">
				Следующее упражнение
			</Text>

			{/* Exercise Name */}
			<Text className="text-h2-medium text-text-primary mb-12 text-center">
				{nextExercise.name}
			</Text>

			{/* Countdown */}
			<LargeNumberDisplay value={countdown} size="xlarge" />

			{/* Info */}
			<Text className="text-body-regular text-text-secondary mt-6">
				{nextExercise.sets} × {nextExercise.reps || nextExercise.duration}{' '}
				{nextExercise.reps ? 'повт.' : 'сек'}
			</Text>
		</View>
	)
}
