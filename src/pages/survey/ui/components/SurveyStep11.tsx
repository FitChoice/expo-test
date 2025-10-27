import React from 'react'
import { View, Text } from 'react-native'
import { RadioSelect } from '@/shared/ui'
import type { Direction } from '@/entities/survey'
import { sharedStyles } from './shared-styles'

interface SurveyStep11Props {
	mainDirection: Direction | null
	onMainDirectionChange: (direction: Direction) => void
}

/**
 * Шаг 11: Выбор основного направления тренировок
 */
export const SurveyStep11: React.FC<SurveyStep11Props> = ({
	mainDirection,
	onMainDirectionChange,
}) => {
	return (
		<>
			<Text style={sharedStyles.title}>Какое направление будем считать основным?</Text>
			<View className="bg-transparent">
				<RadioSelect
					options={[
						{ value: 'strength', label: 'Силовые тренировки' },
						{ value: 'cardio', label: 'Кардио' },
						{ value: 'stretching', label: 'Растяжка' },
						{ value: 'back_health', label: 'Здоровая спина' },
					]}
					value={mainDirection || ''}
					onChange={(value) => onMainDirectionChange(value as Direction)}
				/>
			</View>
		</>
	)
}
