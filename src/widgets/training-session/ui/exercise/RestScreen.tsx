/**
 * Rest Screen (5.5)
 * Экран отдыха между подходами
 * Показывает обратный отсчет с возможностью пропустить
 */

import { View, Text, useWindowDimensions } from 'react-native'
import { useEffect, useState } from 'react'
import { Button, LargeNumberDisplay } from '@/shared/ui'
import { ExerciseWithCounterWrapper } from '@/shared/ui/ExerciseWithCounterWrapper/ExerciseWithCounterWrapper'

interface RestScreenProps {
	onComplete: () => void
	duration: number // seconds
}

export function RestScreen({ onComplete, duration }: RestScreenProps) {
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

    const handleSkip = () => {
        onComplete()
    }

    return (
        <ExerciseWithCounterWrapper isShowActionButtons={false}>
            <View className="padding-4 flex-1 items-center justify-center gap-10 pb-5 pt-5">
                <View className="mt-6 items-center">
                    <Text className="text-h1 text-brand-purple-500">Отдых</Text>
                </View>

                <View className={isVertical ? 'mb-2 items-center' : 'items-center'}>
                    <LargeNumberDisplay
                        value={`${Math.floor(remainingTime / 60)
                            .toString()
                            .padStart(2, '0')}:${(remainingTime % 60).toString().padStart(2, '0')}`}
                        size="large"
                    />
                </View>

                <Button variant="primary" onPress={handleSkip}>
					Пропустить
                </Button>
            </View>
        </ExerciseWithCounterWrapper>
    )
}
