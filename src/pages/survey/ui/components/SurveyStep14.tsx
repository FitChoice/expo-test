import React from 'react'
import { View, Text } from 'react-native'
import { sharedStyles } from './shared-styles'

interface SurveyStep14Props {
	userName: string
}

/**
 * Шаг 14: Финальный экран приветствия
 */
export const SurveyStep14: React.FC<SurveyStep14Props> = ({ userName }) => {
	return (
		<View className="items-center gap-8 bg-transparent pt-20 ">
			<View className="h-[72px] w-[72px] rounded-full bg-brand-purple-500" />
			<View className="items-center gap-2 bg-transparent">
				<Text className="font-inter text-center text-t2 font-normal leading-[19.2px] text-light-text-200">
					Добро пожаловать,
				</Text>
				<Text style={sharedStyles.titleCenter}>{userName}!</Text>
			</View>
			<Text className="font-inter text-center text-t2 font-normal leading-[19.2px] text-light-text-200">
				Теперь мы знаем все что нужно, чтобы сформировать лучшую систему тренировок для
				вас
			</Text>
		</View>
	)
}
