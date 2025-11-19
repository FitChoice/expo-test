/**
 * Rest Screen (5.5)
 * Экран отдыха между подходами
 * Показывает обратный отсчет с возможностью пропустить
 */

import { View, Text } from 'react-native'
import { Button } from '@/shared/ui'
import {
    ExerciseWithCounterWrapper
} from '@/shared/ui/ExerciseWithCounterWrapper/ExerciseWithCounterWrapper'
import {
    CountdownDisplay
} from '@/widgets/training-session/ui/exercise/ExerciseExampleCountdownScreen'

interface RestScreenProps {
	onComplete: () => void
	duration?: number // seconds
}

export function RestScreen({ onComplete, duration }: RestScreenProps) {

    const handleSkip = () => {
        onComplete()
    }

    return (
        <ExerciseWithCounterWrapper
            onComplete={onComplete}
            countdownInitial={duration}
            isShowActionButtons={false}
        >

            <View className="flex-1 items-center justify-center padding-4 pt-5 pb-5  gap-10">

                <View className="mt-6 items-center">
                    <Text className="text-h1 text-brand-purple-500">Отдых</Text>
                </View>

                <CountdownDisplay />

                <Button variant="primary" onPress={handleSkip} >Пропустить</Button>
            </View>

        </ExerciseWithCounterWrapper>
    )
}
