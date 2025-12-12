/**
 * Exercise Countdown Screen (3.0)
 * Показывает обратный отсчет перед началом упражнения
 * Отображает видео тренера и информацию о подходе
 */

import { View, Text } from 'react-native'
import { useEffect, useRef, useState } from 'react'
import { VideoView, useVideoPlayer } from 'expo-video'

import { LargeNumberDisplay, VideoProgressBar } from '@/shared/ui'

import type { ExerciseInfoResponse } from '@/entities/training/model/types'

import { ExerciseWithCounterWrapper } from '@/shared/ui/ExerciseWithCounterWrapper/ExerciseWithCounterWrapper'
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
    videoUrl
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

    useEffect(() => {
        hasCompletedRef.current = false
        setRemainingTime(0)
        if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current)
        }
    }, [player])

    useEffect(() => {
        if (!player) return

        const startCountdown = (durationSeconds: number) => {
            setRemainingTime(durationSeconds)

            countdownIntervalRef.current = setInterval(() => {
                setRemainingTime((prev) => {
                    if (prev <= 1) {
                        if (!hasCompletedRef.current) {
                            hasCompletedRef.current = true
                            onComplete()
                        }
                        if (countdownIntervalRef.current) {
                            clearInterval(countdownIntervalRef.current)
                        }
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        }

        if (durationOverrideSeconds) {
            startCountdown(durationOverrideSeconds)
            return () => {
                if (countdownIntervalRef.current) {
                    clearInterval(countdownIntervalRef.current)
                }
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
            if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current)
            }
        }
    }, [player, onComplete, durationOverrideSeconds])

    useEffect(() => {
        if (player && videoPlayerContext) {
            const unregister = videoPlayerContext.registerPlayer(player)
            return unregister
        }
        return undefined
    }, [player, videoPlayerContext])

    const minutes = Math.floor(remainingTime / 60)
        .toString()
        .padStart(2, '0')
    const seconds = Math.floor(remainingTime % 60)
        .toString()
        .padStart(2, '0')

    return (
        <>
            {/* Video */}
            <View style={{ height: isVertical ? height : 250 }}>
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
                <View className="absolute bottom-10 left-0 right-0 items-center justify-center px-4">
                    <VideoProgressBar player={player} className="mb-2" />
                    <Text className="text-center text-t1 text-light-text-200">{exercise.name}</Text>
                </View>
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

                        <LargeNumberDisplay
                            value={`${minutes}:${seconds}`}
                            size="large"
                        />
                        {/* Set Info */}

                        <View className="flex-row px-1 gap-2">
                            <View className="flex-1 basis-0 items-center bg-fill-800 rounded-3xl p-2 ">
                                <Text className="text-[64px] leading-[72px] text-light-text-200">
                                    {currentSet}
                                    <Text className="text-[32px] leading-[36px] color-[#949494] "> / {exercise.sets}</Text>
                                </Text>
                                <Text className="text-t2 color-[#949494] mb-1">подход</Text>
                            </View>
                            <View className="flex-1 basis-0 items-center bg-fill-800 rounded-3xl p-2">
                                <Text className="text-[64px] leading-[72px] text-light-text-200">
                                    {exercise.reps || exercise.duration}
                                </Text>
                                <Text className="text-t2 color-[#949494] mb-1">повторения</Text>
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
    const player = useVideoPlayer(videoUrlOverride ?? exercise.video_theory ?? '', (player) => {
        player.loop = false
    })

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
