import React from 'react'
import { Text, useWindowDimensions, View,	Image as RNImage, } from 'react-native'
import type { BMICategory } from '@/entities/survey'
import { sharedStyles } from './shared-styles'
import { CircularText } from '@/shared/ui'
import GymnastImage from '../../../../../assets/images/gymnast.png'

interface SurveyStep6Props {
	bmiCategory: BMICategory | null
}

/**
 * Шаг 6: Отображение результата ИМТ
 */
export const SurveyStep6: React.FC<SurveyStep6Props> = ({ bmiCategory }) => {
    const { width: screenWidth, height: screenHeight } = useWindowDimensions()

    if (!bmiCategory) {
        return <Text style={sharedStyles.title}>Ошибка расчета ИМТ</Text>
    }

    return (
        <View>
            <View className="px-4">
                <Text style={sharedStyles.title}>ваша отправная точка</Text>	
            </View>
			
            <View className="flex-row items-baseline gap-2 px-4">
                <Text className="text-white">
					Индекс Массы Тела -
                </Text>
                <Text style={sharedStyles.title}>
                    {bmiCategory.bmi}
                </Text>
            </View>
            <View className="px-4">
                <Text className="font-inter text-left text-base font-normal leading-[19.2px] text-white">
                    {bmiCategory.description}
                </Text>
            </View>

            <View className="h-[50%] w-full relative "  >
                <View className="absolute left-20 right-0 -top-20 " >
                    <RNImage source={GymnastImage} className="w-full "  />
                </View>
            </View>

        </View>
    )
}
