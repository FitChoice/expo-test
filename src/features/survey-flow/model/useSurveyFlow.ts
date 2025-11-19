/**
 * Survey flow state management
 * Manages UI state and form mutations for the survey flow
 */

import { create } from 'zustand'
import {
    type SurveyData,
    calculateBMI,
    getBMICategory,
    type BMICategory,
    type DayOfWeek,
    type Goal,
    type AgeGroup,
} from '@/entities/survey'
import { surveyApi } from '../api'

// Битовая маска дней недели: 1=Пн, 2=Вт, 4=Ср, 8=Чт, 16=Пт, 32=Сб, 64=Вс
const DAY_MASKS: Record<DayOfWeek, number> = {
    monday: 1,
    tuesday: 2,
    wednesday: 4,
    thursday: 8,
    friday: 16,
    saturday: 32,
    sunday: 64,
}

// Конвертация DayOfWeek[] в массив битовых масок
function daysToMasks(days: DayOfWeek[]): number[] {
    return days.map((day) => DAY_MASKS[day])
}

// Конвертация массива битовых масок обратно в DayOfWeek[]
function masksToDays(masks: number[]): DayOfWeek[] {
    const maskToDay: Record<number, DayOfWeek> = {
        1: 'monday',
        2: 'tuesday',
        4: 'wednesday',
        8: 'thursday',
        16: 'friday',
        32: 'saturday',
        64: 'sunday',
    }
    return masks.map((mask) => maskToDay[mask]).filter(Boolean) as DayOfWeek[]
}

// Конвертация массива битовых масок дней в одно число (битовую маску)
function masksToDaysNumber(masks: number[]): number {
    return masks.reduce((mask, dayMask) => mask | dayMask, 0)
}

// Битовая маска целей: 1=Осанка, 2=Боль, 4=Гибкость, 8=Укрепление, 16=Сброс веса, 32=Стресс, 64=Энергия, 128=Самочувствие
const GOAL_MASKS: Record<Goal, number> = {
    posture: 1,
    pain_relief: 2,
    flexibility: 4,
    strength: 8,
    weight_loss: 16,
    stress_relief: 32,
    energy: 64,
    wellness: 128,
}

// Конвертация Goal[] в массив битовых масок
function goalsToMasks(goals: Goal[]): number[] {
    return goals.map((goal) => GOAL_MASKS[goal])
}

// Конвертация массива битовых масок обратно в Goal[]
function masksToGoals(masks: number[]): Goal[] {
    const maskToGoal: Record<number, Goal> = {
        1: 'posture',
        2: 'pain_relief',
        4: 'flexibility',
        8: 'strength',
        16: 'weight_loss',
        32: 'stress_relief',
        64: 'energy',
        128: 'wellness',
    }
    return masks.map((mask) => maskToGoal[mask]).filter(Boolean) as Goal[]
}

// Конвертация массива битовых масок целей в одно число (битовую маску)
function masksToGoalsNumber(masks: number[]): number {
    return masks.reduce((mask, goalMask) => mask | goalMask, 0)
}

// Конвертация AgeGroup строки в число (среднее арифметическое)
function ageGroupToNumber(ageGroup: AgeGroup): number {
    if (ageGroup === 'under_18') {
        return 17 // Среднее для < 18
    }
    if (ageGroup === '65_plus') {
        return 70 // Среднее для ≥ 65
    }
    // Извлекаем два числа из строки типа '18_24'
    const parts = ageGroup.split('_').map(Number)
    const min = parts[0]
    const max = parts[1]
    if (min === undefined || max === undefined) {
        throw new Error(`Invalid ageGroup format: ${ageGroup}`)
    }
    return Math.round((min + max) / 2)
}

// Конвертация числа обратно в AgeGroup строку
function numberToAgeGroup(age: number): AgeGroup | null {
    if (age < 18) return 'under_18'
    if (age >= 18 && age <= 24) return '18_24'
    if (age >= 25 && age <= 34) return '25_34'
    if (age >= 35 && age <= 44) return '35_44'
    if (age >= 45 && age <= 54) return '45_54'
    if (age >= 55 && age <= 64) return '55_64'
    if (age >= 65) return '65_plus'
    return null
}

interface SurveyFlowStore {
	// UI state
	currentStep: number
	totalSteps: number

	// Data
	surveyData: SurveyData

	// Submit state
	isSubmitting: boolean
	submitError: string | null

	// Методы обновления данных
	updateName: (name: string) => void
	updateGender: (gender: SurveyData['gender']) => void
	updateTrainingDays: (days: DayOfWeek[]) => void
	updateFrequency: (frequency: SurveyData['train_frequency']) => void
	updateGoals: (goals: Goal[]) => void
	updateMainDirection: (direction: SurveyData['main_direction']) => void
	updateAdditionalDirection: (direction: SurveyData['secondary_direction']) => void
	updateAgeGroup: (ageGroup: AgeGroup) => void
	setAgeGroupFromNumber: (age: number) => void
	updateHeight: (height: number | null) => void
	updateWeight: (weight: number | null) => void
	updateBMI: (bmi: number | null) => void
	updateNotificationsEnabled: (enabled: boolean) => void

	// Submit methods
	setIsSubmitting: (isSubmitting: boolean) => void
	setSubmitError: (error: string | null) => void

	// BMI methods (using business logic from entities)
	calculateBMI: () => void
	getBMICategory: () => BMICategory | null

	// Helper methods
	getTrainingDaysAsStrings: () => DayOfWeek[]
	getGoalsAsStrings: () => Goal[]
	getAgeGroupAsString: () => AgeGroup | null

	// Navigation methods
	nextStep: () => void
	prevStep: () => void
	goToStep: (step: number) => void

	// Reset method
	resetSurvey: () => void

	// Submit survey
	submitSurvey: (userId: number) => Promise<{ success: boolean; error?: string }>
}

const initialSurveyData: SurveyData = {
    name: '',
    gender: null,
    train_days: [], // Будет храниться как number[] (битовые маски)
    train_frequency: null,
    train_goals: [], // Будет храниться как number[] (битовые маски)
    main_direction: null,
    secondary_direction: null,
    age: null,
    height: null,
    weight: null,
    bmi: null,
    notif_main: false,
}

export const useSurveyFlow = create<SurveyFlowStore>((set, get) => ({
    surveyData: initialSurveyData,
    currentStep: 1,
    totalSteps: 14,
    isSubmitting: false,
    submitError: null,

    // Методы обновления данных
    updateName: (name) =>
        set((state) => ({
            surveyData: { ...state.surveyData, name },
        })),

    updateGender: (gender) =>
        set((state) => ({
            surveyData: { ...state.surveyData, gender },
        })),

    updateTrainingDays: (days) =>
        set((state) => ({
            surveyData: {
                ...state.surveyData,
                train_days: daysToMasks(days) as any, // Конвертируем в массив чисел
            },
        })),

    updateFrequency: (frequency) =>
        set((state) => ({
            surveyData: { ...state.surveyData, train_frequency: frequency },
        })),

    updateGoals: (goals) =>
        set((state) => ({
            surveyData: {
                ...state.surveyData,
                train_goals: goalsToMasks(goals) as any, // Конвертируем в массив чисел
            },
        })),

    updateMainDirection: (mainDirection) =>
        set((state) => ({
            surveyData: { ...state.surveyData, main_direction: mainDirection },
        })),

    updateAdditionalDirection: (additionalDirection) =>
        set((state) => ({
            surveyData: { ...state.surveyData, secondary_direction: additionalDirection },
        })),

    updateAgeGroup: (ageGroup) =>
        set((state) => ({
            surveyData: {
                ...state.surveyData,
                age: ageGroupToNumber(ageGroup) as any, // Конвертируем в число (среднее арифметическое)
            },
        })),

    setAgeGroupFromNumber: (age) =>
        set((state) => {
            const ageGroup = numberToAgeGroup(age)
            return {
                surveyData: {
                    ...state.surveyData,
                    age: ageGroup ? (ageGroupToNumber(ageGroup) as any) : null,
                },
            }
        }),

    updateHeight: (height) =>
        set((state) => ({
            surveyData: { ...state.surveyData, height },
        })),

    updateWeight: (weight) =>
        set((state) => ({
            surveyData: { ...state.surveyData, weight },
        })),

    updateBMI: (bmi) =>
        set((state) => ({
            surveyData: { ...state.surveyData, bmi },
        })),

    updateNotificationsEnabled: (notificationsEnabled) =>
        set((state) => ({
            surveyData: { ...state.surveyData, notif_main: notificationsEnabled },
        })),

    // Submit state methods
    setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
    setSubmitError: (submitError) => set({ submitError }),

    // BMI calculation using business logic from entities
    calculateBMI: () =>
        set((state) => {
            const { height, weight } = state.surveyData
            if (height && weight) {
                const bmi = calculateBMI(height, weight)
                return {
                    surveyData: { ...state.surveyData, bmi },
                }
            }
            return state
        }),

    getBMICategory: () => {
        const state = get()
        return getBMICategory(state.surveyData.bmi)
    },

    getTrainingDaysAsStrings: () => {
        const state = get()
        const masks = (state.surveyData.train_days as unknown as number[]) || []
        return masksToDays(masks)
    },

    getGoalsAsStrings: () => {
        const state = get()
        const masks = (state.surveyData.train_goals as unknown as number[]) || []
        return masksToGoals(masks)
    },

    getAgeGroupAsString: () => {
        const state = get()
        const age = state.surveyData.age as unknown as number
        if (age === null || age === undefined) return null
        return numberToAgeGroup(age)
    },

    // Navigation methods
    nextStep: () =>
        set((state) => ({
            currentStep: Math.min(state.currentStep + 1, state.totalSteps),
        })),

    prevStep: () =>
        set((state) => ({
            currentStep: Math.max(state.currentStep - 1, 1),
        })),

    goToStep: (step) =>
        set(() => ({
            currentStep: step,
        })),

    // Reset method
    resetSurvey: () =>
        set(() => ({
            surveyData: initialSurveyData,
            currentStep: 1,
        })),

    // Submit survey
    submitSurvey: async (userId: number) => {
        try {
            const { bmi, notif_main, ...surveyData } = get().surveyData

            // Преобразуем массивы битовых масок в числа
            const trainDaysMasks = (surveyData.train_days as unknown as number[]) || []
            const trainGoalsMasks = (surveyData.train_goals as unknown as number[]) || []

            const dataToSend = {
                ...surveyData,
                train_days: masksToDaysNumber(trainDaysMasks) as any,
                train_goals: masksToGoalsNumber(trainGoalsMasks) as any,
            }

            const result = await surveyApi.submitSurvey(userId, dataToSend as SurveyData)

            if (!result.success) {
                return { success: false, error: result.error }
            }

            return { success: true }
        } catch (error) {
            console.error('Error in submitSurvey:', error)
            const errorMessage = error instanceof Error ? error.message : 'Ошибка при отправке опроса'
            return { success: false, error: errorMessage }
        }
    },
}))
