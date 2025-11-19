/**
 * Timer Exercise Screen (5.7, 5.8)
 * Упражнения на время (планка, статические упражнения)
 * Показывает таймер обратного отсчета без pose detection
 */

import { View, Text, useWindowDimensions } from 'react-native'
import { useState, useEffect } from 'react'
import { useIsFocused } from '@react-navigation/native'
import {  StepProgress } from '@/shared/ui'
import { type Exercise } from '@/entities/training'
import { ExerciseWithCounterWrapper, useVideoPlayerContext } from '@/shared/ui/ExerciseWithCounterWrapper/ExerciseWithCounterWrapper'
import { CountdownDisplay } from './ExerciseExampleCountdownScreen'
import { useVideoPlayer } from 'expo-video'
import { CameraView } from 'expo-camera'

interface TimerExerciseScreenProps {
	isVertical?: boolean
	onComplete: () => void
	exercise: Exercise
}

function TimerExerciseContent({ exercise, player, isVertical }: { exercise: Exercise, player: ReturnType<typeof useVideoPlayer>, isVertical?: boolean }) {
    const [localCurrentSet, setLocalCurrentSet] = useState(0)
    const [cameraKey, setCameraKey] = useState(0)
    const videoPlayerContext = useVideoPlayerContext()
    const isFocused = useIsFocused()

    useEffect(() => {
        // Обновляем cameraKey при монтировании компонента для гарантированной инициализации камеры
        setCameraKey(prev => prev + 1)
    }, [])

    useEffect(() => {
        // Обновляем cameraKey при изменении exercise.id
        setCameraKey(prev => prev + 1)
    }, [exercise.id])

    useEffect(() => {
        const interval = setInterval(() => {
            setLocalCurrentSet((prev) => {
                if (prev >= exercise.sets) {
                    return prev
                }
                return prev + 1
            })
        }, 2000)

        return () => clearInterval(interval)
    }, [exercise.sets])

    useEffect(() => {
        if (player && videoPlayerContext) {
            const unregister = videoPlayerContext.registerPlayer(player)
            return unregister
        } else {
            console.log('TimerExerciseScreen: cannot register - missing player or context')
        }
        return undefined
    }, [player, videoPlayerContext])

    const height = 500
    const { width } = useWindowDimensions()

    return (
        <View className="flex-1">
            {/* Camera View with Video Overlay */}
            <View style={{ height, position: 'relative', width: '100%', overflow: 'hidden' }}>
                {/* Camera View - Background Layer */}
                {isFocused ? (
                    <CameraView 
                        key={`camera-${cameraKey}`}
                        style={{ height, width, position: 'absolute', top: 0, left: 0 }} 
                        facing="front" 
                    />
                ) : (
                    <View style={{ height, width, position: 'absolute', top: 0, left: 0, backgroundColor: 'black' }} />
                )}
				
                {/* Video Preview Window - Bottom Right Corner - Foreground Layer */}
                {/* {exercise.videoUrl && player && (
					<View 
						style={{
							position: 'absolute',
							bottom: 12,
							right: 12,
							width: 100,
							height: 138,
							zIndex: 9,
							elevation: 10,
						}}
					>
						<View style={{
							width: '100%',
							height: '100%',
							overflow: 'hidden',
							backgroundColor: 'black',
							borderRadius: 8,
							shadowColor: '#000',
							shadowOffset: { width: 0, height: 2 },
							shadowOpacity: 0.25,
							shadowRadius: 3.84,
						}}>
							<VideoView
								player={player}
								style={{ width: '100%', height: '100%' }}
								contentFit="cover"
								nativeControls={false}
							/>
						</View>
					</View>
				)} */}
            </View>

            {/* Step Progress */}
            <View className="w-full px-4 py-4">
                <StepProgress current={0} total={5} />
            </View>

            {/* Exercise Info */}
            <View className="absolute bottom-0 left-0 right-0 p-6">
                {/* Exercise Name */}
                <Text className="text-t1 text-light-text-200 text-center">{exercise.name}</Text>

                {/* Countdown */}
                <CountdownDisplay />

                {/* Set Info */}
                <View className="flex-row px-1 justify-center ">
                    <View className="flex-1 basis-0 items-center  ">
                        <Text className={`text-[64px] leading-[72px] ${
                            localCurrentSet === 0 
                                ? 'text-light-text-200' 
                                : localCurrentSet === exercise.sets 
                                    ? 'text-brand-green-500' 
                                    : 'text-light-text-200'
                        }`}>
                            {localCurrentSet}
                            <Text className={`text-[32px] leading-[36px] ${
                                localCurrentSet === exercise.sets 
                                    ? 'text-brand-green-500' 
                                    : 'color-[#949494]'
                            }`}> / {exercise.sets}</Text>
                        </Text>
                        <Text className="text-t2 color-[#949494] mb-1">повторения</Text>
                    </View>
                </View>
            </View>
        </View>
    )
}

export function TimerExerciseScreen({
    isVertical,
    onComplete, exercise
}: TimerExerciseScreenProps) {
    const player = useVideoPlayer(exercise.videoUrl || '', (player) => {
        player.loop = true
        player.play()
    })

    return (
        <ExerciseWithCounterWrapper
            countdownInitial={exercise?.duration }
            onComplete={onComplete}
        >
            <TimerExerciseContent exercise={exercise} player={player}   isVertical={isVertical}/>
        </ExerciseWithCounterWrapper>
    )
}
