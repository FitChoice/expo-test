/**
 * Avatar - компонент аватара пользователя
 * Поддерживает отображение изображения, placeholder и режим редактирования
 */

import React from 'react'
import { View, Image, Pressable, Text, ActivityIndicator } from 'react-native'
import { Icon } from '../Icon'
import type { AvatarProps } from './types'

export const Avatar: React.FC<AvatarProps> = ({
    source,
    size = 100,
    editable = false,
    onPress,
    loading = false,
}) => {
    const content = (
        <View
            style={{ width: size, height: size, borderRadius: size / 2 }}
            className="overflow-hidden bg-fill-700"
        >
            {source ? (
                <Image
                    source={{ uri: source }}
                    style={{ width: size, height: size }}
                    resizeMode="cover"
                />
            ) : (
                <View className="flex-1 items-center justify-center">
                    <Icon name="user" size={size * 0.5} color="#949494" />
                </View>
            )}

            {editable && !loading && (
                <View className="absolute inset-0 items-center justify-center bg-black/50">
                    <Icon name="pencil-simple" size={24} color="#FFFFFF" />
                    <Text className="mt-1 text-t4 text-white">Изменить</Text>
                </View>
            )}

            {loading && (
                <View className="absolute inset-0 items-center justify-center bg-black/50">
                    <ActivityIndicator color="#FFFFFF" />
                </View>
            )}
        </View>
    )

    if (onPress) {
        return (
            <Pressable onPress={onPress} className="active:opacity-80">
                {content}
            </Pressable>
        )
    }

    return content
}
