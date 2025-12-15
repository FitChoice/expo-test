/**
 * ChatHeader - заголовок экрана чата
 * Соответствие макету: градиентный фон, скруглённые углы, кнопка назад
 * Tap на заголовок/иконку переключает Mock режим
 */

import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { BlurView } from 'expo-blur'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Icon, BackButton } from '@/shared/ui'
import { GradientHeader } from '@/shared/ui/GradientBG/GradientHeader'

interface ChatHeaderProps {
    title?: string
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ title = 'ИИ-ассистент' }) => {
    const insets = useSafeAreaInsets()
    const handleBack = () => {
        if (router.canGoBack()) {
            router.back()
        } else {
            router.replace('/home')
        }
    }

    return (
        <View className="relative overflow-hidden rounded-b-3xl">
            {/* Градиентный фон */}
            <View className="absolute inset-0">
                <GradientHeader />
            </View>

            {/* Blur overlay */}
            <BlurView intensity={20} tint="dark" className="absolute inset-0" />

            {/* Content */}
            <View style={{ paddingTop: insets.top }}>
                <View className="flex-row items-center justify-between px-4 pb-4 pt-3">
                    {/* Back button - переиспользуем shared компонент */}
                    <BackButton
                        onPress={handleBack}
                        variant="translucent"
                        position="relative"
                        style={{ marginTop: 0 }}
                    />

                    {/* Title */}
                    <Pressable className="flex-row items-center">
                        <Text
                            className="text-light-text-100"
                            style={{
                                fontFamily: 'Inter',
                                fontWeight: '600',
                                fontSize: 17,
                            }}
                        >
                            {title}
                        </Text>
                    </Pressable>

                    <View
                        className="h-12 w-12 items-center justify-center rounded-2xl border-2"
                        style={{
                            borderColor: '#8BC34A',
                            backgroundColor: 'transparent',
                        }}
                    >
                        <Icon name="ai-chat" size={24} color="#8BC34A" />
                    </View>
                </View>
            </View>
        </View>
    )
}
