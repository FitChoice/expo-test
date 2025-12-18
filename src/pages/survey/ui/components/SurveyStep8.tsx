import React from 'react'
import { View, Text } from 'react-native'
import { sharedStyles } from '@/shared/ui/styles/shared-styles'
import { FeatureCard } from '@/shared/ui'
import { type IconName } from '@/shared/ui/Icon/types'

const benefits: Array<{ icon: IconName; text: string }> = [
	{ icon: 'goal-habit', text: 'Сформировать привычку заниматься регулярно' },
	{ icon: 'goal-technique', text: 'Улучшить технику упражнений' },
	{ icon: 'goal-stamina', text: 'Повысить выносливость' },
	{ icon: 'goal-reduce-stress', text: 'Снизить уровень стресса' },
	{ icon: 'goal-pleasure', text: 'Получить удовольствие' },
]

/**
 * Шаг 8: Информационный экран о преимуществах регулярных тренировок
 */
export const SurveyStep8: React.FC = () => {
	return (
		<>
			<Text style={sharedStyles.title}>Супер!</Text>
			<Text className="mb-7 text-left text-t2 text-light-text-200">
				Вот чего вы сможете достичь, занимаясь в таком темпе
			</Text>
			<View className="gap-4 bg-transparent">
				{benefits.map((benefit, index) => (
					<FeatureCard key={index} icon={benefit.icon} text={benefit.text} />
				))}
			</View>
		</>
	)
}
