/**
 * Exercise Countdown Screen (3.0)
 * Показывает обратный отсчет перед началом упражнения
 * Отображает видео тренера и информацию о подходе
 */

import { View, Text } from 'react-native'
import { useEffect } from 'react'
import { VideoView, useVideoPlayer } from 'expo-video'

import {  StepProgress } from '@/shared/ui'
import { LargeNumberDisplay } from '@/shared/ui/LargeNumberDisplay'

import type { Exercise } from '@/entities/training/model/types'

import {
    ExerciseWithCounterWrapper,
    useCountdown,
    useVideoPlayerContext
} from '@/shared/ui/ExerciseWithCounterWrapper/ExerciseWithCounterWrapper'
import { VIDEO_SCREEN_HEIGHT as height } from '@/shared/constants/sizes'

interface ExerciseCountdownScreenProps {
	exercise: Exercise
	currentSet: number
	onComplete: () => void
	isVertical?: boolean
}

export function CountdownDisplay({ isVertical }: { isVertical?: boolean }) {
    const countdown = useCountdown()
    const minutes = Math.floor(countdown / 60)
    const seconds = countdown % 60
    return (
        <View className={isVertical !== false ? 'mb-2 items-center' : 'items-center'}>
            <LargeNumberDisplay
                value={`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}
                size="large"
            />
        </View>
    )
}

function ExerciseExampleCountdownContent({ 
    exercise, 
    currentSet, 
    player,
    isVertical
}: { 
	exercise: Exercise
	currentSet: number
	player: ReturnType<typeof useVideoPlayer>,
	isVertical?: boolean
}) {
    const videoPlayerContext = useVideoPlayerContext()

    useEffect(() => {

        if (player && videoPlayerContext) {

            const unregister = videoPlayerContext.registerPlayer(player)
            return unregister
        } else {
            console.log('ExerciseExampleCountdownScreen: cannot register - missing player or context')
        }
        return undefined
    }, [player, videoPlayerContext])

    return (
        <>
            {/* Video */}
            <View style={{ height }} >
                {exercise.videoUrl ? (
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
          
            <View className="w-full px-4 py-4">
                <StepProgress current={0} total={5} />
            </View>
            { !isVertical && 
            <View className="absolute top-5 left-0 right-0 justify-center items-center ">
                <StepProgress current={0} total={5} isVertical={isVertical} />
                <Text className="text-t1 text-light-text-200 text-center">{exercise.name}</Text>
            </View>
            }

            {/* Exercise Info */}
            <View className="absolute bottom-0 left-0 right-0 ">
                {/* Exercise Name */}
                { isVertical ? <Text className="text-t1 text-light-text-200 text-center">{exercise.name}</Text> : <></>}

                {isVertical ? (
                    <>
                        {/* Countdown */}
                        <CountdownDisplay isVertical={isVertical} />

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
                    <View className="flex-row px-1 gap-2">
                        {/* Set Info */}
                        <View className="flex-1 basis-0 flex-row gap-2  items-end">
                            <View className="flex-[0.5] basis-0 items-center bg-fill-800 rounded-3xl p-1">
                                <Text className="text-[64px] leading-[72px] text-light-text-200">
                                    {currentSet}
                                    <Text className="text-[32px] leading-[36px] color-[#949494] "> / {exercise.sets}</Text>
                                </Text>
                                <Text className="text-t2 color-[#949494] mb-1">подход</Text>
                            </View>
                            {/* Countdown */}
                            <View className="flex-1 basis-0 items-center">
                                <CountdownDisplay isVertical={isVertical} />
                            </View>
                            <View className="flex-[0.5] basis-0 items-center bg-fill-800 rounded-3xl p-1">
                                <Text className="text-[64px] leading-[72px] text-light-text-200">
                                    {exercise.reps || exercise.duration}
                                </Text>
                                <Text className="text-t2 color-[#949494] mb-1">повторения</Text>
                            </View>
                        </View>
                    </View>
                )}
            </View>
        </>
    )
}

export function ExerciseExampleCountdownScreen({
    exercise,
    currentSet,
    onComplete,
    isVertical
}: ExerciseCountdownScreenProps) {
    const player = useVideoPlayer(exercise.videoUrl || '', (player) => {
        player.loop = true
        player.play()
    })

    return (
        <ExerciseWithCounterWrapper 
            onComplete={onComplete} 
            countdownInitial={exercise.duration}
        >
            <ExerciseExampleCountdownContent 
                exercise={exercise} 
                currentSet={currentSet} 
                player={player}
                isVertical={isVertical}
            />
        </ExerciseWithCounterWrapper>
    )
}
