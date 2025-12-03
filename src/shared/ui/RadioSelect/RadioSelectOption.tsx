import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { GlowButton } from '../GlowButton'
import type { RadioSelectOption as RadioSelectOptionType } from './types'

interface RadioSelectOptionProps {
	option: RadioSelectOptionType
	isSelected: boolean
	isPressed: boolean
	disabled: boolean
	onPress: () => void
	onPressIn: () => void
	onPressOut: () => void,
	isNeedCheckbox?: boolean
}

/**
 * Компонент отдельной опции RadioSelect с анимированным blur-эффектом
 */
export const RadioSelectOption: React.FC<RadioSelectOptionProps> = ({
    option,
    isSelected,
    disabled,
    onPress,
    isNeedCheckbox
}) => {
    return (
        <GlowButton
            isSelected={isSelected}
            onPress={onPress}
            disabled={disabled}
            style={styles.optionContainer}
            contentStyle={styles.contentContainer}
            isNeedCheckbox={isNeedCheckbox}
        >
            {/* Иконка если есть */}
            {option.icon && <View style={styles.iconContainer}>{option.icon}</View>}

            {/* Текст */}
            <Text style={[styles.optionText, { color: disabled ? '#C1C1C1' : '#FFFFFF' }]}>
                {option.label}
            </Text>
        </GlowButton>
    )
}

const styles = StyleSheet.create({
    optionContainer: {
        paddingHorizontal: 20,
        paddingVertical: 18,
        minHeight: 56,
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        //justifyContent: 'center',
    },
    iconContainer: {
        marginRight: 8,
    },
    optionText: {
        fontFamily: 'Onest',
        fontWeight: '500',
        fontSize: 14,
        lineHeight: 16.8,
    },
})
