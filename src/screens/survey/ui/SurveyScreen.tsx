import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Keyboard, TouchableWithoutFeedback } from 'react-native'
import * as ScreenOrientation from 'expo-screen-orientation'
import { Button, Icon, BackgroundLayout } from '@/shared/ui'
import { Input } from '@/shared/ui/Input/Input'
import { useOrientation } from '@/shared/lib'
import { useRouter } from 'expo-router'

/**
 * Страница опроса
 */
export const SurveyScreen = () => {
  const router = useRouter()
  const [name, setName] = useState('')

  // Блокируем поворот экрана в портретную ориентацию
  useOrientation(ScreenOrientation.OrientationLock.PORTRAIT_UP)

  const handleSubmit = () => {
    // Здесь будет логика сохранения имени и перехода дальше
    if (name.trim()) {
      router.push('/home')
    }
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.pageContainer}>
        <BackgroundLayout>
          <View style={styles.mainContainer}>
            {/* Кнопка назад */}
            <TouchableOpacity 
              style={styles.backButton}
              onPress={handleBack}
              activeOpacity={0.8}
            >
              <Icon name="chevron-left" size={24} color="#989898" />
            </TouchableOpacity>

            {/* Индикатор прогресса */}
            <View style={styles.progressBar}>
              <View style={styles.progressFill} />
            </View>

            {/* Основной контент */}
            <View style={styles.contentContainer}>
              {/* Заголовок */}
              <Text style={styles.title}>Как к вам обращаться?</Text>

              {/* Поле ввода имени */}
              <View style={styles.inputSection}>
                <Input
                  label=""
                  placeholder="Ваше имя"
                  value={name}
                  onChangeText={setName}
                  variant="text"
                  size="default"
                />
              </View>
            </View>

            {/* Кнопки внизу экрана */}
            <View style={styles.bottomButtons}>
              {/* Кнопка отправки */}
              <Button
                variant="primary"
                size="l"
                fullWidth
                onPress={handleSubmit}
                disabled={!name.trim()}
                style={styles.submitButton}
              >
                Далее
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
    paddingTop: 14,
    justifyContent: 'space-between',
  },
  backButton: {
    position: 'absolute',
    top: 14,
    left: 14,
    width: 48,
    height: 48,
    backgroundColor: 'transparent',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  progressBar: {
    width: 362,
    height: 8,
    backgroundColor: '#2B2B2B',
    borderRadius: 8,
    marginTop: 56,
    marginBottom: 24,
    alignSelf: 'center',
  },
  progressFill: {
    width: 28,
    height: 8,
    backgroundColor: '#A172FF',
    borderRadius: 8,
  },
  contentContainer: {
    backgroundColor: 'transparent',
    gap: 24,
  },
  title: {
    fontFamily: 'Rimma_sans',
    fontWeight: '700',
    fontSize: 24,
    lineHeight: 31.2,
    color: '#FFFFFF',
    textAlign: 'left',
  },
  inputSection: {
    backgroundColor: 'transparent',
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