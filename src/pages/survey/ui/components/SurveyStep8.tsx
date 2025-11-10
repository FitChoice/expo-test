import React from 'react'
import { View, Text } from 'react-native'
import { sharedStyles } from './shared-styles'

/**
 * Шаг 8: Информационный экран о преимуществах регулярных тренировок
 */
export const SurveyStep8: React.FC = () => {
	const benefits = [
		'Сформировать привычку заниматься регулярно',
		'Улучшить технику упражнений',
		'Повысить выносливость',
		'Снизить уровень стресса',
		'Получить удовольствие',
	]

	return (
		<>
			<Text style={sharedStyles.title}>Супер!</Text>
			<Text className="font-inter text-left text-t2 font-normal leading-[19.2px] text-white">
				Вот чего вы сможете достичь, занимаясь в таком темпе
			</Text>
			<View className="gap-4 bg-transparent">
				{benefits.map((benefit, index) => (
					<View key={index} className="bg-transparent">
						<Text className="font-inter text-left text-t2 font-normal leading-[19.2px] text-light-text-100">
							• {benefit}
						</Text>
					</View>
				))}
			</View>
		</>
	)
}
