import React, { useState } from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'
import { BlurView } from 'expo-blur'
import * as ScreenOrientation from 'expo-screen-orientation'
import { Button, Icon, MaskedText } from '@/shared/ui'
import { Input } from '@/shared/ui/Input/Input'
import { useOrientation } from '@/shared/lib'
import { useRouter } from 'expo-router'
// Импорт изображения браслета
const braceletImage = require('../../../../assets/images/ultra-realistic-silicone.png')

/**
 * Страница входа/регистрации
 */
export const AuthScreen = () => {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Блокируем поворот экрана в портретную ориентацию
  useOrientation(ScreenOrientation.OrientationLock.PORTRAIT_UP)

  const handleSubmit = () => {
    // Заглушка для авторизации
    // Перенаправляем на главную страницу
    router.push('/')
  }

  return (
    <View style={styles.container}>
      {/* Основной контент */}
      <View style={styles.contentContainer} pointerEvents="box-none">
        {/* Группа с браслетом и заголовком (Group 316) */}
        <View style={styles.braceletGroup}>
          {/* Слой 1: Текст позади изображения (полностью видимый) */}
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
          
          {/* Слой 2: Текст перед изображением (только в области маски) */}
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
                x: 250,
                y: 5,
                width: 120,
                height: 120
              }}
            />
          </View>
        </View>
        {/* Декоративные элементы внутри контентного контейнера */}
        <View style={styles.decorativeContainer}>
          {/* Зеленый круг с размытием */}
          <BlurView intensity={100} tint="light" style={styles.greenCircle}>
            <View style={styles.greenCircleInner} />
          </BlurView>
          {/* Фиолетовый круг с размытием */}
          <BlurView intensity={100} tint="light" style={styles.purpleCircle}>
            <View style={styles.purpleCircleInner} />
          </BlurView>
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

        {/* Кнопка входа - приклеена к низу */}
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

      {/* Кнопка возврата назад - рендерится последней, чтобы быть поверх всех элементов */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.push('/')}
        activeOpacity={0.8}
      >
        <Icon name="chevron-left" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#151515', // BG/Dark 900 BG
  },
  backButton: {
    position: 'absolute',
    top: '4%', // Относительно высоты экрана
    left: '4%', // Относительно ширины экрана
    width: 48,
    height: 48,
    backgroundColor: 'rgba(244, 244, 244, 0.2)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10, // Поверх всех элементов
  },
  braceletGroup: {
    position: 'absolute',
    top: '-8%', // Относительно высоты контейнера
    left: '-12%', // Относительно ширины контейнера
    width: '120%', // Относительно ширины контейнера
    height: '110%', // Относительно высоты контейнера
    zIndex: 1,
  },
  titleUnderlay: {
    position: 'absolute',
    top: '45%', // Относительно высоты контейнера
    left: '10%', // Относительно ширины контейнера
    width: '80%', // Относительно ширины контейнера
    height: '10%', // Относительно высоты контейнера
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  titleOverlay: {
    position: 'absolute',
    top: '45%', // Относительно высоты контейнера
    left: '10%', // Относительно ширины контейнера
    width: '80%', // Относительно ширины контейнера
    height: '10%', // Относительно высоты контейнера
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  decorativeContainer: {
    position: 'absolute',
    top: 0,
    left: '-4%', // Относительно ширины контейнера
    right: '-4%',
    bottom: 0,
    zIndex: 0, // Под контентом
  },
  greenCircle: {
    position: 'absolute',
    top: '15%', // Относительно высоты контейнера
    right: '-25%', // Относительно ширины контейнера
    width: '55%', // Относительно ширины контейнера
    height: '55%', // Относительно ширины контейнера (круг)
    borderRadius: '50%',
    overflow: 'hidden',
  },
  greenCircleInner: {
    width: '100%',
    height: '100%',
    backgroundColor: '#C5F680', // Brand/Green 500
    borderRadius: '50%',
    opacity: 0.6, // Увеличена непрозрачность с 0.3 до 0.6
  },
  purpleCircle: {
    position: 'absolute',
    top: '60%', // Относительно высоты контейнера
    left: '-25%', // Относительно ширины контейнера
    width: '55%', // Относительно ширины контейнера
    height: '55%', // Относительно ширины контейнера (круг)
    borderRadius: '50%',
    overflow: 'hidden',
  },
  purpleCircleInner: {
    width: '100%',
    height: '100%',
    backgroundColor: '#BA9BF7', // Brand/Purple 500
    borderRadius: '50%',
    opacity: 0.6, // Увеличена непрозрачность с 0.3 до 0.6
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#1E1E1E', // BG/Dark 500 BG
    margin: '3%', // Относительно размера экрана
    borderRadius: 32,
    paddingHorizontal: '4%', // Относительно ширины контейнера
    paddingBottom: '20%', // Относительно высоты контейнера
    position: 'relative', // Для позиционирования декоративных элементов
    zIndex: 3, // Поверх браслета и заголовка
    justifyContent: 'flex-end', // Привязываем форму к низу
  },
  braceletImage: {
    position: 'absolute',
    top: '12%', // Относительно высоты контейнера
    left: '16%', // Относительно ширины контейнера
    width: '82%', // Относительно ширины контейнера
    height: '85%', // Относительно высоты контейнера
  },
  formContainer: {
    gap: 16,
    paddingBottom: '25%', // Относительно высоты контейнера
  },
  submitButton: {
    position: 'absolute',
    bottom: '6%', // Относительно высоты контейнера
    left: '4%', // Относительно ширины контейнера
    right: '4%', // Относительно ширины контейнера
  },
})
