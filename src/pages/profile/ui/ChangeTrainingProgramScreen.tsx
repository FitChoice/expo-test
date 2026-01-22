import { View, type DimensionValue } from 'react-native'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { router } from 'expo-router'
import { BackButton, BackgroundLayout, Button } from '@/shared/ui'
import {
	SurveyStep10,
	SurveyStep11,
	SurveyStep12,
	SurveyStep7,
	SurveyStep9,
	SurveyStepLoading,
} from '@/pages/survey/ui/components'
import type { DayOfWeek, Direction, Frequency, Goal, SurveyData } from '@/entities/survey'
import {
	daysToMasks,
	dayBitmaskToMasks,
	goalsToMasks,
	goalBitmaskToMasks,
	masksToDays,
	masksToGoals,
	masksToNumber,
} from '@/entities/survey'
import { useUpdateTrainingProgramMutation, surveyApi } from '@/features/survey-flow'
import { getUserId, showToast } from '@/shared/lib'

const initialFormData: SurveyData = {
	name: '',
	gender: null,
	train_days: [],
	train_frequency: null,
	train_goals: [],
	main_direction: null,
	secondary_direction: null,
	age: null,
	height: null,
	weight: null,
	bmi: null,
	notif_main: false,
}

export const ChangeTrainingProgramScreen = () => {
	const [currentStep, setCurrentStep] = useState(1)
	const [formData, setFormData] = useState<SurveyData>(initialFormData)

	const { mutate : updateTrainingProgramMutation, isPending, isSuccess, isError } = useUpdateTrainingProgramMutation()


	useEffect(() => {
		if (isSuccess || isError) {
			router.replace('/profile')
		}
	}, [isSuccess, isError])

	const updateTrainingDays = useCallback((days: DayOfWeek[]) => {
		setFormData((prev) => ({ ...prev, train_days: daysToMasks(days) }))
	}, [])

	const updateFrequency = useCallback((frequency: Frequency) => {
		setFormData((prev) => ({ ...prev, train_frequency: frequency }))
	}, [])

	const updateGoals = useCallback((goals: Goal[]) => {
		setFormData((prev) => ({ ...prev, train_goals: goalsToMasks(goals) }))
	}, [])

	const updateMainDirection = useCallback((direction: Direction) => {
		setFormData((prev) => ({ ...prev, main_direction: direction }))
	}, [])

	const updateAdditionalDirection = useCallback((direction: Direction) => {
		setFormData((prev) => ({ ...prev, secondary_direction: direction }))
	}, [])

	const getTrainingDaysAsStrings = useCallback((): DayOfWeek[] => {
		const masks = (formData.train_days as number[]) || []
		return masksToDays(masks)
	}, [formData.train_days])

	const getGoalsAsStrings = useCallback((): Goal[] => {
		const masks = (formData.train_goals as number[]) || []
		return masksToGoals(masks)
	}, [formData.train_goals])

	const canProceed = useCallback(() => {
		switch (currentStep) {
			case 1:
				return getTrainingDaysAsStrings().length >= 3
			case 2:
				return formData.train_frequency !== null
			case 3:
				return getGoalsAsStrings().length === 3
			case 4:
				return formData.main_direction !== null
			case 5:
				return true
			default:
				return false
		}
	}, [currentStep, formData, getTrainingDaysAsStrings, getGoalsAsStrings])

	const handleBack = () => {

		if (currentStep === 1) {
			router.back()
			return
		}
		setCurrentStep((prev) => Math.max(prev - 1, 1))
	}

	const handleNext = () => {
		if (currentStep === 5) {
			updateTrainingProgramMutation(
				{
					...formData,
					train_days: masksToNumber((formData.train_days as number[]) || []),
					train_goals: masksToNumber((formData.train_goals as number[]) || []),
				}
			)
			return
		} else {
			setCurrentStep((prev) => prev + 1)
		}

	}

	const getProgressWidth = (): DimensionValue => {
		const totalSteps = 5
		const progress = (currentStep / totalSteps) * 100
		return `${Math.min(progress, 100)}%` as DimensionValue
	}

	const renderCurrentStep = () => {
		// if (isSubmitting || isInitializing) {
		// 	return <SurveyStepLoading />
		// }

		switch (currentStep) {
			case 1:
				return (
					<SurveyStep7
						selectedDays={getTrainingDaysAsStrings()}
						onDaysChange={updateTrainingDays}
					/>
				)
			case 2:
				return (
					<SurveyStep9
						frequency={formData.train_frequency}
						onFrequencyChange={updateFrequency}
					/>
				)
			case 3:
				return (
					<SurveyStep10 goals={getGoalsAsStrings()} onGoalsChange={updateGoals} />
				)
			case 4:
				return (
					<SurveyStep11
						mainDirection={formData.main_direction}
						onMainDirectionChange={updateMainDirection}
					/>
				)
			case 5:
				return (
					<SurveyStep12
						mainDirection={String(formData.main_direction)}
						additionalDirection={formData.secondary_direction}
						onAdditionalDirectionsChange={updateAdditionalDirection}
					/>
				)
			default:
				return null
		}
	}

	const layoutConfig = useMemo(() => {
		const isGradient = currentStep === 5 || isPending
		return {
			WrapperComponent: isGradient ? BackgroundLayout : View,
			wrapperProps: isGradient
				? { styles: { flex: 1 } }
				: { className: 'flex-1 bg-[#151515] px-4' },
			contentPadding: isGradient ? 'px-4' : '',
		}
	}, [currentStep, isPending])

	const { WrapperComponent, wrapperProps, contentPadding } = layoutConfig
	const showButtons = !isPending

	return (
		<WrapperComponent {...(wrapperProps as any)}>
			<View className={`flex-1 justify-between bg-transparent ${contentPadding}`}>
				<View className="flex-1">
					{showButtons && (
						<View className="mb-2">
							<BackButton
								onPress={handleBack}
								color="#989898"
								variant="transparent"
								position="relative"
								style={{ right: '45%' }}
							/>
						</View>
					)}

					{showButtons && (
						<View className="mb-6 bg-transparent">
							<View className="mb-6 h-2 w-full rounded-lg bg-fill-800">
								<View
									className="h-2 rounded-lg bg-[#A172FF]"
									style={{ width: getProgressWidth() }}
								/>
							</View>
						</View>
					)}

					<View className="w-full flex-1 bg-transparent">{renderCurrentStep()}</View>
				</View>

				{showButtons && (
					<View className="flex-row gap-2 pb-8">
						<Button
							variant="tertiary"
							onPress={() => router.push('/profile')}
							className="h-[56px] flex-1"
						>
							Отменить
						</Button>
						<Button
							variant="primary"
							disabled={!canProceed()}
							onPress={handleNext}
							className="h-[56px] flex-1"
						>
							{currentStep === 5 ? 'Сохранить' : 'Далее'}
						</Button>
					</View>
				)}
			</View>
		</WrapperComponent>
	)
}