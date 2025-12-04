import React from 'react'
import { TouchableOpacity } from 'react-native'
import { Icon } from '../Icon/Icon'
import type { CheckboxProps } from './types'

/**
 * Простой чекбокс компонент
 */
export const Checkbox: React.FC<CheckboxProps> = ({
    checked,
    onChange,
    size = 'md',
    disabled = false,
    className = '',
}) => {
    const handlePress = () => {
        if (!disabled) {
            onChange(!checked)
        }
    }

    const sizeStyles = {
        sm: { size: 32, icon: 18 },
        md: { size: 36, icon: 20 },
        lg: { size: 40, icon: 24 },
    }

    const currentSize = sizeStyles[size]

    return (
        <TouchableOpacity
            onPress={handlePress}
            disabled={disabled}
            className={`items-center justify-center rounded-full ${
                checked ? 'bg-[#C5F680]' : 'border-2 border-white bg-transparent'
            } ${disabled ? 'opacity-50' : ''} ${className}`}
            style={{
                width: currentSize.size,
                height: currentSize.size,
            }}
        >
            {checked && <Icon name="check" size={currentSize.icon} color="#161616" />}
        </TouchableOpacity>
    )
}
