import React from 'react'
import { Text } from 'react-native'

interface SimpleIconProps {
	name: string
	size?: number
	color?: string
	style?: object
}

// Простая заглушка для иконок без SVG
export const SimpleIcon = ({
    name,
    size = 16,
    color = '#FFFFFF',
    style,
}: SimpleIconProps) => {
    const getIconSymbol = (iconName: string) => {
        const iconMap: Record<string, string> = {
            eye: '👁',
            'eye-slash': '👁‍🗨',
            'chevron-down': '▼',
            'chevron-up': '▲',
            'chevron-left': '◀',
            'chevron-right': '▶',
            'arrow-forward': '→',
            'arrow-back': '←',
            close: '✕',
            check: '✓',
            'check-circle': '✓',
            plus: '+',
            share: '📤',
            reload: '↻',
            'sign-out': '🚪',
            user: '👤',
            camera: '📷',
            file: '📄',
            info: 'ℹ',
            default: '●',
        }

        return iconMap[iconName] || iconMap['default']
    }

    return (
        <Text
            style={[
                {
                    fontSize: size,
                    color: color,
                    textAlign: 'center',
                },
                style,
            ]}
        >
            {getIconSymbol(name)}
        </Text>
    )
}
