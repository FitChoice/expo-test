import React, { useState } from 'react'
import { View, Text, ScrollView } from 'react-native'
import * as ScreenOrientation from 'expo-screen-orientation'
import { Button, Icon } from '@/shared/ui'
import { useOrientation } from '@/shared/lib'
import { useRouter } from 'expo-router'

/**
 * Страница опроса
 */
export const SurveyScreen = () => {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [answers, setAnswers] = useState<Record<string, any>>({})

  const totalSteps = 3

  // Блокируем поворот экрана в портретную ориентацию
  useOrientation(ScreenOrientation.OrientationLock.PORTRAIT_UP)

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      // Завершение опроса
      console.log('Survey completed:', answers)
      router.replace('/')
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    router.replace('/')
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View className="space-y-6">
            <View className="items-center">
              <Icon name="user-circle" size={64} color="#10B981" />
            </View>
            <Text className="text-white text-xl font-semibold text-center mb-4">
              Расскажите о себе
            </Text>
            <Text className="text-gray-400 text-center leading-6">
              Чтобы подобрать персональную программу тренировок, нам нужно узнать немного о ваших целях и предпочтениях.
            </Text>
          </View>
        )
      
      case 2:
        return (
          <View className="space-y-6">
            <View className="items-center">
              <Icon name="goal-strengthen" size={64} color="#10B981" />
            </View>
            <Text className="text-white text-xl font-semibold text-center mb-4">
              Ваши цели
            </Text>
            <Text className="text-gray-400 text-center leading-6">
              Какую цель вы хотите достичь с помощью тренировок?
            </Text>
            <View className="space-y-3">
              {[
                { id: 'strength', label: 'Укрепить мышцы', icon: 'goal-strengthen' },
                { id: 'flexibility', label: 'Улучшить гибкость', icon: 'goal-flexibility' },
                { id: 'weight', label: 'Сбросить вес', icon: 'goal-lose-weight' },
                { id: 'posture', label: 'Исправить осанку', icon: 'goal-posture' },
              ].map((goal) => (
                <Button
                  key={goal.id}
                  variant={answers.goal === goal.id ? 'primary' : 'tertiary'}
                  size="l"
                  fullWidth
                  iconLeft={<Icon name={goal.icon as any} size={20} />}
                  onPress={() => setAnswers({ ...answers, goal: goal.id })}
                >
                  {goal.label}
                </Button>
              ))}
            </View>
          </View>
        )
      
      case 3:
        return (
          <View className="space-y-6">
            <View className="items-center">
              <Icon name="check-circle" size={64} color="#10B981" />
            </View>
            <Text className="text-white text-xl font-semibold text-center mb-4">
              Готово!
            </Text>
            <Text className="text-gray-400 text-center leading-6">
              Спасибо за ответы! Теперь мы можем подобрать для вас персональную программу тренировок.
            </Text>
          </View>
        )
      
      default:
        return null
    }
  }

  return (
    <View className="flex-1 bg-gray-900">
      {/* Прогресс бар */}
      <View className="px-6 pt-12 pb-4">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-gray-400 text-sm">
            Шаг {currentStep} из {totalSteps}
          </Text>
          <Button variant="ghost" onPress={handleSkip}>
            Пропустить
          </Button>
        </View>
        <View className="bg-gray-700 h-2 rounded-full">
          <View 
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </View>
      </View>

      {/* Контент */}
      <ScrollView className="flex-1 px-6">
        <View className="py-8">
          {renderStepContent()}
        </View>
      </ScrollView>

      {/* Навигация */}
      <View className="px-6 pb-8 pt-4">
        <View className="flex-row space-x-3">
          {currentStep > 1 && (
            <Button
              variant="secondary"
              size="l"
              iconLeft={<Icon name="arrow-back" size={20} />}
              onPress={handlePrevious}
              className="flex-1"
            >
              Назад
            </Button>
          )}
          
          <Button
            variant="primary"
            size="l"
            iconRight={<Icon name="arrow-forward" size={20} />}
            onPress={handleNext}
            className={currentStep > 1 ? "flex-1" : "w-full"}
          >
            {currentStep === totalSteps ? 'Завершить' : 'Далее'}
          </Button>
        </View>
      </View>
    </View>
  )
}
