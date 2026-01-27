/**
 * Exercise Theory/Countdown Screen
 * Показывает видео упражнения (теория) с обратным отсчетом.
 * Переход на следующий экран происходит по событию playToEnd с fallback polling.
 */

import { View, Text } from 'react-native'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { VideoView, useVideoPlayer } from 'expo-video'
import { useEventListener } from 'expo'

import { LargeNumberDisplay, TrainingExerciseProgress } from '@/shared/ui'
import type { ExerciseInfoResponse } from '@/entities/training'
import { useVideoPlayerContext } from '@/shared/hooks/useVideoPlayerContext'
import { useCountdown } from '@/shared/hooks/useCountdown'
import { VIDEO_SCREEN_HEIGHT as height } from '@/shared/constants/sizes'
import { useBeepSound } from '@/shared/lib'

import { ExerciseSetInfo } from './components/ExerciseSetInfo'

interface ExerciseTheoryScreenProps {
	exercise: ExerciseInfoResponse
	currentSet: number
	onComplete: () => void
	isVertical?: boolean
	currentExerciseIndex: number
	totalExercises: number
	exerciseProgressRatio: number
	type?: string
	maxDuration?: number
}

export function ExerciseTheoryScreen({
	exercise,
	currentSet,
	onComplete,
	isVertical,
	currentExerciseIndex,
	totalExercises,
	exerciseProgressRatio, type,
	maxDuration
}: ExerciseTheoryScreenProps) {
	const videoUrl = type ? exercise.video_practice : exercise.video_theory
	const player = useVideoPlayer(videoUrl, (p) => {
		p.loop = !!maxDuration
		p.play()
	})

	const videoPlayerContext = useVideoPlayerContext()
	const { playBeep } = useBeepSound()
	
	// Guard against double completion calls
	const hasCompletedRef = useRef(false)
	const hasInitializedDurationRef = useRef(false)
	const lastBeepSecondRef = useRef<number | null>(null)

	const triggerComplete = useCallback(() => {
		if (hasCompletedRef.current) return
		hasCompletedRef.current = true
		onComplete()
	}, [onComplete])

	// Countdown only for UI display (no onComplete - transition handled by playToEnd)
	// For restTheory (maxDuration) we use countdown to trigger completion
	const { remainingTime, reset, pause, start } = useCountdown(0, {
		autoStart: false,
		onComplete: maxDuration ? triggerComplete : undefined,
	})

	const safeStart = useCallback(() => {
		if (!hasInitializedDurationRef.current) return
		start()
	}, [start])

	// Register player in context for global pause/resume
	useEffect(() => {
		if (player && videoPlayerContext) {
			return videoPlayerContext.registerPlayer(player)
		}
		return undefined
	}, [player, videoPlayerContext])

	// Register pausable handlers for countdown
	useEffect(() => {
		if (videoPlayerContext) {
			return videoPlayerContext.registerPausable({
				pause,
				resume: safeStart,
			})
		}
		return undefined
	}, [pause, safeStart, videoPlayerContext])

	// Reset refs when player instance changes (new video source)
	useEffect(() => {
		hasInitializedDurationRef.current = false
		hasCompletedRef.current = false
	}, [player])

	// Primary completion trigger: playToEnd event
	useEventListener(player, 'playToEnd', triggerComplete)

	// Initialize countdown when player is ready (statusChange is more reliable than sourceLoad)
	useEventListener(player, 'statusChange', ({ status }) => {
		if (status === 'readyToPlay' && !hasInitializedDurationRef.current && player.duration > 0) {
			hasInitializedDurationRef.current = true
			const videoDuration = Math.ceil(player.duration)
			const duration = maxDuration ? Math.min(videoDuration, maxDuration) : videoDuration
			reset(duration)
			safeStart()
		}
	})

	// Fallback polling: some devices may not fire playToEnd reliably
	useEffect(() => {
		const interval = setInterval(() => {
			if (
				!hasCompletedRef.current &&
				player.duration > 0 &&
				player.currentTime >= player.duration - 0.1
			) {
				triggerComplete()
			}
		}, 500)
		return () => clearInterval(interval)
	}, [player, triggerComplete])

	useEffect(() => {
		if (!type) {
			lastBeepSecondRef.current = null
			return
		}
		if (remainingTime > 3) {
			lastBeepSecondRef.current = null
			return
		}
		if (remainingTime > 0 && lastBeepSecondRef.current !== remainingTime) {
			lastBeepSecondRef.current = remainingTime
			playBeep()
		}
	}, [playBeep, remainingTime, type])

	if (!videoUrl) {
		throw new Error('Exercise theory video is required but missing.')
	}

	const displayTime = useMemo(() => {
		const mins = Math.floor(remainingTime / 60)
			.toString()
			.padStart(2, '0')
		const secs = (remainingTime % 60).toString().padStart(2, '0')
		return `${mins}:${secs}`
	}, [remainingTime])

	const renderOverlay = () => {
		if (isVertical) {
			return (
			<View className="p-5">
				<Text className="text-center text-t1 text-light-text-200">{exercise.name}</Text>

				<View className="items-center justify-center py-2">
						<TrainingExerciseProgress
							totalExercises={totalExercises}
							currentExerciseIndex={currentExerciseIndex}
							progressRatio={exerciseProgressRatio}
							isVertical={isVertical}
						/>
					</View>

					<LargeNumberDisplay value={displayTime} size="large" />
					<ExerciseSetInfo
						currentSet={currentSet}
						totalSets={exercise.sets ?? 1}
						reps={exercise.reps}
						duration={exercise.duration}
					/>
				</View>
			)
		}

		return (
			<>
				<View className="absolute left-0 right-0 top-10 items-center justify-center px-4">
					<Text className="text-center text-t1 text-light-text-200">{exercise.name}</Text>
					<TrainingExerciseProgress
						totalExercises={totalExercises}
						currentExerciseIndex={currentExerciseIndex}
						progressRatio={exerciseProgressRatio}
						isVertical={isVertical}
						className="mb-4"
					/>


				</View>

				<View className="absolute bottom-0 flex-row gap-2 px-1 pb-2">
					<View className="flex-1 basis-0 flex-row items-end gap-2">
						<View className="flex-[0.5] basis-0 items-center rounded-3xl bg-fill-800 p-1">
							<Text className="text-[64px] leading-[72px] text-light-text-200">
								{currentSet}
								<Text className="text-[32px] leading-[36px] color-[#949494]">
									{' '}
									/ {exercise.sets}
								</Text>
							</Text>
							<Text className="mb-1 text-t2 color-[#949494]">подход</Text>
						</View>
						<View className="flex-1 basis-0 items-center">
							<LargeNumberDisplay value={displayTime} size="large" variant="horizontal" />
						</View>
						<View className="flex-[0.5] basis-0 items-center rounded-3xl bg-fill-800 p-1">
							<Text className="text-[64px] leading-[72px] text-light-text-200">
								{exercise.reps || exercise.duration}
							</Text>
							<Text className="mb-1 text-t2 color-[#949494]">
								{exercise.duration ? 'секунд' : 'повторений'}
							</Text>
						</View>
					</View>
				</View>
			</>
		)
	}

	return (
		<View className="flex-1">
			<View style={{ height: isVertical ? height : '100%' }}>
				<VideoView player={player} style={{ flex: 1, borderRadius: 20 }} contentFit="cover" nativeControls={false} />
			</View>
			{renderOverlay()}
		</View>
	)
}
