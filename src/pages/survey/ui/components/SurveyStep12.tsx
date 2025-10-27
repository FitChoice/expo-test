import React, { useMemo } from 'react'
import { View, Text } from 'react-native'
import { CheckboxSelect } from '@/shared/ui'
import type { Direction } from '@/entities/survey'
import { sharedStyles } from './shared-styles'

interface SurveyStep12Props {
	mainDirection: Direction | null
	additionalDirections: Direction[]
	onAdditionalDirectionsChange: (directions: Direction[]) => void
}

/**
 * Шаг 12: Выбор дополнительных направлений тренировок
 */
export const SurveyStep12: React.FC<SurveyStep12Props> = ({
	mainDirection,
	additionalDirections,
	onAdditionalDirectionsChange,
}) => {
	const availableDirections = useMemo(() => {
		const allDirections = [
			{ value: 'strength' as Direction, label: 'Силовые тренировки' },
			{ value: 'cardio' as Direction, label: 'Кардио' },
			{ value: 'stretching' as Direction, label: 'Растяжка' },
			{ value: 'back_health' as Direction, label: 'Здоровая спина' },
		]

		return allDirections.filter((dir) => dir.value !== mainDirection)
	}, [mainDirection])

	return (
		<>
			<Text style={sharedStyles.title}>что еще будем прокачивать?</Text>
			<View className="bg-transparent">
				<CheckboxSelect
					options={availableDirections}
					value={additionalDirections}
					onChange={(value) => onAdditionalDirectionsChange(value as Direction[])}
					size="full"
				/>
			</View>
		</>
	)
}
