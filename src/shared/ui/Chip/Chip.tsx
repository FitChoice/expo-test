import React from 'react'
import { View, Text } from 'react-native'
import type { ChipProps } from './types'

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'

export const Chip: React.FC<ChipProps> = ({ icon, text, variant = 'default' }) => {
    return (
        <View
            className={`flex-row items-center gap-2 rounded-full px-4 py-2 ${
                variant === 'default' 
                    ? 'bg-dark-surface-300/60' 
                    : 'bg-fill-100/20'
            }`}
        >
            {icon && (
                <MaterialCommunityIcons name={icon} size={16} color={'#FFFFFF'} />
            )}
            <Text className="font-inter text-sm font-medium text-white">
                {text}
            </Text>
        </View>
    )
}
