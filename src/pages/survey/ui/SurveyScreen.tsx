import React, { useEffect, useMemo, useState } from 'react'
import { View, Animated } from 'react-native'
import * as ScreenOrientation from 'expo-screen-orientation'
import * as Notifications from 'expo-notifications'
import { Button, BackButton, BackgroundLayout, BackgroundLayoutNoSidePadding, Icon } from '@/shared/ui'
import { useOrientation, useKeyboardAnimation, getUserId } from '@/shared/lib'
import { useRouter } from 'expo-router'
import { useSurveyFlow } from '@/features/survey-flow'
import {
	SurveyStep1,
	SurveyStep2,
	SurveyStep3,
	SurveyStep4,
	SurveyStep5,
	SurveyStep6,
	SurveyStep7,
	SurveyStep8,
	SurveyStep9,
	SurveyStep10,
	SurveyStep11,
	SurveyStep12,
	SurveyStep13,
	SurveyStep14,
	SurveyStepLoading,
	SurveyStepError,
} from './components'
import type {
	Gender,
	Frequency,
	Goal,
	Direction,
	DayOfWeek,
	AgeGroup,
} from '@/entities/survey'

/**
 * Страница опроса - рефакторированная версия с компонентами-шагами
 */
export const SurveyScreen = () => {
	const router = useRouter()
	const {
		surveyData,
		currentStep,
		isSubmitting,
		submitError,
		updateName,
		updateGender,
		updateAgeGroup,
		updateHeight,
		updateWeight,
		updateTrainingDays,
		updateFrequency,
		updateGoals,
		updateMainDirection,
		updateAdditionalDirection,
		updateNotificationsEnabled,
		calculateBMI,
		getBMICategory,
		getTrainingDaysAsStrings,
		getGoalsAsStrings,
		getAgeGroupAsString,
		nextStep,
		prevStep,
		submitSurvey,
		setIsSubmitting,
		setSubmitError,
	} = useSurveyFlow()




	const [hasRequested, setHasRequested] = useState(false)
	
	// Используем хук для анимации клавиатуры
	const { translateY } = useKeyboardAnimation({
		offsetMultiplier: 0.92, // Кнопка поднимается на полную высоту клавиатуры
	})

	// Блокируем поворот экрана в портретную ориентацию
	useOrientation(ScreenOrientation.OrientationLock.PORTRAIT_UP)

	// Автоматический расчет ИМТ при переходе на экран загрузки
	useEffect(() => {
		if (currentStep === 5) {
			calculateBMI()

			// Имитация загрузки 2 секунды
			const timer = setTimeout(() => {
				nextStep()
			}, 2000)

			return () => clearTimeout(timer)
		}
		return undefined
	}, [currentStep, calculateBMI, nextStep])

	// Отправка данных опроса при переходе на шаг 14
	// useEffect(() => {
	// 	if (currentStep === 14 && !isSubmitting && !submitError) {
	// 		const submitData = async () => {
	// 			setIsSubmitting(true)
	// 			setSubmitError(null)
	//
	// 			try {
	// 				let userId = await getUserId()
	//
	// 				console.log('User ID:', userId)
	//
	// 				// Fallback для режима разработки/тестирования
	// 				if (!userId && __DEV__) {
	// 					console.warn('Using mock user_id for development')
	// 					userId = 1 // Mock user ID для тестирования
	// 				}
	//
	// 				if (!userId) {
	// 					setSubmitError('Не удалось получить идентификатор пользователя')
	// 					setIsSubmitting(false)
	// 					return
	// 				}
	//
	// 				const result = await submitSurvey(userId)
	//
	// 				if (!result.success) {
	// 					setSubmitError(result.error || 'Ошибка отправки данных')
	// 				}
	// 			} catch (error) {
	// 				setSubmitError('Произошла непредвиденная ошибка')
	// 			} finally {
	// 				setIsSubmitting(false)
	// 			}
	// 		}
	//
	// 		submitData()
	// 	}
	// }, [currentStep, isSubmitting, submitError, submitSurvey, setIsSubmitting, setSubmitError])

	const handleBack = () => {
		if (currentStep === 1) {
			router.back()
		} else {
			prevStep()
		}
	}

	const handleNext = async () => {
		if (currentStep === 13) {
			if (!hasRequested) {
				try {
					const { status: existingStatus } = await Notifications.getPermissionsAsync()
					let finalStatus = existingStatus

					if (existingStatus !== 'granted') {
						const { status } = await Notifications.requestPermissionsAsync()
						finalStatus = status
					}

					if (finalStatus === 'granted') {
						const token = await Notifications.getExpoPushTokenAsync()
						console.log('Push token:', token.data)
					}

					setHasRequested(true)
					updateNotificationsEnabled(true)
				} catch (error) {
					// Игнорируем ошибку в Expo Go
					console.log('Notifications unavailable:', error)
				}
			}
			
			nextStep()
		} else if (currentStep === 14) {
			// Финальный экран - переход на home
			router.push('/home')
		} else {
			nextStep()
		}
	}

	const handleRetry = () => {
		setSubmitError(null)
		setIsSubmitting(false)
	}

	const getProgressWidth = () => {
		const progressSteps = [28, 56, 84, 112, 140, 168, 196, 224, 252, 280, 308, 336, 364]
		return progressSteps[currentStep - 1] || 28
	}

	const renderCurrentStep = () => {
		switch (currentStep) {
			case 1:
				return <SurveyStep1 name={surveyData.name} onNameChange={updateName} />

			case 2:
				return (
					<SurveyStep2
						gender={surveyData.gender}
						onGenderChange={(value) => updateGender(value as Gender)}
					/>
				)

			case 3:
				return (
					<SurveyStep3
						ageGroup={getAgeGroupAsString()}
						onAgeGroupChange={(value) => updateAgeGroup(value)}
					/>
				)

			case 4:
				return (
					<SurveyStep4
						height={surveyData.height}
						weight={surveyData.weight}
						onHeightChange={updateHeight}
						onWeightChange={updateWeight}
					/>
				)

			case 5:
				return <SurveyStep5 />

			case 6:
				return <SurveyStep6 bmiCategory={getBMICategory()} />

			case 7:
				return (
					<SurveyStep7
						selectedDays={getTrainingDaysAsStrings()}
						onDaysChange={(days) => updateTrainingDays(days)}
					/>
				)

			case 8:
				return <SurveyStep8 />

			case 9:
				return (
					<SurveyStep9
						frequency={surveyData.train_frequency}
						onFrequencyChange={(value) => updateFrequency(+value as Frequency)}
					/>
				)

			case 10:
				return (
					<SurveyStep10
						goals={getGoalsAsStrings()}
						onGoalsChange={(value) => updateGoals(value)}
					/>
				)

			case 11:
				return (
					<SurveyStep11
						mainDirection={surveyData.main_direction}
						onMainDirectionChange={(value) => updateMainDirection(value as Direction)}
					/>
				)

			case 12:
				return (
					<SurveyStep12
						mainDirection={String(surveyData.main_direction)}
						additionalDirection={surveyData.secondary_direction}
						onAdditionalDirectionsChange={(value) =>
							updateAdditionalDirection(value as Direction)
						}
					/>
				)

			case 13:
				return <SurveyStep13 />

			case 14:
				// Показываем экран загрузки, ошибки или финальный экран
				if (isSubmitting) {
					return <SurveyStepLoading />
				}
				
			if (submitError) {
				return <SurveyStepError error={submitError} onRetry={handleRetry} onBack={prevStep} />
			}
			
			return <SurveyStep14 userName={surveyData.name} gender={surveyData.gender} />

			default:
				return <SurveyStep1 name={surveyData.name} onNameChange={updateName} />
		}
	}

	const canProceed = () => {
		switch (currentStep) {
			case 1:
				return surveyData.name.trim().length >= 2
			case 2:
				return surveyData.gender !== null
			case 3:
				return getAgeGroupAsString() !== null
			case 4:
				return surveyData.height !== null && surveyData.weight !== null
			case 5:
				return false // На экране загрузки кнопка не показывается
			case 6:
				return true // На экране результата ИМТ всегда показываем кнопку
			case 7:
				return getTrainingDaysAsStrings().length >= 3 // Минимум 3 дня
			case 8:
				return true // Информационный экран
			case 9:
				return surveyData.train_frequency !== null
			case 10:
				return getGoalsAsStrings().length > 0 && getGoalsAsStrings().length <= 3
			case 11:
				return surveyData.main_direction !== null
			case 12:
				return true // Опциональный вопрос
			case 13:
				return true // Уведомления - свои кнопки внутри компонента
			case 14:
				return false // На финальном экране кнопка отдельная
			default:
				return false
		}
	}


	const notShowProgress = useMemo(() => currentStep == 13 || currentStep == 14, [currentStep])
	
	// Выбираем компонент Layout в зависимости от шага
	const isNoPaddingLayout = currentStep === 6
	const LayoutComponent = isNoPaddingLayout ? BackgroundLayoutNoSidePadding : BackgroundLayout
	const sectionPadding = isNoPaddingLayout ? { paddingHorizontal: '4%' as const } : {}
	
	// Для экрана загрузки и ошибки используем flex-1 для центрирования
	const isFullHeightContent = currentStep === 14 && (isSubmitting || submitError)
	
	return (
		<View className="flex-1 bg-[#151515] ">
			<LayoutComponent>
				<View className={'flex-1 bg-transparent pt-[14px]'} style={{ justifyContent: 'space-between' }}>
					{/* Верхний контент */}
					<View className={isFullHeightContent ? "flex-1" : "flex-shrink"}>
						{/* Header section with back button */}
						{
							!notShowProgress &&
							<View className="mb-2" style={sectionPadding}>
							<BackButton
								onPress={handleBack}
								color="#989898"
								variant="transparent"
								position="relative"
							/>
							</View>
						}

						{/* Content section with progress bar and main content */}
						<View className="mb-6 bg-transparent" style={sectionPadding} >
							{/* Индикатор прогресса */}
						{
							!notShowProgress && <View className="mb-6 h-2 w-full rounded-lg bg-fill-800">
								<View
								
									className="h-2 rounded-lg bg-[#A172FF]"
									style={{ width: getProgressWidth() }}
								
								/>
							</View>
						}

					
						</View>

							{/* Основной контент */}
							<View className={isFullHeightContent ? "w-full flex-1 bg-transparent" : "w-full gap-6 bg-transparent"}>{renderCurrentStep()}</View>
					</View>

					{/* Кнопки внизу экрана с анимацией */}
					<Animated.View
						className="gap-2 pb-[50px] pt-8"
						style={[{ transform: [{ translateY }] }, sectionPadding]}
					>
						{canProceed() && (
							<Button
								variant="primary"
								size="l"
								fullWidth
								onPress={handleNext}
								className="h-[56px]"
							>
								{currentStep == 13 ? 'Включить' : 'Далее'}
							</Button>
						)}

						{currentStep == 13 || currentStep == 12 ? (
							<Button
								variant="tertiary"
								size="l"
								fullWidth
								onPress={nextStep}
								className="h-[56px]"
							>
							Не сейчас
							</Button>
						): null}

					{
						currentStep == 14 && !isSubmitting && !submitError && (
							<Button
								iconLeft={<Icon name="dumbbell" />}
								variant={'secondary'}
								onPress={() => router.push('/(training)')}
							>
								Перейти к тренировкам
							</Button>
						)
					}
					</Animated.View>
				</View>
			</LayoutComponent>
		</View>
	)
}
