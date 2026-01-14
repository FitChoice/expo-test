/**
 * Exercise Theory/Countdown Screen
 * Показывает видео упражнения (теория или практика) с обратным отсчетом.
 */

import { View, Text } from 'react-native'
import { useEffect, useMemo } from 'react'
import { VideoView, useVideoPlayer } from 'expo-video'

import { LargeNumberDisplay, VideoProgressBar } from '@/shared/ui'
import type { ExerciseInfoResponse } from '@/entities/training'
import { useVideoPlayerContext } from '@/shared/hooks/useVideoPlayerContext'
import { useCountdown } from '@/shared/hooks/useCountdown'
import { VIDEO_SCREEN_HEIGHT as height } from '@/shared/constants/sizes'

import { ExerciseSetInfo } from './components/ExerciseSetInfo'

interface ExerciseTheoryScreenProps {
	exercise: ExerciseInfoResponse
	currentSet: number
	onComplete: () => void
	isVertical?: boolean
	videoUrlOverride?: string
	durationOverrideSeconds?: number
}

export function ExerciseTheoryScreen({
	exercise,
	currentSet,
	onComplete,
	isVertical,
	videoUrlOverride,
	durationOverrideSeconds,
}: ExerciseTheoryScreenProps) {
	const videoUrl = videoUrlOverride ?? exercise.video_theory
	const player = useVideoPlayer(videoUrl ?? '', (p) => {
		p.loop = false
		p.play()
	})

	const videoPlayerContext = useVideoPlayerContext()
	const { remainingTime, reset, pause, start } = useCountdown(0, {
		onComplete,
		autoStart: true,
	})

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
				resume: start,
			})
		}
		return undefined
	}, [pause, start, videoPlayerContext])

	// Handle countdown initialization based on video duration or override
	useEffect(() => {
		if (!player) return

		if (durationOverrideSeconds !== undefined) {
			reset(durationOverrideSeconds)
			return
		}

		const checkDuration = setInterval(() => {
			if (player.status === 'readyToPlay' && player.duration > 0) {
				reset(Math.ceil(player.duration))
				clearInterval(checkDuration)
			}
		}, 200)

		return () => clearInterval(checkDuration)
	}, [player, durationOverrideSeconds, reset])

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
					<Text className="mb-2 text-center text-t1 text-light-text-200">{exercise.name}</Text>
					<View className="px-4">
						<VideoProgressBar player={player} />
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
					<VideoProgressBar player={player} className="mb-2" />
					<Text className="text-center text-t1 text-light-text-200">{exercise.name}</Text>
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
				{videoUrl ? (
					<VideoView player={player} style={{ flex: 1 }} contentFit="cover" nativeControls={false} />
				) : (
					<View className="bg-brand-dark-300 flex-1" />
				)}
			</View>
			{renderOverlay()}
		</View>
	)
}
