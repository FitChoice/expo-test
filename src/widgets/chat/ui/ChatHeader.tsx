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
import { useChatStore } from '@/features/chat'

interface ChatHeaderProps {
    title?: string
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ title = 'ИИ-ассистент' }) => {
    const insets = useSafeAreaInsets()
    const { isMockMode, toggleMockMode } = useChatStore()

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

                    {/* Title - tap для переключения mock режима */}
                    <Pressable onPress={toggleMockMode} className="flex-row items-center">
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
                        {/* Mock mode indicator */}
                        {isMockMode && (
                            <View className="ml-2 rounded-full bg-brand-green-500 px-2 py-0.5">
                                <Text
                                    style={{
                                        fontFamily: 'Inter',
                                        fontWeight: '500',
                                        fontSize: 10,
                                        color: '#0A0A0A',
                                    }}
                                >
                                    MOCK
                                </Text>
                            </View>
                        )}
                    </Pressable>

                    {/* AI icon - tap для переключения mock режима */}
                    <Pressable
                        onPress={toggleMockMode}
                        className="h-12 w-12 items-center justify-center rounded-2xl border-2"
                        style={{
                            borderColor: isMockMode ? '#C5F680' : '#8BC34A',
                            backgroundColor: isMockMode ? 'rgba(197, 246, 128, 0.1)' : 'transparent',
                        }}
                    >
                        <Icon name="ai-chat" size={24} color={isMockMode ? '#C5F680' : '#8BC34A'} />
                    </Pressable>
                </View>
            </View>
        </View>
    )
}
