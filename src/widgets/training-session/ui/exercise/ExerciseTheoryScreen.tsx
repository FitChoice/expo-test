/**
 * Exercise Countdown Screen (3.0)
 * Показывает обратный отсчет перед началом упражнения
 * Отображает видео тренера и информацию о подходе
 */

import { View, Text } from 'react-native'
import { useEffect, useRef } from 'react'
import { VideoView, useVideoPlayer } from 'expo-video'

import { VideoProgressBar } from '@/shared/ui'

import type { Exercise } from '@/entities/training/model/types'

import {
    ExerciseWithCounterWrapper,
    useVideoPlayerContext
} from '@/shared/ui/ExerciseWithCounterWrapper/ExerciseWithCounterWrapper'
import { VIDEO_SCREEN_HEIGHT as height } from '@/shared/constants/sizes'

interface ExerciseCountdownScreenProps {
	exercise: Exercise
	currentSet: number
	onComplete: () => void
	isVertical?: boolean
}

function ExerciseExampleCountdownContent({ 
    exercise,
    player,
    isVertical,
    onComplete
}: { 
	exercise: Exercise
	currentSet: number
	player: ReturnType<typeof useVideoPlayer>,
	isVertical?: boolean
	onComplete: () => void
}) {
    const videoPlayerContext = useVideoPlayerContext()
    const hasCompletedRef = useRef(false)

    useEffect(() => {

        if (player && videoPlayerContext) {

            const unregister = videoPlayerContext.registerPlayer(player)
            return unregister
        } else {
            console.log('ExerciseTheoryScreen: cannot register - missing player or context')
        }
        return undefined
    }, [player, videoPlayerContext])

    useEffect(() => {
        if (!player) return

        const checkCompletion = () => {
            if (hasCompletedRef.current) return
            
            // Проверяем, что видео закончилось (currentTime близко к duration)
            if (player.duration > 0 && player.currentTime >= player.duration - 0.1) {
                hasCompletedRef.current = true
                onComplete()
            }
        }

        // Проверяем периодически, когда видео загружено и воспроизводится
        const interval = setInterval(() => {
            if (player.status === 'readyToPlay' && player.duration > 0) {
                checkCompletion()
            }
        }, 100)

        return () => {
            clearInterval(interval)
        }
    }, [player, onComplete])

    return (
        <>
            {/* Video */}
            <View style={{ height: isVertical ? height : 250 }} >
                {exercise.VideoTheory ? (
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
          
            {/*<View className="w-full px-4 py-4 justify-center items-center ">*/}
            {/*    <StepProgress current={0} total={5} />*/}
            {/*</View>*/}
            { !isVertical && 
            <View className="absolute bottom-10 left-0 right-0 justify-center items-center px-4">
                <VideoProgressBar player={player} className="mb-2" />
                <Text className="text-t1 text-light-text-200 text-center">{exercise.name}</Text>
            </View>
            }

            {/* Exercise Info */}
            <View className="p-5">
                {/* Exercise Name */}
                { isVertical ? (
                    <>
                        <Text className="text-t1 text-light-text-200 text-center mb-2">{exercise.name}</Text>
                        <View className="px-4">
                            <VideoProgressBar player={player} />
                        </View>
                    </>
                ) : <></>}

                {/*{isVertical ? (*/}
                {/*    <>*/}
                {/*        /!* Countdown *!/*/}
                {/*        <CountdownDisplay isVertical={isVertical} />*/}

                {/*        /!* Set Info *!/*/}
                {/*        <View className="flex-row px-1 gap-2">*/}
                {/*            <View className="flex-1 basis-0 items-center bg-fill-800 rounded-3xl p-2 ">*/}
                {/*                <Text className="text-[64px] leading-[72px] text-light-text-200">*/}
                {/*                    {currentSet}*/}
                {/*                    <Text className="text-[32px] leading-[36px] color-[#949494] "> / {exercise.sets}</Text>*/}
                {/*                </Text>*/}
                {/*                <Text className="text-t2 color-[#949494] mb-1">подход</Text>*/}
                {/*            </View>*/}
                {/*            <View className="flex-1 basis-0 items-center bg-fill-800 rounded-3xl p-2">*/}
                {/*                <Text className="text-[64px] leading-[72px] text-light-text-200">*/}
                {/*                    {exercise.reps || exercise.duration}*/}
                {/*                </Text>*/}
                {/*                <Text className="text-t2 color-[#949494] mb-1">повторения</Text>*/}
                {/*            </View>*/}
                {/*        </View>*/}
                {/*    </>*/}
                {/*) : (*/}
                {/*    <View className="flex-row px-1 pb-2 gap-2">*/}
                {/*        /!* Set Info *!/*/}
                {/*        <View className="flex-1 basis-0 flex-row gap-2  items-end">*/}
                {/*            <View className="flex-[0.5] basis-0 items-center bg-fill-800 rounded-3xl p-1">*/}
                {/*                <Text className="text-[64px] leading-[72px] text-light-text-200">*/}
                {/*                    {currentSet}*/}
                {/*                    <Text className="text-[32px] leading-[36px] color-[#949494] "> / {exercise.sets}</Text>*/}
                {/*                </Text>*/}
                {/*                <Text className="text-t2 color-[#949494] mb-1">подход</Text>*/}
                {/*            </View>*/}
                {/*            /!* Countdown *!/*/}
                {/*            <View className="flex-1 basis-0 items-center">*/}
                {/*                <CountdownDisplay isVertical={isVertical} />*/}
                {/*            </View>*/}
                {/*            <View className="flex-[0.5] basis-0 items-center bg-fill-800 rounded-3xl p-1">*/}
                {/*                <Text className="text-[64px] leading-[72px] text-light-text-200">*/}
                {/*                    {exercise.reps || exercise.duration}*/}
                {/*                </Text>*/}
                {/*                <Text className="text-t2 color-[#949494] mb-1">повторения</Text>*/}
                {/*            </View>*/}
                {/*        </View>*/}
                {/*    </View>*/}
                {/*)}*/}
            </View>
        </>
    )
}

export function ExerciseTheoryScreen({
    exercise,
    currentSet,
    onComplete,
    isVertical
}: ExerciseCountdownScreenProps) {
    const player = useVideoPlayer(exercise.VideoTheory || '', (player) => {
        player.loop = false
        player.play()
    })

    return (
        <ExerciseWithCounterWrapper>
            <ExerciseExampleCountdownContent 
                exercise={exercise} 
                currentSet={currentSet} 
                player={player}
                isVertical={isVertical}
                onComplete={onComplete}
            />
        </ExerciseWithCounterWrapper>
    )
}
