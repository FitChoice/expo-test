import React, { useMemo } from 'react'
import { View, Text } from 'react-native'
import { CheckboxSelect, RadioSelect } from '@/shared/ui'
import type { Direction } from '@/entities/survey'
import { sharedStyles } from './shared-styles'

import Posture from '@/shared/ui/Icon/assets/posture-purple.svg'
import Cardio from '@/shared/ui/Icon/assets/cardio-purple.svg'
import Dumbbell from '@/shared/ui/Icon/assets/dumbbell-purple.svg'
import Stretching from '@/shared/ui/Icon/assets/stretching-purple.svg'

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
			{ value: 'strength' as Direction, label: 'Силовые тренировки', icon: <Dumbbell /> },
			{ value: 'cardio' as Direction, label: 'Кардио', icon:  <Cardio /> },
			{ value: 'stretching' as Direction, label: 'Растяжка', icon: <Stretching /> },
			{ value: 'back_health' as Direction, label: 'Здоровая спина', icon: <Posture /> },
		]

		return allDirections.filter((dir) => dir.value !== mainDirection)
	}, [mainDirection])



	return (
		<>
			<Text style={sharedStyles.title}>что ещё будем прокачивать?</Text>
			<View className="bg-transparent">
				<RadioSelect
					options={availableDirections}
					value={additionalDirections || ''}
					onChange={(value) => onAdditionalDirectionsChange(value as Direction)}
				/>
			</View>
		</>
	)
}
