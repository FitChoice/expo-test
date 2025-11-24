/**
 * Exercise Success Screen (5.3)
 * Показывает мотивационное сообщение после завершения упражнения
 */

import { View, Text, useWindowDimensions } from 'react-native'
import React, {  useState } from 'react'

import { Button, CircularText } from '@/shared/ui'
import { sharedStyles } from '@/pages/survey/ui/components/shared-styles'
import {

    Image as RNImage,

} from 'react-native'
import landingPhoto1 from 'src/assets/images/girl_success_screen.png'
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

export function ExerciseSuccess() {
	
    const reportTraining = useTrainingStore((state) => state.reportTraining)

    const { width: screenWidth, height: screenHeight } = useWindowDimensions()

    const onComplete = () => {
        reportTraining()
    }

    const [displayMessage] = useState(
        () =>

            motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]
    )

    const handleGoToReportPage = () => {
        reportTraining()
    }

    return (

        <View className="flex-1 items-center justify-between padding-4 pt-20 pb-5  gap-10">

            <View className="flex items-start gap-10">

                <Text style={sharedStyles.titleCenter}>{displayMessage }</Text>

                <Text className="text-h2 text-light-text-200" >Давайте посмотрим отчёт</Text>

                {/* Group 314 с фотокарточкой и декоративными элементами */}
                <View className="absolute left-0 top-40 h-[500] w-[100%] ">

                    {/*/!* Основная фотокарточка IMG_3254 2 *!/*/}
                    <RNImage source={landingPhoto1} className="h-full w-full" resizeMode="cover" />

                </View>

            </View>

            <Button  variant="primary" onPress={handleGoToReportPage} className="w-full" >Далее</Button>
        </View>
     
    )
}
