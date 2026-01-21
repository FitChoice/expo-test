import { View } from 'react-native'
import { BackButton, BackgroundLayout, Button } from '@/shared/ui'
import React, { useMemo, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import {

	SurveyStep10,
	SurveyStep11,
	SurveyStep12,
	SurveyStep7,
	SurveyStep9,
	SurveyStepLoading,
} from '@/pages/survey/ui/components'
import type { Direction, Frequency } from '@/entities/survey'
import { router } from 'expo-router'

export const ChangeTrainingProgramScreen = () => {

	const [ currentStep, setCurrentStep ] = useState(1)


	const handleBack = () => {
		setCurrentStep(-1)
	}

	const getProgressWidth = () => {
		const progressSteps = [28, 56, 84, 112, 140, 168]
		return progressSteps[currentStep - 1] || 28
	}

	const handleNext =  () => {
		setCurrentStep(currentStep + 1)
	}

	const renderCurrentStep = () => {
		switch (currentStep) {
			case 1:
				return (
					<SurveyStep7
						selectedDays={getTrainingDaysAsStrings()}
						onDaysChange={(days) => updateTrainingDays(days)}
					/>
				)

			case 2:
				return (
					<SurveyStep9
						frequency={surveyData.train_frequency}
						onFrequencyChange={(value) => updateFrequency(+value as Frequency)}
					/>
				)

			case 3:
				return (
					<SurveyStep10
						goals={getGoalsAsStrings()}
						onGoalsChange={(value) => updateGoals(value)}
					/>
				)

			case 4:
				return (
					<SurveyStep11
						mainDirection={surveyData.main_direction}
						onMainDirectionChange={(value) => updateMainDirection(value as Direction)}
					/>
				)

			case 5:
				return (
					<SurveyStep12
						mainDirection={String(surveyData.main_direction)}
						additionalDirection={surveyData.secondary_direction}
						onAdditionalDirectionsChange={(value) =>
							updateAdditionalDirection(value as Direction)
						}
					/>
				)

			case 6:
				// Показываем экран загрузки, ошибки или финальный экран
					return <SurveyStepLoading />


			default:
				return 		<SurveyStep7
					selectedDays={getTrainingDaysAsStrings()}
					onDaysChange={(days) => updateTrainingDays(days)}
				/>
		}
	}


	// Конфигурация лэйаута для разных шагов
	const layoutConfig = useMemo(() => {
		// Шаги, использующие градиентный фон BackgroundLayout
		const isGradient = currentStep == 5
	//	const isNoPadding = currentStep === 6

		return {
			WrapperComponent: isGradient ? BackgroundLayout : View,
			wrapperProps: isGradient
				? { styles: { flex: 1 } }
				: { className: 'flex-1 bg-[#151515] px-4' },
			// Внутренний отступ для контента при использовании BackgroundLayout
			contentPadding: 'px-4',
		}
	}, [currentStep])

	const { WrapperComponent, wrapperProps, contentPadding } = layoutConfig

	return 	<WrapperComponent {...(wrapperProps as any)}>
		<View className={`flex-1 justify-between bg-transparent ${contentPadding}`}>
			{/* Верхний контент */}
			<View className={ 'flex-1' }>
				{/* Header section with back button */}

					<View className="mb-2">
						<BackButton
							onPress={handleBack}
							color="#989898"
							variant="transparent"
							position="relative"
							style={{
								right: '45%'
							}}
						/>
					</View>


				{/* Content section with progress bar and main content */}
				<View className="mb-6 bg-transparent">
					{/* Индикатор прогресса */}

						<View className="mb-6 h-2 w-full rounded-lg bg-fill-800">
							<View
								className="h-2 rounded-lg bg-[#A172FF]"
								style={{ width: getProgressWidth() }}
							/>
						</View>

				</View>

				{/* Основной контент */}
				<View
					className='w-full flex-1 bg-transparent'
				>
					{renderCurrentStep()}
				</View>
			</View>

				<View className="flex-row" >

					<Button
						variant="tertiary"
						fullWidth
						onPress={ () => {
							router.push('/profile')
						}}
						className="h-[56px]"
					>
				Отменить
					</Button>


					<Button
						variant="primary"
						disabled={!canProceed()}
						//fullWidth
						onPress={ handleNext }
						className="h-[56px]"
					>
						Далее
					</Button>

				</View>
		</View>
	</WrapperComponent>
}