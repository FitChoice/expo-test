import React, { useState } from 'react'
import { View, Text, ScrollView } from 'react-native'
import { Button, Input, Icon } from '@/shared/ui'
import { router } from 'expo-router'

/**
 * Страница входа/регистрации
 */
export const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSubmit = () => {
    // Заглушка для авторизации
    console.log('Auth attempt:', { email, password, isLogin })
    
    // Перенаправляем на главную страницу
    router.replace('/')
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setPassword('')
    setConfirmPassword('')
  }

  return (
    <View className="flex-1 bg-gray-900">
      <ScrollView className="flex-1 px-6 py-12">
        {/* Заголовок */}
        <View className="items-center mb-8">
          <Text className="text-white text-3xl font-bold mb-2">
            Fitchoice
          </Text>
          <Text className="text-gray-400 text-lg">
            {isLogin ? 'Вход в приложение' : 'Регистрация'}
          </Text>
        </View>

        {/* Форма */}
        <View className="space-y-4">
          <Input
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            iconLeft={<Icon name="user" size={20} color="#9CA3AF" />}
          />

          <Input
            placeholder="Пароль"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            iconLeft={<Icon name="eye" size={20} color="#9CA3AF" />}
          />

          {!isLogin && (
            <Input
              placeholder="Подтвердите пароль"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              iconLeft={<Icon name="eye" size={20} color="#9CA3AF" />}
            />
          )}

          <Button
            variant="primary"
            size="l"
            fullWidth
            onPress={handleSubmit}
            disabled={!email || !password || (!isLogin && password !== confirmPassword)}
          >
            {isLogin ? 'Войти' : 'Зарегистрироваться'}
          </Button>
        </View>

        {/* Переключение режима */}
        <View className="items-center mt-6">
          <Button
            variant="ghost"
            onPress={toggleMode}
            iconRight={<Icon name="arrow-forward" size={16} color="#9CA3AF" />}
          >
            {isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Есть аккаунт? Войти'}
          </Button>
        </View>

        {/* Дополнительная информация */}
        <View className="mt-8 px-4">
          <Text className="text-gray-500 text-sm text-center leading-5">
            Нажимая кнопку "{isLogin ? 'Войти' : 'Зарегистрироваться'}", вы соглашаетесь с условиями использования и политикой конфиденциальности.
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}
