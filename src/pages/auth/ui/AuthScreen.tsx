import React, { useState } from 'react'
import { View, Alert, Image as RNImage, Animated, Pressable, Text } from 'react-native'
import * as ScreenOrientation from 'expo-screen-orientation'
import * as SecureStore from 'expo-secure-store'
import { Button, BackButton, MaskedText, BackgroundLayout, Input } from '@/shared/ui'
import { useOrientation, useKeyboardAnimation } from '@/shared/lib'
import { useRouter } from 'expo-router'
import { authApi } from '@/features/auth'
// Импорт изображения браслета
import braceletImage from '../../../../assets/images/ultra-realistic-silicone.png'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

// Константы для MaskedText
const TEXT_CONFIG = {
    width: 400,
    height: 40,
    y: 20,
    fontSize: 29.64,
    fill: '#FFFFFF',
    letterSpacing: '-0.03',
    textAlign: 'middle' as const,
    fontFamily: 'Rimma_sans',
}

const MASK_RECT = {
    x: 160, // 40% от 400px
    y: 0,
    width: 240, // 60% от 400px
    height: 160,
}

/**
 * Страница входа
 */
export const AuthScreen = () => {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [emailError, setEmailError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const insets = useSafeAreaInsets()
    // Используем хук для анимации клавиатуры
    const { translateY, opacity: braceletOpacity } = useKeyboardAnimation({
        animateOpacity: true,
        offsetMultiplier: 0.3,
    })

    // Блокируем поворот экрана в портретную ориентацию
    useOrientation(ScreenOrientation.OrientationLock.PORTRAIT_UP)

    // Валидация email
    const validateEmail = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (email && !emailRegex.test(email)) {
            setEmailError('Введите корректный email')
        } else {
            setEmailError('')
        }
    }

    // Обработчик фокуса на поле email
    const handleEmailFocus = () => {
        // Empty by design
    }

    // Обработчик потери фокуса на поле email
    const handleEmailBlur = () => {
        validateEmail()
    }

    const handleSubmit = async () => {
        // Dismiss keyboard
        //Keyboard.dismiss()

        setIsLoading(true)

        try {
            const result = await authApi.login({ email, password })

            if (result.success) {
                // Save tokens to secure storage (user_id already saved in authApi)
                await SecureStore.setItemAsync('auth_token', result.data.access_token)
                await SecureStore.setItemAsync('refresh_token', result.data.refresh_token)
				
                // Navigate to home
                router.push('/home')
            } else {
                Alert.alert('Ошибка', result.error || 'Не удалось войти')
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Не удалось войти'
            Alert.alert('Ошибка', errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <View className="bg-bg-dark-700 flex-1">
            <BackgroundLayout>
                <View className="flex-1 justify-between px-4 pt-[14px]">
                    {/* Кнопка возврата назад */}
                    <BackButton onPress={() => router.push('/')} />

                    {/* Основной контент */}
                    <View className="relative z-[3] flex-1 ">
                        {/* Группа с браслетом и заголовком */}
                        <Animated.View
                            style={{
                                position: 'absolute',
                                top: '-35%',
                                left: '42%',
                                height: '120%',
                                width: '110%',
                                transform: [{ translateX: '-50%' }],
                                alignItems: 'center',
                                justifyContent: 'flex-start',
                                zIndex: 1,
                                opacity: braceletOpacity,
                            }}
                        >
                            {/* Текст позади изображения */}
                            <View
                                style={{
                                    position: 'absolute',
                                    top: '45%',
                                    left: 0,
                                    right: 0,
                                    height: TEXT_CONFIG.height,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <MaskedText text="вход в аккаунт" {...TEXT_CONFIG} />
                            </View>

                            {/* Изображение браслета */}
                            <RNImage
                                source={braceletImage}
                                style={{
                                    position: 'absolute',
                                    top: '6%',
                                    left: '16%',
                                    width: '82%',
                                    height: '85%',
                                }}
                                resizeMode="contain"
                            />

                            {/* Текст перед изображением */}
                            <View
                                style={{
                                    position: 'absolute',
                                    top: '45%',
                                    left: 0,
                                    right: 0,
                                    height: TEXT_CONFIG.height,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <MaskedText text="вход в аккаунт" {...TEXT_CONFIG} maskRect={MASK_RECT} />
                            </View>
                        </Animated.View>

                        {/* Форма */}
                        <Animated.View
                            className="absolute top-[40%] z-10 w-[100%] gap-4"
                            style={{ transform: [{ translateY }] }}
                        >
                            <Input
                                label="Электронная почта"
                                placeholder="example@provider.com"
                                value={email}
                                onChangeText={setEmail}
                                onFocus={handleEmailFocus}
                                onBlur={handleEmailBlur}
                                keyboardType="email-address"
                                variant="text"
                                size="default"
                                error={emailError}
                            />

                            <Input
                                label="Пароль"
                                placeholder="Пароль"
                                value={password}
                                onChangeText={setPassword}
                                variant="password"
                                size="default"
                            />
                            
                            <Pressable onPress={() => router.push('/forgot-password')} className="mt-1">
                                <Text className="text-text-primary-300 text-sm">
                                    Забыли пароль?
                                </Text>
                            </Pressable>
                        </Animated.View>
                    </View>

                    {/* Кнопки внизу экрана */}
                    <View className="gap-2 pt-8" style={{ paddingBottom: insets.bottom + 10 }}>
                        {/* Кнопка входа */}
                        <Animated.View className="w-full" style={{ transform: [{ translateY }] }}>
                            <Button
                                variant="primary"
                                size="l"
                                fullWidth
                                onPress={handleSubmit}
                                disabled={!email || !password || !!emailError || isLoading}
                                className="h-14"
                            >
                                {isLoading ? 'Вход...' : 'Войти'}
                            </Button>
                        </Animated.View>
                    </View>
                </View>
            </BackgroundLayout>
        </View>
    )
}
