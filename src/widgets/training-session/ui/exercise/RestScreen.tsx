/**
 * Rest Screen (5.5)
 * Экран отдыха между подходами
 * Показывает обратный отсчет с возможностью пропустить
 */

import { View, Text, useWindowDimensions } from 'react-native'
import { useMemo } from 'react'
import { LargeNumberDisplay } from '@/shared/ui'
import type { ExerciseInfoResponse } from '@/entities/training'
import { useCountdown } from '@/shared/hooks/useCountdown'

import { ExerciseSetInfo } from './components/ExerciseSetInfo'

interface RestScreenProps {
	onComplete: () => void
	duration: number // seconds
	exercise: ExerciseInfoResponse
	currentSet: number
}

export function RestScreen({
	onComplete,
	duration,
	exercise,
	currentSet,
}: RestScreenProps) {
	const { width, height } = useWindowDimensions()
	const isVertical = height > width

	const { remainingTime } = useCountdown(duration, {
		onComplete,
		autoStart: true,
	})

	const displayTime = useMemo(() => {
		const mins = Math.floor(remainingTime / 60)
			.toString()
			.padStart(2, '0')
		const secs = (remainingTime % 60).toString().padStart(2, '0')
		return `${mins}:${secs}`
	}, [remainingTime])

	return (
		<View className="padding-4 flex-1 items-center justify-center gap-10 pb-5 pt-5">
			<View className="mt-6 items-center">
				<Text className="text-h1 text-brand-green-500">Отдых</Text>
			</View>

			<View className={isVertical ? 'mb-2 items-center' : 'items-center'}>
				<LargeNumberDisplay value={displayTime} size="large" />
			</View>

			<ExerciseSetInfo
				currentSet={currentSet}
				totalSets={exercise.sets ?? 1}
				reps={exercise.reps}
				duration={exercise.duration}
			/>
		</View>
	)
}
