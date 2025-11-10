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
		
		<View className="h-[90%] w-full">
		<View className="absolute left-20 right-0 bottom-0 h-full" style={{ bottom: 150 }} > 
			<RNImage source={GymnastImage} className="w-full h-full" resizeMode="contain" />

		{/* Слой 2: Текст перед изображением (только в области маски) */}
		<View className="absolute overflow-visible" style={{ left: screenWidth * -0.42 + 280, 
			top: screenHeight * 0.05 + 300, 
			width: screenWidth * 4, 
			height: screenHeight * 0.5 }}  >
		<CircularText
				text="fit choice fit choice fit choice fit choice fit choice fit choice fit choice fit choice fit choice fit choice"
				width={screenWidth * 0.45}
				height={screenHeight * 0.2}
				centerX={screenWidth * 0.225}
				centerY={screenHeight * 0.1}
				fontSize={screenWidth * 0.039}
				fill="#FFFFFF"
				startOffset="0%"
				fontWeight="300"
				letterSpacing="-3%"
				rotation={-17.05}
				debug={false}
			/>
			</View>
			</View>
			</View>

		</View>
	)
}
