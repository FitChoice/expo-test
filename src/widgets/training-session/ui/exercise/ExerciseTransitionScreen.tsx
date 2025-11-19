/**
 * Exercise Transition Screen (5.6)
 * Показывает переход к следующему упражнению
 * Отображает название следующего упражнения и короткий countdown
 */

import { View, Text } from 'react-native'
import { useState, useEffect } from 'react'
import type { Exercise } from '@/entities/training/model/types'
import {
    ExerciseWithCounterWrapper
} from '@/shared/ui/ExerciseWithCounterWrapper/ExerciseWithCounterWrapper'
import {
    CountdownDisplay
} from '@/widgets/training-session/ui/exercise/ExerciseExampleCountdownScreen'

interface ExerciseTransitionScreenProps {
	nextExercise: Exercise
	onComplete: () => void
	countdownDuration?: number // seconds
}

export function ExerciseTransitionScreen({
    nextExercise,
    onComplete,
    countdownDuration = 5,
}: ExerciseTransitionScreenProps) {
    const [countdown, setCountdown] = useState(countdownDuration)

    useEffect(() => {
        if (countdown <= 0) {
            onComplete()
            return
        }

        const timer = setInterval(() => {
            setCountdown((prev) => prev - 1)
        }, 1000)

        return () => clearInterval(timer)
    }, [countdown, onComplete])

    return (	<ExerciseWithCounterWrapper
        onComplete={onComplete}
        countdownInitial={5}
    >

        <View className="flex-1 items-center justify-center padding-4 ">

            <CountdownDisplay />
            <View className="mt-6 items-center">
                <Text className="text-h2 text-brand-green-500 text-center">	Следующее упражнение</Text>
            </View>

            {/* Exercise Name */}
            <Text className="text-h2 text-light-text-100 mb-12 text-center">
                {nextExercise.name}
            </Text>

            {/* Info */}
            <Text className="text-h2 text-light-text-100 mt-6">
                {nextExercise.sets} × {nextExercise.reps || nextExercise.duration}{' '}
                {nextExercise.reps ? 'повт.' : 'сек'}
            </Text>

        </View>

    </ExerciseWithCounterWrapper>

    )
}
