import React from 'react'
import { View, Text, ActivityIndicator } from 'react-native'
import { sharedStyles } from './shared-styles'

/**
 * Экран загрузки отправки данных опроса
 */
export const SurveyStepLoading: React.FC = () => {
    return (
        <View className="flex-1 items-center justify-center gap-2 bg-transparent">
            <Text style={sharedStyles.title}>Пожалуйста, подождите ...</Text>
            <Text className="font-inter text-center text-base font-normal leading-[19.2px] text-white">
				Сохраняем ваши данные
            </Text>
            <View className="mt-[60px]">
                <ActivityIndicator size="large" color="#C5F680" />
            </View>
        </View>
    )
}
