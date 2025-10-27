import React from 'react'
import { View, Text } from 'react-native'
import { sharedStyles } from './shared-styles'

/**
 * Шаг 13: Предложение включить уведомления
 */
export const SurveyStep13: React.FC = () => {
	return (
		<>
			<Text style={sharedStyles.title}>Включим уведомления?</Text>
			<Text className="font-inter text-left text-base font-normal leading-[19.2px] text-white">
				Мы будем напоминать о тренировках, чтобы вы ничего не пропустили
			</Text>
			<View className="mt-10 items-center justify-center bg-transparent">
				<View className="h-[495px] w-[275px] items-center justify-center overflow-hidden rounded-[27px] bg-bg-dark-500">
					<Text style={sharedStyles.titleLarge}>13:20</Text>
					<View className="w-[342px] items-center gap-2 rounded-2xl bg-bg-dark-500 p-4">
						<Text className="font-inter text-center text-base font-normal leading-[19.2px] text-white">
							Время заниматься!
						</Text>
						<Text className="font-inter text-center text-xs font-semibold leading-[14.4px] text-[#C5F680]">
							FitChoice
						</Text>
						<Text className="font-inter text-center text-xs font-semibold leading-[14.4px] text-[#949494]">
							2 мин
						</Text>
					</View>
				</View>
			</View>
		</>
	)
}
