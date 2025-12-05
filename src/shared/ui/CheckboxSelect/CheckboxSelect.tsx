import React from 'react'
import { View } from 'react-native'
import { type CheckboxSelectProps } from './types'
import { checkboxSelectSizeStyles } from './styles'
import { CheckboxSelectOption } from './CheckboxSelectOption'

/**
 * Компонент CheckboxSelect для выбора нескольких вариантов из списка
 * Используется в опросе для выбора нескольких ответов
 *
 * С анимированным blur-эффектом при выборе и нажатии
 */
export const CheckboxSelect: React.FC<CheckboxSelectProps> = ({
    options,
    value,
    onChange,
    size = 'full',
    maxSelected,
    minSelected,
    disabled = false,
    className = '',
    isNeedCheckbox,
}) => {
    const sizeStyle = checkboxSelectSizeStyles[size]

    const handlePress = (optionValue: string) => {
        if (disabled) return

        const isSelected = value.includes(optionValue)
        let newValue: string[]

        if (isSelected) {
            // Убираем из выбранных
            newValue = value.filter((v) => v !== optionValue)

            // Проверяем минимальное количество
            if (minSelected && newValue.length < minSelected) {
                return // Не даем снять выбор если достигнут минимум
            }
        } else {
            // Добавляем к выбранным
            newValue = [...value, optionValue]

            // Проверяем максимальное количество
            if (maxSelected && newValue.length > maxSelected) {
                return // Не даем выбрать больше максимума
            }
        }

        onChange(newValue)
    }

    return (
        <View className={`gap-2 ${className}`}>
            {options.map((option) => {
                const isSelected = value.includes(option.value)

                return (
                    <CheckboxSelectOption
                        isNeedCheckbox={isNeedCheckbox}
                        key={option.value}
                        option={option}
                        isSelected={isSelected}
                        isPressed={false}
                        disabled={disabled}
                        iconSize={sizeStyle.iconSize}
                        textStyle={sizeStyle.text}
                        onPress={() => handlePress(option.value)}
                        onPressIn={() => {}}
                        onPressOut={() => {}}
                    />
                )
            })}
        </View>
    )
}
