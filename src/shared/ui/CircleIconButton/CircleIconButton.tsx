import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import { Icon } from '../Icon'
import type { CircleIconButtonProps } from './types'

export const CircleIconButton: React.FC<CircleIconButtonProps> = ({
    icon = 'chevrons-right',
    size = 'large',
    onPress,
    disabled = false,
}) => {
    const sizeClasses = {
        small: 'h-12 w-12',
        medium: 'h-16 w-16',
        large: 'h-20 w-20',
    }

    const iconSizes = {
        small: 20,
        medium: 24,
        large: 32,
    }

    return (
        <TouchableOpacity onPress={onPress} disabled={disabled} activeOpacity={0.8}>
            <View
                className={`${sizeClasses[size]} items-center justify-center rounded-full bg-brand-purple-900`}
            >
                <Icon name={icon} size={iconSizes[size]} color="#FFFFFF" />
                {/* Двойной chevron эффект */}
                <View className="absolute" style={{ marginLeft: 6 }}>
                    <Icon name={icon} size={iconSizes[size]} color="#FFFFFF" />
                </View>
            </View>
        </TouchableOpacity>
    )
}
