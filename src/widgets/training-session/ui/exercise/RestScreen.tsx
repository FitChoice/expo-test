/**
 * Rest Screen (5.5)
 * Экран отдыха между подходами
 * Показывает обратный отсчет с возможностью пропустить
 */

import { View, Text, useWindowDimensions } from 'react-native'
import { useEffect, useState } from 'react'
import { LargeNumberDisplay } from '@/shared/ui'
import { ExerciseWithCounterWrapper } from '@/shared/ui/ExerciseWithCounterWrapper/ExerciseWithCounterWrapper'
import type { ExerciseInfoResponse } from '@/entities/training'

interface RestScreenProps {
	onComplete: () => void
	duration: number // seconds
	exercise: ExerciseInfoResponse
	currentSet: number
}

export function RestScreen({ onComplete, duration, exercise, currentSet }: RestScreenProps) {
    const { width, height } = useWindowDimensions()
    const isVertical = height > width

    const [remainingTime, setRemainingTime] = useState(duration)

    useEffect(() => {
        if (remainingTime <= 0) {
            onComplete()
            return
        }

        const timer = setInterval(() => {
            setRemainingTime((prev) => prev - 1)
        }, 1000)

        return () => clearInterval(timer)
    }, [remainingTime, onComplete])

    return (
        <ExerciseWithCounterWrapper isShowActionButtons={false}>
            <View className="padding-4 flex-1 items-center justify-center gap-10 pb-5 pt-5">
                <View className="mt-6 items-center">
                    <Text className="text-h1 text-brand-green-500">Отдых</Text>
                </View>

                <View className={isVertical ? 'mb-2 items-center' : 'items-center'}>
                    <LargeNumberDisplay
                        value={`${Math.floor(remainingTime / 60)
                            .toString()
                            .padStart(2, '0')}:${(remainingTime % 60).toString().padStart(2, '0')}`}
                        size="large"
                    />
                </View>

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
            </View>
        </ExerciseWithCounterWrapper>
    )
}
