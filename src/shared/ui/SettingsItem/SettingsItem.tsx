/**
 * SettingsItem - элемент настроек
 * Используется в секциях настроек профиля
 */

import React from 'react'
import { View, Text, Pressable } from 'react-native'
import type { SettingsItemProps } from './types'

export const SettingsItem: React.FC<SettingsItemProps> = ({
    label,
    description,
    rightElement,
    onPress,
    showDivider = true,
}) => {
    const content = (
        <>
            <View className="flex-row items-center justify-between py-3">
                <View className="flex-1 pr-4">
                    <Text className="text-t2 text-white">{label}</Text>
                    {description && (
                        <Text className="mt-1 text-t4 text-light-text-500">{description}</Text>
                    )}
                </View>
                {rightElement}
            </View>
            {showDivider && <View className="h-px bg-fill-800" />}
        </>
    )

    if (onPress) {
        return (
            <Pressable onPress={onPress} className="active:opacity-70">
                {content}
            </Pressable>
        )
    }

    return <View>{content}</View>
}
