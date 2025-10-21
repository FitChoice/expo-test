import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Keyboard, TouchableWithoutFeedback } from 'react-native'
import * as ScreenOrientation from 'expo-screen-orientation'
import { Button, Icon, BackgroundLayout } from '@/shared/ui'
import { Input } from '@/shared/ui/Input/Input'
import { useOrientation } from '@/shared/lib'
import { useRouter, useLocalSearchParams } from 'expo-router'

/**
 * Страница проверки кода подтверждения
 */
export const VerificationScreen = () => {
  const router = useRouter()
  const { email } = useLocalSearchParams<{ email: string }>()
  const [code, setCode] = useState('')
  const [timer, setTimer] = useState(59) // Таймер для повторной отправки
  const [isTimerActive, setIsTimerActive] = useState(true) // Активен ли таймер

  // Блокируем поворот экрана в портретную ориентацию
  useOrientation(ScreenOrientation.OrientationLock.PORTRAIT_UP)

  // Автоматически скрываем клавиатуру при вводе 6 символов
  useEffect(() => {
    if (code.length === 6) {
      Keyboard.dismiss()
    }
  }, [code])

  // Таймер обратного отсчета
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (isTimerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 1) {
            setIsTimerActive(false)
            return 0
          }
          return prevTimer - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isTimerActive, timer])

  const handleSubmit = () => {
    // Здесь будет логика проверки кода
    if (code.length === 6) {
      router.push('/survey')
    }
  }

  const handleBack = () => {
    router.back()
  }

  const handleResend = () => {
    if (!isTimerActive) {
      // Здесь будет логика повторной отправки кода
      console.log('Resend code')
      // Перезапускаем таймер
      setTimer(59)
      setIsTimerActive(true)
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.pageContainer}>
        <BackgroundLayout>
          <View style={styles.mainContainer}>
            {/* Основной контент */}
            <View style={styles.contentContainer}>
              {/* Заголовок и описание */}
              <View style={styles.headerSection}>
                <Text style={styles.title}>введите код{'\n'}подтверждения</Text>
                <Text style={styles.description}>
                  На вашу почту {email || 'example@gmail.com'}{'\n'}отправлен код подтверждения
                </Text>
              </View>

              {/* Поле ввода кода */}
              <View style={styles.inputSection}>
                <Input
                  label="Код"
                  placeholder="123456"
                  value={code}
                  onChangeText={setCode}
                  keyboardType="numeric"
                  variant="text"
                  size="default"
                  maxLength={6}
                />
              </View>

            </View>

            {/* Кнопки и повторная отправка внизу экрана */}
            <View style={styles.bottomButtons}>
              {/* Вопрос о письме (только когда таймер неактивен) */}
              {!isTimerActive && (
                <Text style={styles.questionText}>
                  Не получили письмо?
                </Text>
              )}

              {/* Кнопка повторной отправки */}
              <TouchableOpacity 
                style={[
                  styles.resendButton,
                  isTimerActive && styles.resendButtonDisabled
                ]}
                onPress={handleResend}
                activeOpacity={isTimerActive ? 1 : 0.8}
                disabled={isTimerActive}
              >
                <Text style={[
                  styles.resendText,
                  isTimerActive && styles.resendTextDisabled
                ]}>
                  {isTimerActive 
                    ? `Прислать повторно через 00:${timer.toString().padStart(2, '0')}`
                    : 'Прислать код повторно'
                  }
                </Text>
              </TouchableOpacity>

              {/* Кнопка отправки */}
              <Button
                variant="primary"
                size="l"
                fullWidth
                onPress={handleSubmit}
                disabled={code.length !== 6}
                style={styles.submitButton}
              >
                Отправить
              </Button>

              {/* Кнопка возврата */}
              <Button
                variant="tertiary"
                size="s"
                fullWidth
                onPress={handleBack}
                style={styles.backButton}
              >
                Назад
              </Button>
            </View>
          </View>
        </BackgroundLayout>
      </View>
    </TouchableWithoutFeedback>
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
    paddingTop: 62,
    justifyContent: 'space-between',
  },
  contentContainer: {
    backgroundColor: 'transparent',
  },
  headerSection: {
    alignItems: 'center',
    gap: 24,
    marginBottom: 40,
  },
  title: {
    fontFamily: 'Rimma_sans',
    fontWeight: '700',
    fontSize: 24,
    lineHeight: 31.2,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  description: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 19.2,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  inputSection: {
    marginBottom: 40,
  },
  bottomButtons: {
    paddingTop: 32,
    paddingBottom: 50,
    gap: 8,
  },
  questionText: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 19.2,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  resendButton: {
    alignSelf: 'center',
    paddingVertical: 9,
    paddingHorizontal: 24,
  },
  resendButtonDisabled: {
    opacity: 0.75,
  },
  resendText: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 19.2,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  resendTextDisabled: {
    opacity: 0.75,
  },
  submitButton: {
    height: 56,
  },
  backButton: {
    height: 56,
  },
})
