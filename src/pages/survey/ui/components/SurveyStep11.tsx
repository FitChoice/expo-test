import React from 'react'
import { View, Text } from 'react-native'
import { RadioSelect } from '@/shared/ui'
import type { Direction } from '@/entities/survey'
import { sharedStyles } from '@/shared/ui/styles/shared-styles'

import Posture from '@/shared/ui/Icon/assets/posture-purple.svg'
import Cardio from '@/shared/ui/Icon/assets/cardio-purple.svg'
import Dumbbell from '@/shared/ui/Icon/assets/dumbbell-purple.svg'
import Stretching from '@/shared/ui/Icon/assets/stretching-purple.svg'

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
						{ value: '0', label: 'Силовые тренировки', icon: <Dumbbell /> },
						{ value: '1', label: 'Кардио', icon: <Cardio /> },
						{ value: '2', label: 'Растяжка', icon: <Stretching /> },
						{ value: '3', label: 'Здоровая спина', icon: <Posture /> },
					]}
					value={String(mainDirection) || ''}
					onChange={(value) => onMainDirectionChange(Number(value) as Direction)}
				/>
			</View>
		</>
	)
}
