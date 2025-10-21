import React, { useState } from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'
import * as ScreenOrientation from 'expo-screen-orientation'
import { Button, Icon, MaskedText, BackgroundLayout } from '@/shared/ui'
import { Input } from '@/shared/ui/Input/Input'
import { useOrientation } from '@/shared/lib'
import { useRouter } from 'expo-router'
// Импорт изображения браслета
const braceletImage = require('../../../../assets/images/ultra-realistic-silicone.png')

/**
 * Страница входа
 */
export const AuthScreen = () => {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Блокируем поворот экрана в портретную ориентацию
  useOrientation(ScreenOrientation.OrientationLock.PORTRAIT_UP)

  const handleSubmit = () => {
    // Перенаправляем на главную страницу
    router.push('/home')
  }

  return (
    <View style={styles.pageContainer}>
      <BackgroundLayout>
        <View style={styles.mainContainer}>
          {/* Кнопка возврата назад */}
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.push('/')}
            activeOpacity={0.8}
          >
            <Icon name="chevron-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Основной контент */}
          <View style={styles.contentContainer}>
            {/* Группа с браслетом и заголовком */}
            <View style={styles.braceletGroup}>
              {/* Текст позади изображения */}
              <View style={styles.titleUnderlay}>
                <MaskedText
                  text="вход в аккаунт"
                  width={400}
                  height={40}
                  x={200}
                  y={20}
                  fontSize={29.64}
                  fill="#FFFFFF"
                  fontWeight="700"
                  letterSpacing="-0.03"
                  textAlign="middle"
                  fontFamily="Rimma_sans"
                  debug={false}
                />
              </View>
              
              {/* Изображение браслета */}
              <Image 
                source={braceletImage} 
                style={styles.braceletImage}
                resizeMode="contain"
              />
              
              {/* Текст перед изображением */}
              <View style={styles.titleOverlay}>
                <MaskedText
                  text="вход в аккаунт"
                  width={400}
                  height={40}
                  x={200}
                  y={20}
                  fontSize={29.64}
                  fill="#FFFFFF"
                  fontWeight="700"
                  letterSpacing="-0.03"
                  textAlign="middle"
                  fontFamily="Rimma_sans"
                  debug={false}
                  maskRect={{
                    x: 160, // 40% от 400px = 160px
                    y: 0, // 0% от 40px = 0px
                    width: 240, // 60% от 400px = 240px
                    height: 160 // 400% от 40px = 160px
                  }}
                />
              </View>
            </View>

            {/* Форма */}
            <View style={styles.formContainer}>
              <Input
                label="Электронная почта"
                placeholder="example@provider.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                variant="text"
                size="default"
              />

              <Input
                label="Пароль"
                placeholder="Пароль"
                value={password}
                onChangeText={setPassword}
                variant="password"
                size="default"
              />
            </View>
          </View>

          {/* Кнопки внизу экрана */}
          <View style={styles.bottomButtons}>
            {/* Кнопка входа */}
            <Button
              variant="primary"
              size="l"
              fullWidth
              onPress={handleSubmit}
              disabled={!email || !password}
              style={styles.submitButton}
            >
              Войти
            </Button>
          </View>
        </View>
      </BackgroundLayout>
    </View>
  )
}

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: '#151515',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingTop: 14,
    justifyContent: 'space-between',
  },
  backButton: {
    position: 'absolute',
    top: 14,
    left: 14,
    width: 48,
    height: 48,
    backgroundColor: 'rgba(244, 244, 244, 0.2)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    position: 'relative',
    zIndex: 3,
  },
  braceletGroup: {
    position: 'absolute',
    top: '-40%', // Поднимаем выше для верхней четверти экрана
    left: '45%', // Сдвигаем правее
    transform: [{ translateX: '-50%' }], // Центрируем относительно новой позиции
    width: '120%', // Увеличиваем размер
    height: '130%', // Увеличиваем высоту тоже
    zIndex: 1,
  },
  titleUnderlay: {
    position: 'absolute',
    top: '45%',
    left: '10%',
    width: '80%',
    height: '10%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  titleOverlay: {
    position: 'absolute',
    top: '45%',
    left: '10%',
    width: '80%',
    height: '10%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  braceletImage: {
    position: 'absolute',
    top: '6%', // Поднимаем картинку еще выше
    left: '16%',
    width: '82%',
    height: '85%',
  },
  formContainer: {
    position: 'absolute',
    top: '40%', // Опускаем блок с полями
    left: '2%', // Меньший отступ слева
    width: '96%', // Шире
    gap: 16,
    zIndex: 10, // Поверх всех элементов
  },
  bottomButtons: {
    paddingTop: 32,
    paddingBottom: 50,
    gap: 8,
  },
  submitButton: {
    height: 56,
  },
})
