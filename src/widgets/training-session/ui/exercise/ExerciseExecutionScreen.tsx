/**
 * Timer Exercise Screen (5.7, 5.8)
 * Упражнения на время (планка, статические упражнения)
 * Показывает таймер обратного отсчета без pose detection
 */

import { View, Text, useWindowDimensions } from 'react-native'
import { useState, useEffect, useRef } from 'react'
import { useIsFocused } from '@react-navigation/native'
import {  StepProgress } from '@/shared/ui'
import { type Exercise } from '@/entities/training'
import { ExerciseWithCounterWrapper, useVideoPlayerContext } from '@/shared/ui/ExerciseWithCounterWrapper/ExerciseWithCounterWrapper'
import { CountdownDisplay } from './ExerciseExampleCountdownScreen'
import { useVideoPlayer } from 'expo-video'
import { VIDEO_SCREEN_HEIGHT as verticalCameraViewHeight } from '@/shared/constants/sizes'
import { Audio } from 'expo-av'
import { PoseCamera } from '@/widgets/pose-camera'
import type * as posedetection from '@tensorflow-models/pose-detection'
import type * as ScreenOrientation from 'expo-screen-orientation'

interface TimerExerciseScreenProps {
	isVertical?: boolean
	onComplete: () => void
	exercise: Exercise
	model: posedetection.PoseDetector
	orientation: ScreenOrientation.Orientation
}

function TimerExerciseContent({ exercise, model, isVertical, orientation }: TimerExerciseScreenProps) {
    const [localCurrentSet, setLocalCurrentSet] = useState(0)
    const [cameraKey, setCameraKey] = useState(0)
    const [stepProgressHeight, setStepProgressHeight] = useState(0)
    const videoPlayerContext = useVideoPlayerContext()
    const isFocused = useIsFocused()
    const soundRef = useRef<Audio.Sound | null>(null)

    const beepSound = require('@/assets/sounds/beep.mp3')

    useEffect(() => {
        // Обновляем cameraKey при монтировании компонента для гарантированной инициализации камеры
        setCameraKey(prev => prev + 1)
    }, [])

    useEffect(() => {
        // Обновляем cameraKey при изменении exercise.id
        setCameraKey(prev => prev + 1)
    }, [exercise.id])

    useEffect(() => {
        // Инициализация звука
        const loadSound = async () => {
            try {
                await Audio.setAudioModeAsync({
                    playsInSilentModeIOS: true,
                    staysActiveInBackground: false,
                })
                // Создаем простой beep звук
                const { sound } = await Audio.Sound.createAsync(
                    beepSound,
                    { shouldPlay: false, volume: 0.5 }
                )
                soundRef.current = sound
            } catch (error) {
                console.log('Error loading sound:', error)
            }
        }
        loadSound()

        return () => {
            if (soundRef.current) {
                soundRef.current.unloadAsync()
            }
        }
    }, [])

    useEffect(() => {
        const interval = setInterval(() => {
            setLocalCurrentSet((prev) => {
                if (prev >= exercise.sets) {
                    return prev
                }
                const newValue = prev + 1
                // Воспроизводим звук при увеличении счетчика
                if (newValue > 0 && soundRef.current) {
                    soundRef.current.replayAsync().catch((error) => {
                        console.log('Error playing sound:', error)
                    })
                }
                return newValue
            })
        }, 2000)

        return () => clearInterval(interval)
    }, [exercise.sets])

    // useEffect(() => {
    //     if (player && videoPlayerContext) {
    //         const unregister = videoPlayerContext.registerPlayer(player)
    //         return unregister
    //     } else {
    //         console.log('ExerciseExecutionScreen: cannot register - missing player or context')
    //     }
    //     return undefined
    // }, [player, videoPlayerContext])
  
    const { height: windowHeight } = useWindowDimensions()

    const height = isVertical ? verticalCameraViewHeight : windowHeight

    return (
        <View className="flex-1">
            {/* Camera View with Video Overlay */}
            <View style={{ height, position: 'relative', width: '100%', overflow: 'hidden' }}>
               
                <View>
                    <PoseCamera model={model} orientation={orientation} />
                </View>
				
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
            {isVertical ? (
                <View  
                    className="justify-center items-center pt-10"
                >
                    <View 
                        onLayout={(e) => setStepProgressHeight(e.nativeEvent.layout.height)}
                    >
                        <StepProgress current={0} total={5} />
                    </View>
                </View>
            ) : (
                <View className="w-full px-4 py-4">
                    <StepProgress current={0} total={5} />
                </View>
            )}

            { !isVertical && 
            <View className="absolute top-5 left-0 right-0 justify-center items-center ">
                <StepProgress current={0} total={5} isVertical={isVertical} />
                <Text className="text-t1 text-light-text-200 text-center">{exercise.name}</Text>
            </View>
            }

            {/* Exercise Info */}
            <View className="absolute bottom-0 left-0 right-0 p-6">
                {/* Exercise Name */}
                {/* Exercise Name */}
                { isVertical ? <Text className="text-t1 text-light-text-200 text-center">{exercise.name}</Text> : <></>}

                {isVertical ? <>
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

                </> : <>
                    <View className="flex-row px-1">

                        <View className="flex-[0.5] basis-0 items-center bg-fill-800 rounded-3xl p-1">
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
                        <View className="flex-[1.9] basis-0 justify-end align-center ">
                            <CountdownDisplay />
                        </View>
                        <View className="flex-[0.7] basis-0  justify-end ">
                            <View className="flex-[0.5] basis-0 items-center bg-fill-800 rounded-3xl"></View>
                        </View>

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

                </>}
        
            </View>
        </View>
    )
}

export function ExerciseExecutionScreen({
    isVertical,
    onComplete,
    exercise,
    model,
    orientation
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
            <TimerExerciseContent 
                exercise={exercise} 
                isVertical={isVertical}
                model={model}
                orientation={orientation}
                onComplete={onComplete}
            />
        </ExerciseWithCounterWrapper>
    )
}
