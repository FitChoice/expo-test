import React from 'react'
import { View, Text } from 'react-native'
import { RadioSelect } from '@/shared/ui'
import type { Direction } from '@/entities/survey'
import { sharedStyles } from './shared-styles'

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
						{ value: 'strength', label: 'Силовые тренировки', icon: <Dumbbell /> },
						{ value: 'cardio', label: 'Кардио', icon:  <Cardio /> },
						{ value: 'stretching', label: 'Растяжка', icon: <Stretching /> },
						{ value: 'back_health', label: 'Здоровая спина', icon: <Posture /> },
					]}
					value={mainDirection || ''}
					onChange={(value) => onMainDirectionChange(value as Direction)}
				/>
			</View>
		</>
	)
}
