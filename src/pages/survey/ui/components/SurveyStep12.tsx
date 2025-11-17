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
	mainDirection: string
	additionalDirection: Direction | null
	onAdditionalDirectionsChange: (direction: Direction) => void
}

/**
 * Шаг 12: Выбор дополнительных направлений тренировок
 */
export const SurveyStep12: React.FC<SurveyStep12Props> = ({
	mainDirection,
	additionalDirection,
	onAdditionalDirectionsChange,
}) => {


	const availableDirections = useMemo(() => {
		const allDirections = [
			{ value: '0' , label: 'Силовые тренировки', icon: <Dumbbell /> },
			{ value: '1', label: 'Кардио', icon:  <Cardio /> },
			{ value: '2', label: 'Растяжка', icon: <Stretching /> },
			{ value: '3' , label: 'Здоровая спина', icon: <Posture /> },
		]

		return allDirections.filter((dir) => dir.value !== mainDirection)
	}, [mainDirection])



	return (
		<>
			<Text style={sharedStyles.title}>что ещё будем прокачивать?</Text>
			<View className="bg-transparent">
				<RadioSelect
					options={availableDirections}
					value={String(additionalDirection) || ''}
					onChange={(value) => onAdditionalDirectionsChange(Number(value) as Direction)}
				/>
			</View>
		</>
	)
}
