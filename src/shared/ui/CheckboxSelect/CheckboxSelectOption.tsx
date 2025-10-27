import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { GlowButton } from '../GlowButton'
import type { CheckboxSelectOption as CheckboxSelectOptionType } from './types'

interface CheckboxSelectOptionProps {
	option: CheckboxSelectOptionType
	isSelected: boolean
	isPressed: boolean
	disabled: boolean
	iconSize: number
	textStyle: string
	onPress: () => void
	onPressIn: () => void
	onPressOut: () => void
}

/**
 * Компонент отдельной опции CheckboxSelect с анимированным blur-эффектом
 */
export const CheckboxSelectOption: React.FC<CheckboxSelectOptionProps> = ({
	option,
	isSelected,
	disabled,
	iconSize,
	textStyle,
	onPress,
}) => {
	return (
		<GlowButton
			isSelected={isSelected}
			onPress={onPress}
			disabled={disabled}
			style={styles.optionContainer}
			contentStyle={styles.contentContainer}
		>
			{/* Иконка если есть */}
			{option.icon && (
				<View style={[styles.iconContainer, { width: iconSize, height: iconSize }]}>
					{option.icon}
				</View>
			)}

			{/* Текст */}
			<Text
				className={textStyle}
				style={[styles.optionText, { color: disabled ? '#C1C1C1' : '#FFFFFF' }]}
			>
				{option.label}
			</Text>
		</GlowButton>
	)
}

const styles = StyleSheet.create({
	optionContainer: {
		paddingHorizontal: 16,
		paddingVertical: 32,
		minHeight: 80,
	},
	contentContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	iconContainer: {
		borderRadius: 99,
		backgroundColor: '#1E1E1E',
		alignItems: 'center',
		justifyContent: 'center',
	},
	optionText: {
		flex: 1,
	},
})
