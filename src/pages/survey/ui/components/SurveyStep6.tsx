import React from 'react'
import { Text, View } from 'react-native'
import type { BMICategory } from '@/entities/survey'
import { sharedStyles } from './shared-styles'

interface SurveyStep6Props {
	bmiCategory: BMICategory | null
}

/**
 * Шаг 6: Отображение результата ИМТ
 */
export const SurveyStep6: React.FC<SurveyStep6Props> = ({ bmiCategory }) => {
	if (!bmiCategory) {
		return <Text style={sharedStyles.title}>Ошибка расчета ИМТ</Text>
	}

	return (
		<>
			<Text style={sharedStyles.title}>ваша отправная точка</Text>
			<View className="flex-row items-baseline gap-2">
				<Text className="text-white">
					Индекс Массы Тела -
				</Text>
				<Text style={sharedStyles.title}>
					{bmiCategory.bmi}
				</Text>
			</View>
			<Text className="font-inter text-left text-base font-normal leading-[19.2px] text-white">
				{bmiCategory.description}
			</Text>
		</>
	)
}
