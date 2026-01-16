/**
 * Exercise Theory/Countdown Screen
 * Показывает видео упражнения (теория или практика) с обратным отсчетом.
 */

import { View, Text } from 'react-native'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { VideoView, useVideoPlayer } from 'expo-video'
import { useEventListener } from 'expo'

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
}

export function ExerciseTheoryScreen({
	exercise,
	currentSet,
	onComplete,
	isVertical,
}: ExerciseTheoryScreenProps) {
	const videoUrl = exercise.video_theory ?? ''
	const player = useVideoPlayer(videoUrl, (p) => {
		p.loop = false
		p.play()
	})

	const videoPlayerContext = useVideoPlayerContext()
	const { remainingTime, reset, pause, start } = useCountdown(0, {
		onComplete,
		autoStart: false,
	})
	const hasInitializedDurationRef = useRef(false)
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

	// Reset init flag if player instance changes (new source)
	useEffect(() => {
		hasInitializedDurationRef.current = false
	}, [player])

	// Initialize countdown once metadata is loaded
	useEventListener(player, 'sourceLoad', () => {
		if (!player || hasInitializedDurationRef.current) return
		if (player.duration > 0) {
			hasInitializedDurationRef.current = true
			reset(Math.ceil(player.duration))
			safeStart()
		}
	})

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
				<VideoView player={player} style={{ flex: 1 }} contentFit="cover" nativeControls={false} />
			</View>
			{renderOverlay()}
		</View>
	)
}
