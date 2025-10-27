import React from 'react'
import { View, Text } from 'react-native'
import { CheckboxSelect } from '@/shared/ui'
import type { Goal } from '@/entities/survey'
import { sharedStyles } from './shared-styles'

interface SurveyStep10Props {
	goals: Goal[]
	onGoalsChange: (goals: Goal[]) => void
	maxGoals?: number
}

/**
 * Шаг 10: Цели тренировок
 */
export const SurveyStep10: React.FC<SurveyStep10Props> = ({
	goals,
	onGoalsChange,
	maxGoals = 3,
}) => {
	return (
		<>
			<View className="gap-4 bg-transparent">
				<Text style={sharedStyles.title}>Для чего вы тренируетесь?</Text>
				<Text className="font-inter text-left text-base font-normal leading-[19.2px] text-white">
					Выберите до {maxGoals}-х целей
				</Text>
			</View>
			<View className="bg-transparent">
				<CheckboxSelect
					options={[
						{ value: 'posture', label: 'Улучшить осанку' },
						{ value: 'pain_relief', label: 'Избавиться от боли' },
						{ value: 'flexibility', label: 'Повысить гибкость' },
						{ value: 'strength', label: 'Укрепить тело и мышцы' },
						{ value: 'weight_loss', label: 'Сбросить вес и подтянуть фигуру' },
						{ value: 'stress_relief', label: 'Снизить стресс и напряжение' },
						{ value: 'energy', label: 'Повысить уровень энергии' },
						{ value: 'wellness', label: 'Улучшить общее самочувствие' },
					]}
					value={goals}
					onChange={(value) => onGoalsChange(value as Goal[])}
					size="full"
					maxSelected={maxGoals}
				/>
			</View>
		</>
	)
}
