import React from 'react'
import { Text, useWindowDimensions, View, Image as RNImage } from 'react-native'
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
                <Text className="text-white text-t2">Индекс Массы Тела -</Text>
                <Text style={sharedStyles.title}>{bmiCategory.bmi}</Text>
            </View>
            <View className="px-4">
                <Text className="text-t2 text-left text-base font-normal leading-[19.2px] text-white">
                    {bmiCategory.description}
                </Text>
            </View>

            <View className="relative h-[50%] w-full">
                {/* Круговой текст вокруг изображения - верхняя половина (за изображением) */}
                <CircularText
                    text=" fit choice fit choice fit choice fit choice fit "
                    width={screenWidth * 0.7}
                    height={screenWidth * 0.4}
                    centerX={screenWidth * 0.65}
                    centerY={screenHeight * 0.25}
                    fontSize={14}
                    fill="#FFFFFF"
                    fontWeight="400"
                    letterSpacing="2"
                    startOffset="0%"
                />

                <View className="absolute -top-20 left-20 right-0">
                    <RNImage source={GymnastImage} className="w-full" />
                </View>

                {/* Круговой текст вокруг изображения - нижняя половина (перед изображением) */}
                <CircularText
                    text="hoice fit choice fit choice fit choice fit choice "
                    width={screenWidth * 0.8}
                    height={screenWidth * 0.4}
                    centerX={screenWidth * 0.7}
                    centerY={screenHeight * 0.25}
                    fontSize={14}
                    fill="#FFFFFF"
                    fontWeight="400"
                    letterSpacing="2"
                    startOffset="0%"
                    rotation={180}
                />
            </View>
        </View>
    )
}
