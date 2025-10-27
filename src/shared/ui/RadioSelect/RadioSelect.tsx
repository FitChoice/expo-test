import React from 'react'
import { View } from 'react-native'
import { RadioSelectProps } from './types'
import { RadioSelectOption } from './RadioSelectOption'

/**
 * Компонент RadioSelect для выбора одного варианта из списка
 * Используется в опросе для выбора одного ответа
 *
 * С анимированным blur-эффектом при выборе и нажатии
 */
export const RadioSelect: React.FC<RadioSelectProps> = ({
	options,
	value,
	onChange,
	disabled = false,
}) => {
	const handlePress = (optionValue: string) => {
		if (disabled) return
		onChange(optionValue)
	}

	return (
		<View className="gap-2">
			{options.map((option) => {
				const isSelected = value === option.value

				return (
					<RadioSelectOption
						key={option.value}
						option={option}
						isSelected={isSelected}
						isPressed={false}
						disabled={disabled}
						onPress={() => handlePress(option.value)}
						onPressIn={() => {}}
						onPressOut={() => {}}
					/>
				)
			})}
		</View>
	)
}
