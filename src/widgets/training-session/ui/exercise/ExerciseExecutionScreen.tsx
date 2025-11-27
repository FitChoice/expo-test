/**
 * Timer Exercise Screen (5.7, 5.8)
 * Упражнения на время (планка, статические упражнения)
 * Показывает таймер обратного отсчета без pose detection
 */

import { View, Text, useWindowDimensions } from 'react-native'
import { useEffect, useState } from 'react'
import { type Exercise } from '@/entities/training'
import {
    ExerciseWithCounterWrapper,
} from '@/shared/ui/ExerciseWithCounterWrapper/ExerciseWithCounterWrapper'
import { VIDEO_SCREEN_HEIGHT as verticalCameraViewHeight } from '@/shared/constants/sizes'
import { PoseCamera } from '@/widgets/pose-camera'
import type * as posedetection from '@tensorflow-models/pose-detection'
import type * as ScreenOrientation from 'expo-screen-orientation'
import type { EngineTelemetry } from '../../../../../poseflow-js'
import { useVideoPlayer, VideoView } from 'expo-video'
import { useVideoPlayerContext } from '@/shared/hooks/useVideoPlayerContext'

interface TimerExerciseScreenProps {
	isVertical?: boolean
	onComplete: () => void
	exercise: Exercise
	model: posedetection.PoseDetector
	orientation: ScreenOrientation.Orientation,
	currentSet: number
}

export function ExerciseExecutionScreen({
    isVertical,
    onComplete,
    exercise,
    model,
    orientation,
    currentSet
}: TimerExerciseScreenProps) {
    const player = useVideoPlayer(exercise.VideoPractice || '', (player) => {
        player.loop = true
        player.play()
    })
	 const videoPlayerContext = useVideoPlayerContext()
    const [telemetry, setTelemetry] = useState<EngineTelemetry | null>(null)

    useEffect(() => {
        if (player && videoPlayerContext) {
            const unregister = videoPlayerContext.registerPlayer(player)
            return unregister
        } else {
            console.log('ExerciseExecutionScreen: cannot register - missing player or context')
        }
        return undefined
    }, [player, videoPlayerContext])

    const { height: windowHeight } = useWindowDimensions()

    const height = isVertical ? verticalCameraViewHeight : windowHeight
	
    useEffect(() => {
		
        if (telemetry?.reps == exercise.reps) {
            onComplete()
        }
    }, [telemetry?.reps])

    return (
        <ExerciseWithCounterWrapper >
            <View className="flex-1">
                {/* Camera View with Video Overlay */}
                <View style={{ height, position: 'relative', width: '100%', overflow: 'hidden' , borderRadius: 8 }}>

                    <View className="rounded-3xl"> 
                        <PoseCamera model={model} orientation={orientation} onTelemetry={setTelemetry} exerciseId={exercise.id} />
                    </View>

                    {
										
                        isVertical && exercise.VideoPractice && player && (
                            <View style={{
                                position: 'absolute',
                                right: 10,
                                top: '53%',
                                width: '40%',
                                height: '40%',
                                overflow: 'hidden',
                                backgroundColor: 'transparent',
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

                        )
                    }
          
                </View>

                {/* Step Progress */}
                {/*{isVertical ? (*/}
                {/*    <View  */}
                {/*        className="justify-center items-center pt-10"*/}
                {/*    >*/}
                {/*        <View */}
                {/*            onLayout={(e) => setStepProgressHeight(e.nativeEvent.layout.height)}*/}
                {/*        >*/}
                {/*            <StepProgress current={0} total={5} />*/}
                {/*        </View>*/}
                {/*    </View>*/}
                {/*) : (*/}
                {/*    <View className="w-full px-4 py-4">*/}
                {/*        <StepProgress current={0} total={5} />*/}
                {/*    </View>*/}
                {/*)}*/}

                { !isVertical &&
							<View className="absolute top-5 left-0 right-0 justify-center items-center ">
							    {/*<StepProgress current={0} total={5} isVertical={isVertical} />*/}
							    <Text className="text-t1 text-light-text-200 text-center">{exercise.name}</Text>
							</View>
                }

                {/* Exercise Info */}
                <View className="absolute bottom-0 left-0 right-0 p-6">
                    {/* Exercise Name */}
                    { isVertical ? <Text className="text-t1 text-light-text-200 text-center">{exercise.name}</Text> : <></>}

                    {isVertical ? <>
                        {/* Set Info */}
                        <View className="flex-row px-1 justify-center ">
                            <View className="flex-1 basis-0 items-center  ">
                                <Text className={`text-[64px] leading-[72px] ${
                                    telemetry?.reps === 0
                                        ? 'text-light-text-200'
                                        : telemetry?.reps === exercise.reps
                                            ? 'text-brand-green-500'
                                            : 'text-light-text-200'
                                }`}>
                                    {telemetry?.reps}
                                    <Text className={`text-[32px] leading-[36px] ${
                                        telemetry?.reps === exercise.reps
                                            ? 'text-brand-green-500'
                                            : 'color-[#949494]'
                                    }`}> / {exercise.reps}</Text>
                                </Text>
                                <Text className="text-t2 color-[#949494] mb-1">повторения</Text>
                            </View>
                        </View>
										
                    </> :    <View className="flex-row px-1">
                        <View className="flex-[0.5] basis-0 items-center bg-fill-800 rounded-3xl p-1">
                            <Text className={`text-[64px] leading-[72px] ${
                                telemetry?.reps === 0
                                    ? 'text-light-text-200'
                                    :  telemetry?.reps === exercise.reps
                                        ? 'text-brand-green-500'
                                        : 'text-light-text-200'
                            }`}>
                                { telemetry?.reps}
                                <Text className={`text-[32px] leading-[36px] ${
                                    telemetry?.reps === exercise.reps
                                        ? 'text-brand-green-500'
                                        : 'color-[#949494]'
                                }`}> / {exercise.reps}</Text>
                            </Text>
                            <Text className="text-t2 color-[#949494] mb-1">повторения</Text>
                        </View>
                        <View className="flex-[1] basis-0 justify-center items-center">

                        </View>

                        <View className="flex-[1.2] basis-0 items-end ">
                            {exercise.VideoPractice && player && (
                                <View style={{
                                    width: '50%',
                                    height: '100%',
                                    overflow: 'hidden',
                                    backgroundColor: 'transparent',
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

                            )}
                        </View>

                    </View>

                    }

                </View>
            </View>
					
        </ExerciseWithCounterWrapper>
    )
}
