/**
 * Exercise Countdown Screen (3.0)
 * Показывает обратный отсчет перед началом упражнения
 * Отображает видео тренера и информацию о подходе
 */

import { View, Text } from 'react-native'
import { useCallback, useEffect, useRef, useState } from 'react'
import { VideoView, useVideoPlayer } from 'expo-video'

import { LargeNumberDisplay, VideoProgressBar } from '@/shared/ui'

import type { ExerciseInfoResponse } from '@/entities/training/model/types'

import { ExerciseWithCounterWrapper } from '@/widgets/training-session/ui/ExerciseWithCounterWrapper/ExerciseWithCounterWrapper'
import { useVideoPlayerContext } from '@/shared/hooks/useVideoPlayerContext'
import { VIDEO_SCREEN_HEIGHT as height } from '@/shared/constants/sizes'

interface ExerciseCountdownScreenProps {
	exercise: ExerciseInfoResponse
	currentSet: number
	onComplete: () => void
	isVertical?: boolean
	videoUrlOverride?: string
	durationOverrideSeconds?: number
}

function ExerciseExampleCountdownContent({
	exercise,
	currentSet,
	player,
	isVertical,
	onComplete,
	durationOverrideSeconds,
	videoUrl,
}: {
	exercise: ExerciseInfoResponse
	currentSet: number
	player: ReturnType<typeof useVideoPlayer>
	isVertical?: boolean
	onComplete: () => void
	durationOverrideSeconds?: number
	videoUrl?: string
}) {
	const videoPlayerContext = useVideoPlayerContext()
	const hasCompletedRef = useRef(false)
	const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
	const [remainingTime, setRemainingTime] = useState(0)
	const remainingTimeRef = useRef(0)

	const clearCountdownInterval = useCallback(() => {
		if (countdownIntervalRef.current) {
			clearInterval(countdownIntervalRef.current)
			countdownIntervalRef.current = null
		}
	}, [])

	const startCountdown = useCallback(
		(initialSeconds?: number) => {
			if (initialSeconds !== undefined) {
				setRemainingTime(initialSeconds)
				remainingTimeRef.current = initialSeconds
			}

			clearCountdownInterval()

			countdownIntervalRef.current = setInterval(() => {
				setRemainingTime((prev) => {
					const nextValue = prev <= 1 ? 0 : prev - 1
					remainingTimeRef.current = nextValue

					if (prev <= 1) {
						if (!hasCompletedRef.current) {
							hasCompletedRef.current = true
							onComplete()
						}
						clearCountdownInterval()
						return 0
					}
					return nextValue
				})
			}, 1000)
		},
		[clearCountdownInterval, onComplete]
	)

	const pauseCountdown = useCallback(() => {
		clearCountdownInterval()
	}, [clearCountdownInterval])

	const resumeCountdown = useCallback(() => {
		if (hasCompletedRef.current) return
		if (countdownIntervalRef.current) return
		if (remainingTimeRef.current > 0) {
			startCountdown()
		}
	}, [startCountdown])

	useEffect(() => {
		hasCompletedRef.current = false
		remainingTimeRef.current = 0
		setRemainingTime(0)
		clearCountdownInterval()
	}, [player, clearCountdownInterval])

	useEffect(() => {
		if (!player) return

		if (durationOverrideSeconds) {
			startCountdown(durationOverrideSeconds)
			return () => {
				clearCountdownInterval()
			}
		}

		const waitForReady = setInterval(() => {
			if (player.status === 'readyToPlay' && player.duration > 0) {
				clearInterval(waitForReady)
				startCountdown(Math.ceil(player.duration))
			}
		}, 200)

		return () => {
			clearInterval(waitForReady)
			clearCountdownInterval()
		}
	}, [player, durationOverrideSeconds, startCountdown, clearCountdownInterval])

	useEffect(() => {
		if (player && videoPlayerContext) {
			const unregister = videoPlayerContext.registerPlayer(player)
			return unregister
		}
		return undefined
	}, [player, videoPlayerContext])

	useEffect(() => {
		if (!videoPlayerContext) return undefined
		const unregister = videoPlayerContext.registerPausable({
			pause: pauseCountdown,
			resume: resumeCountdown,
		})
		return unregister
	}, [pauseCountdown, resumeCountdown, videoPlayerContext])

	const minutes = Math.floor(remainingTime / 60)
		.toString()
		.padStart(2, '0')
	const seconds = Math.floor(remainingTime % 60)
		.toString()
		.padStart(2, '0')

	return (
		<>
			{/* Video */}
			<View style={{ height: isVertical ? height : '100%' }}>
				{videoUrl ? (
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
			{!isVertical && (
				<>
					<View className="absolute left-0 right-0 top-10 items-center justify-center px-4">
						<VideoProgressBar player={player} className="mb-2" />
						<Text className="text-center text-t1 text-light-text-200">
							{exercise.name}
						</Text>
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
								<LargeNumberDisplay
									value={`${minutes}:${seconds}`}
									size="large"
									variant="horizontal"
								/>
							</View>
							<View className="flex-[0.5] basis-0 items-center rounded-3xl bg-fill-800 p-1">
								<Text className="text-[64px] leading-[72px] text-light-text-200">
									{exercise.reps || exercise.duration}
								</Text>
								<Text className="mb-1 text-t2 color-[#949494]">повторения</Text>
							</View>
						</View>
					</View>
				</>
			)}

			{/* Exercise Info */}
			<View className="p-5">
				{/* Exercise Name */}
				{isVertical ? (
					<>
						<Text className="mb-2 text-center text-t1 text-light-text-200">
							{exercise.name}
						</Text>
						<View className="px-4">
							<VideoProgressBar player={player} />
						</View>

						<LargeNumberDisplay value={`${minutes}:${seconds}`} size="large" />
						{/* Set Info */}

						<View className="flex-row gap-2 px-1">
							<View className="flex-1 basis-0 items-center rounded-3xl bg-fill-800 p-2">
								<Text className="text-[64px] leading-[72px] text-light-text-200">
									{currentSet}
									<Text className="text-[32px] leading-[36px] color-[#949494]">
										{' '}
										/ {exercise.sets}
									</Text>
								</Text>
								<Text className="mb-1 text-t2 color-[#949494]">подход</Text>
							</View>
							<View className="flex-1 basis-0 items-center rounded-3xl bg-fill-800 p-2">
								<Text className="text-[64px] leading-[72px] text-light-text-200">
									{exercise.reps || exercise.duration}
								</Text>
								<Text className="mb-1 text-t2 color-[#949494]">повторения</Text>
							</View>
						</View>
					</>
				) : (
					<></>
				)}
			</View>
		</>
	)
}

export function ExerciseTheoryScreen({
	exercise,
	currentSet,
	onComplete,
	isVertical,
	videoUrlOverride,
	durationOverrideSeconds,
}: ExerciseCountdownScreenProps) {
	const player = useVideoPlayer(
		videoUrlOverride ?? exercise.video_theory ?? '',
		(player) => {
			player.loop = false
		}
	)

	useEffect(() => {
		if (player) {
			player.play()
		}
	}, [player])

	return (
		<ExerciseWithCounterWrapper>
			<ExerciseExampleCountdownContent
				exercise={exercise}
				currentSet={currentSet}
				player={player}
				isVertical={isVertical}
				onComplete={onComplete}
				videoUrl={videoUrlOverride ?? exercise.video_theory}
				durationOverrideSeconds={durationOverrideSeconds}
			/>
		</ExerciseWithCounterWrapper>
	)
}
