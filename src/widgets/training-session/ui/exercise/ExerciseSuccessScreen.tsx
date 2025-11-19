/**
 * Exercise Success Screen (5.3)
 * Показывает мотивационное сообщение после завершения упражнения
 */

import { View, Text } from 'react-native'
import React, {  useState } from 'react'
import {
    ExerciseWithCounterWrapper
} from '@/shared/ui/ExerciseWithCounterWrapper/ExerciseWithCounterWrapper'
import { Button } from '@/shared/ui'
import { sharedStyles } from '@/pages/survey/ui/components/shared-styles'
import { useTrainingStore } from '@/entities/training'

interface ExerciseSuccessScreenProps {
	onComplete: () => void
	message?: string
}

const motivationalMessages = [
    'Так держать!',
    'Вы отлично справились!',
    'Прекрасно!',
    'Молодец!',
    'Великолепно!',
    'Продолжай!',
]

export function ExerciseSuccessScreen({
    onComplete,

}: ExerciseSuccessScreenProps) {

    const reportTraining = useTrainingStore((state) => state.reportTraining)

    const [displayMessage] = useState(
        () =>

            motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]
    )

    const handleGoToReportPage = () => {
        reportTraining()
    }

    return (
        <ExerciseWithCounterWrapper
            onComplete={onComplete}
        >

            <View className="flex-1 items-center justify-between padding-4 pt-20 pb-5  gap-10">

                <View className="flex items-start gap-10">

                    <Text style={sharedStyles.titleCenter}>{displayMessage }</Text>

                    <Text className="text-h2 text-light-text-200" >Давайте посмотрим отчёт</Text>

                </View>

                <Button  variant="primary" onPress={handleGoToReportPage} className="w-full" >Далее</Button>
            </View>

        </ExerciseWithCounterWrapper>
    )
}
