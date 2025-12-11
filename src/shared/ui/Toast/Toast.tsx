/**
 * Toast - dumb component for displaying notifications
 * Managed by react-native-toast-message
 */

import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Icon } from '../Icon'
import type { ToastProps } from './types'

export const Toast: React.FC<ToastProps> = ({
    message,
    variant = 'success',
    onHide,
}) => {
    const iconName = variant === 'success' ? 'check' : 'warning'
    const iconColor = variant === 'success' ? '#00CF1B' : '#FF2854'

    return (
        <View className="mx-4 flex-row items-center gap-3 rounded-2xl bg-fill-800 p-4 shadow-lg">
            <Icon name={iconName} size={24} color={iconColor} />
            <Text className="flex-1 text-t2 text-white">{message}</Text>
            <TouchableOpacity onPress={onHide} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Icon name="close" size={20} color="#FFFFFF" />
            </TouchableOpacity>
        </View>
    )
}
