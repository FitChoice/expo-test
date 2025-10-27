import React from 'react'
import { View, Text } from 'react-native'
import { RadioSelect } from '@/shared/ui'
import type { Frequency } from '@/entities/survey'
import { sharedStyles } from './shared-styles'

interface SurveyStep9Props {
	frequency: Frequency | null
	onFrequencyChange: (frequency: Frequency) => void
}

/**
 * Шаг 9: Текущая частота тренировок
 */
export const SurveyStep9: React.FC<SurveyStep9Props> = ({
	frequency,
	onFrequencyChange,
}) => {
	return (
		<>
			<Text style={sharedStyles.title}>как часто вы тренируетесь сейчас?</Text>
			<View className="bg-transparent">
				<RadioSelect
					options={[
						{ value: 'never', label: 'Не тренируюсь' },
						{ value: 'sometimes', label: 'Иногда двигаюсь' },
						{ value: '2-3times', label: '2-3 раза в неделю' },
						{ value: 'almost_daily', label: 'Почти каждый день' },
					]}
					value={frequency || ''}
					onChange={(value) => onFrequencyChange(value as Frequency)}
				/>
			</View>
		</>
	)
}
