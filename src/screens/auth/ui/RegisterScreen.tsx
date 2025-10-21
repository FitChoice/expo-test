import React, { useState, useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity, Keyboard, KeyboardAvoidingView, Platform, Animated, TextInput } from 'react-native'
import * as ScreenOrientation from 'expo-screen-orientation'
import { Button, Icon, MaskedText, BackgroundLayout } from '@/shared/ui'
import { Input } from '@/shared/ui/Input/Input'
import { useOrientation } from '@/shared/lib'
import { useRouter } from 'expo-router'
// Импорт изображения браслета
const braceletImage = require('../../../../assets/images/ultra-realistic-silicone.png')

/**
 * Страница регистрации
 */
export const RegisterScreen = () => {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [showPasswordHelper, setShowPasswordHelper] = useState(false)
  const [passwordHelperText, setPasswordHelperText] = useState('')
  const [passwordTouched, setPasswordTouched] = useState(false)
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false)
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const [isAnyInputFocused, setIsAnyInputFocused] = useState(false)
  const translateY = useRef(new Animated.Value(0)).current
  const braceletOpacity = useRef(new Animated.Value(1)).current

  // Блокируем поворот экрана в портретную ориентацию
  useOrientation(ScreenOrientation.OrientationLock.PORTRAIT_UP)

  // Обработка событий клавиатуры
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener('keyboardWillShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height)
      
      // Запускаем обе анимации одновременно
      const duration = e.duration || 250
      
      // Анимация поднятия формы
      Animated.timing(translateY, {
        toValue: -e.endCoordinates.height * 0.3,
        duration,
        useNativeDriver: true,
      }).start()
      
      // Анимация затемнения браслета (всегда запускаем параллельно)
      Animated.timing(braceletOpacity, {
        toValue: 0.1,
        duration,
        useNativeDriver: true,
      }).start()
    })
    
    const keyboardWillHideListener = Keyboard.addListener('keyboardWillHide', (e) => {
      setKeyboardHeight(0)
      
      // Запускаем обе анимации одновременно
      const duration = e.duration || 250
      
      // Анимация возврата формы
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        useNativeDriver: true,
      }).start()
      
      // Анимация возврата прозрачности браслета
      Animated.timing(braceletOpacity, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }).start()
    })

    return () => {
      keyboardWillShowListener.remove()
      keyboardWillHideListener.remove()
    }
  }, [translateY, braceletOpacity])

  // Проверка надежности пароля
  const isPasswordStrong = (pwd: string) => {
    return pwd.length >= 8 &&
           /\d/.test(pwd) &&
           /[A-Z]/.test(pwd) &&
           /[a-z]/.test(pwd)
  }

  // Валидация пароля при потере фокуса
  const validatePasswordOnBlur = () => {
    if (!password) {
      setPasswordError('')
      setShowPasswordHelper(false)
      setPasswordHelperText('')
      return
    }

    if (!isPasswordStrong(password)) {
      setPasswordError('Пароль недостаточно надежный')
      setShowPasswordHelper(false)
      setPasswordHelperText('')
    } else {
      setPasswordError('')
      setShowPasswordHelper(false)
      setPasswordHelperText('')
      // Если пароль валиден, проверяем совпадение с подтверждением
      if (confirmPasswordTouched && confirmPassword) {
        validatePasswordMatch()
      }
    }
  }

  // Валидация подтверждения пароля при потере фокуса
  const validateConfirmPasswordOnBlur = () => {
    if (!confirmPassword) {
      setConfirmPasswordError('')
      return
    }

    // Проверяем совпадение только если оба поля заполнены
    if (password && confirmPassword) {
      validatePasswordMatch()
    }
  }

  // Проверка совпадения паролей
  const validatePasswordMatch = () => {
    // Проверяем только если оба поля заполнены
    if (password && confirmPassword) {
      if (password !== confirmPassword) {
        setConfirmPasswordError('Пароли не совпадают')
      } else {
        setConfirmPasswordError('')
      }
    } else {
      // Если одно из полей пустое, убираем ошибку
      setConfirmPasswordError('')
    }
  }

  // Обработчик фокуса на поле пароля
  const handlePasswordFocus = () => {
    setPasswordTouched(true)
    setIsAnyInputFocused(true)
    // Показываем подсказку если есть ошибка валидации пароля
    if (passwordError === 'Пароль недостаточно надежный') {
      setShowPasswordHelper(true)
      setPasswordHelperText('Минимум 8 символов, цифра, заглавная и строчная буквы')
      // Временно скрываем ошибку при показе подсказки
      setPasswordError('')
    }
  }

  // Обработчик фокуса на поле подтверждения пароля
  const handleConfirmPasswordFocus = () => {
    setConfirmPasswordTouched(true)
    setIsAnyInputFocused(true)
  }

  // Обработчик потери фокуса на поле подтверждения пароля
  const handleConfirmPasswordBlur = () => {
    setIsAnyInputFocused(false)
    validateConfirmPasswordOnBlur()
  }

  // Обработчик фокуса на поле email
  const handleEmailFocus = () => {
    setIsAnyInputFocused(true)
  }

  // Обработчик потери фокуса на поле email
  const handleEmailBlur = () => {
    setIsAnyInputFocused(false)
    validateEmail()
  }

  // Обработчик потери фокуса на поле пароля
  const handlePasswordBlur = () => {
    setIsAnyInputFocused(false)
    validatePasswordOnBlur()
  }

  // Валидация email
  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (email && !emailRegex.test(email)) {
      setEmailError('Введите корректный email')
    } else {
      setEmailError('')
    }
  }

  const handleSubmit = () => {
    // Перенаправляем на страницу проверки кода с email
    router.push({
      pathname: '/verification',
      params: { email }
    })
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
          <Animated.View style={[styles.braceletGroup, { opacity: braceletOpacity }]}>
            {/* Текст позади изображения */}
            <View style={styles.titleUnderlay}>
              <MaskedText
                text="регистрация"
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
                text="регистрация"
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
          </Animated.View>

          {/* Форма */}
          <Animated.View style={[styles.formContainer, { transform: [{ translateY }] }]}>
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
              onFocus={handlePasswordFocus}
              onBlur={handlePasswordBlur}
              variant="password"
              size="default"
              error={passwordError}
              helperText={passwordHelperText}
              forceHelperText={showPasswordHelper}
            />

            <Input
              label="Подтверждение пароля"
              placeholder="Подтвердите пароль"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              onFocus={handleConfirmPasswordFocus}
              onBlur={handleConfirmPasswordBlur}
              variant="password"
              size="default"
              error={password && confirmPassword ? confirmPasswordError : ''}
            />
          </Animated.View>
          </View>

          {/* Кнопки внизу экрана */}
          <View style={styles.bottomButtons}>
            {/* Кнопка регистрации */}
            <Animated.View style={[styles.submitButtonContainer, { transform: [{ translateY }] }]}>
              <Button
                variant="primary"
                size="l"
                fullWidth
                onPress={handleSubmit}
                disabled={!email || !password || !confirmPassword || !!passwordError || !!emailError || showPasswordHelper || (password && confirmPassword && !!confirmPasswordError)}
                style={styles.submitButton}
              >
                Зарегистрироваться
              </Button>
            </Animated.View>
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
  contentContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    position: 'relative',
    zIndex: 3,
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
  submitButtonContainer: {
    width: '100%',
  },
  submitButton: {
    height: 56,
  },
})
