import React, { useState } from 'react'
import { View, Text, Animated } from 'react-native'
import * as ScreenOrientation from 'expo-screen-orientation'
import { Button, BackButton, BackgroundLayout, Input } from '@/shared/ui'
import { useOrientation, useKeyboardAnimation } from '@/shared/lib'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { sharedStyles } from '@/pages/survey/ui/components/shared-styles'

/**
 * Страница восстановления пароля
 */
export const ForgotPasswordScreen = () => {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [emailError, setEmailError] = useState('')
    const insets = useSafeAreaInsets()
    
    const { translateY } = useKeyboardAnimation({
        animateOpacity: false,
        offsetMultiplier: 0.3,
    })

    useOrientation(ScreenOrientation.OrientationLock.PORTRAIT_UP)

    const validateEmail = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (email && !emailRegex.test(email)) {
            setEmailError('Введите корректный email')
        } else {
            setEmailError('')
        }
    }

    const handleEmailBlur = () => {
        validateEmail()
    }

    const handleSubmit = async () => {
        // TODO: Implement password reset logic
        console.log('Send reset code to:', email)
    }

    return (
        <View className="bg-bg-dark-700 flex-1">
            <BackgroundLayout>
                <View className="flex-1">
                    <BackButton onPress={() => router.back()} />

                    <View className="flex-1 justify-start pt-40">
                        <Animated.View 
                            className="gap-20"
                            style={{ transform: [{ translateY }] }}
                        >
                            <View className="gap-3">
                                <Text style={sharedStyles.titleCenter}  >
                                    ВВЕДИТЕ ПОЧТУ,{'\n'}С КОТОРОЙ{'\n'}РЕГИСТРИРОВАЛИСЬ
                                </Text>
                                <Text className="text-light-text-200 text-t2 text-center">
                                    И мы вышлем код подтверждения
                                </Text>
                            </View>

                            <Input
                                label="Электронная почта"
                                placeholder="example@provider.com"
                                value={email}
                                onChangeText={setEmail}
                                onBlur={handleEmailBlur}
                                keyboardType="email-address"
                                variant="text"
                                size="default"
                                error={emailError}
                            />
                        </Animated.View>
                    </View>

                    <View className="gap-2 pt-8" style={{ paddingBottom: insets.bottom + 10 }}>
                        <Animated.View className="w-full" style={{ transform: [{ translateY }] }}>
                            <Button
                                variant="primary"
                                size="l"
                                fullWidth
                                onPress={handleSubmit}
                                disabled={!email || !!emailError}
                                className="h-14"
                            >
                                Отправить
                            </Button>
                        </Animated.View>
                        
                        <Button
                            variant="secondary"
                            size="l"
                            fullWidth
                            onPress={() => router.back()}
                            className="h-14"
                        >
                            Назад
                        </Button>
                    </View>
                </View>
            </BackgroundLayout>
        </View>
    )
}
