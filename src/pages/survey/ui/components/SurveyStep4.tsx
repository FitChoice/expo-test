import React from 'react'
import { View, Text } from 'react-native'
import { Icon, Input } from '@/shared/ui'
import { sharedStyles } from '@/shared/ui/styles/shared-styles'

interface SurveyStep4Props {
	height: number | null
	weight: number | null
	onHeightChange: (height: number | null) => void
	onWeightChange: (weight: number | null) => void
}

/**
 * Шаг 4: Ввод параметров (рост и вес)
 */
export const SurveyStep4: React.FC<SurveyStep4Props> = ({
	height,
	weight,
	onHeightChange,
	onWeightChange,
}) => {
	const heightError =
		height !== null && height.toString().length >= 3 && (height < 150 || height > 200)
			? 'введено неверное значение'
			: undefined

	const weightError =
		weight !== null && weight.toString().length >= 2 && (weight < 40 || weight > 120)
			? 'введено неверное значение'
			: undefined

	return (
		<>
			<Text style={sharedStyles.title}>параметры</Text>
			<View className="gap-6 bg-transparent">
				<Input
					label="Рост"
					placeholder="В сантиметрах"
					value={height?.toString() || ''}
					onChangeText={(text) => {
						const cleaned = text.replace(/[^0-9]/g, '')
						onHeightChange(cleaned ? parseFloat(cleaned) : null)
					}}
					variant="text"
					size="default"
					keyboardType="numeric"
					maxLength={3}
					error={heightError}
					leftIcon={<Icon name="ruler" size={16} color="#FFFFFF" />}
				/>
				<Input
					label="Вес"
					placeholder="В килограммах"
					value={weight?.toString() || ''}
					onChangeText={(text) => {
						const cleaned = text.replace(/[^0-9]/g, '')
						onWeightChange(cleaned ? parseFloat(cleaned) : null)
					}}
					variant="text"
					size="default"
					keyboardType="numeric"
					maxLength={3}
					error={weightError}
					leftIcon={<Icon name="barbell" size={16} color="#FFFFFF" />}
				/>
			</View>
		</>
	)
}
