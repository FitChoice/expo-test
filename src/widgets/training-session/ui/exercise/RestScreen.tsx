/**
 * Rest Screen (5.5)
 * Экран отдыха между подходами
 * Показывает обратный отсчет с возможностью пропустить
 */

import { View, Text, useWindowDimensions, Platform } from 'react-native'
import { useEffect, useMemo, useRef, useCallback } from 'react'
import { LargeNumberDisplay, TrainingExerciseProgress } from '@/shared/ui'
import type { ExerciseInfoResponse } from '@/entities/training'
import { useCountdown } from '@/shared/hooks/useCountdown'

import { ExerciseSetInfo } from './components/ExerciseSetInfo'

export interface RestScreenProps {
	onComplete: () => void
	onRestTheoryTrigger?: () => void
	restTheoryTriggerAt?: number | null
	duration: number // seconds
	exercise: ExerciseInfoResponse
	currentSet: number
	currentExerciseIndex: number
	totalExercises: number
	exerciseProgressRatio: number
}

const IS_ANDROID = Platform.OS === 'android'

export function RestScreen({
	onComplete,
	onRestTheoryTrigger,
	restTheoryTriggerAt,
	duration,
	exercise,
	currentSet,
	currentExerciseIndex,
	totalExercises,
	exerciseProgressRatio,
}: RestScreenProps) {
	const { width, height } = useWindowDimensions()
	const isVertical = height > width

	const hasTriggeredRestTheoryRef = useRef(false)
	const handleComplete = useCallback(() => {
		if (hasTriggeredRestTheoryRef.current) return
		onComplete()
	}, [onComplete])

	const { remainingTime } = useCountdown(duration, {
		onComplete: handleComplete,
		autoStart: true,
	})

	useEffect(() => {
		if (
			restTheoryTriggerAt == null ||
			!onRestTheoryTrigger ||
			hasTriggeredRestTheoryRef.current
		) {
			return
		}

		if (remainingTime <= restTheoryTriggerAt) {
			hasTriggeredRestTheoryRef.current = true
			onRestTheoryTrigger()
		}
	}, [remainingTime, restTheoryTriggerAt, onRestTheoryTrigger])

	const displayTime = useMemo(() => {
		const mins = Math.floor(remainingTime / 60)
			.toString()
			.padStart(2, '0')
		const secs = (remainingTime % 60).toString().padStart(2, '0')
		return `${mins}:${secs}`
	}, [remainingTime])

	return (
		<View className={`flex-1 justify-between relative pt-[100px] pb-${IS_ANDROID ? 10 : 2}`}>
			<View>
			<TrainingExerciseProgress
				totalExercises={totalExercises}
				currentExerciseIndex={currentExerciseIndex}
				progressRatio={exerciseProgressRatio}
				isVertical={isVertical}
				className="mb-4"
			/>
			</View>

			<View>
				<View className="mt-6 items-center">
					<Text className="text-h1 text-brand-green-500">Отдых</Text>
				</View>

				<View className={isVertical ? 'mb-2 items-center' : 'items-center'}>
					<LargeNumberDisplay value={displayTime} size="large" />
				</View>
			</View>

			<View>
			<ExerciseSetInfo
				currentSet={currentSet}
				totalSets={exercise.sets ?? 1}
				reps={exercise.reps}
				duration={exercise.duration}
			/>
			</View>
		</View>
	)
}
