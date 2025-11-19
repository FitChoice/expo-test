import React from 'react'
import { View, Text, ActivityIndicator } from 'react-native'
import { sharedStyles } from './shared-styles'

/**
 * Шаг 5: Экран загрузки расчета ИМТ
 */
export const SurveyStep5: React.FC = () => {
    return (
        <View className="items-center justify-center gap-2 bg-transparent">
            <Text style={sharedStyles.title}>Пожалуйста, подождите ...</Text>
            <Text className="font-inter text-left text-base font-normal leading-[19.2px] text-white">
				Рассчитываем ваш Индекс Массы Тела
            </Text>
            <View className="mt-[60px]">
                <ActivityIndicator size="large" color="#C5F680" />
            </View>
        </View>
    )
}
