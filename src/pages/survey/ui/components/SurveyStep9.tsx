import React from 'react'
import { View, Text } from 'react-native'
import { RadioSelect } from '@/shared/ui'
import type { Frequency } from '@/entities/survey'
import { sharedStyles } from '@/shared/ui/styles/shared-styles'

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
						{ value: '0', label: 'Не тренируюсь' },
						{ value: '1', label: 'Иногда двигаюсь' },
						{ value: '2', label: '2-3 раза в неделю' },
						{ value: '3', label: 'Почти каждый день' },
					]}
					value={String(frequency) || '0'}
					onChange={(value) => onFrequencyChange(Number(value) as Frequency)}
				/>
			</View>
		</>
	)
}
