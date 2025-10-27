/**
 * Survey flow state management
 * Manages UI state and form mutations for the survey flow
 */

import { create } from 'zustand'
import {
	SurveyData,
	calculateBMI,
	getBMICategory,
	type BMICategory,
} from '@/entities/survey'

interface SurveyFlowStore {
	// UI state
	currentStep: number
	totalSteps: number

	// Data
	surveyData: SurveyData

	// Методы обновления данных
	updateName: (name: string) => void
	updateGender: (gender: SurveyData['gender']) => void
	updateTrainingDays: (days: SurveyData['trainingDays']) => void
	updateFrequency: (frequency: SurveyData['frequency']) => void
	updateGoals: (goals: SurveyData['goals']) => void
	updateMainDirection: (direction: SurveyData['mainDirection']) => void
	updateAdditionalDirections: (directions: SurveyData['additionalDirections']) => void
	updateAgeGroup: (ageGroup: SurveyData['ageGroup']) => void
	updateHeight: (height: number | null) => void
	updateWeight: (weight: number | null) => void
	updateBMI: (bmi: number | null) => void
	updateNotificationsEnabled: (enabled: boolean) => void

	// BMI methods (using business logic from entities)
	calculateBMI: () => void
	getBMICategory: () => BMICategory | null

	// Navigation methods
	nextStep: () => void
	prevStep: () => void
	goToStep: (step: number) => void

	// Reset method
	resetSurvey: () => void

	// Submit survey
	submitSurvey: () => Promise<void>
}

const initialSurveyData: SurveyData = {
	name: '',
	gender: null,
	trainingDays: [],
	frequency: null,
	goals: [],
	mainDirection: null,
	additionalDirections: [],
	ageGroup: null,
	height: null,
	weight: null,
	bmi: null,
	notificationsEnabled: false,
}

export const useSurveyFlow = create<SurveyFlowStore>((set, get) => ({
	surveyData: initialSurveyData,
	currentStep: 1,
	totalSteps: 14,

	// Методы обновления данных
	updateName: (name) =>
		set((state) => ({
			surveyData: { ...state.surveyData, name },
		})),

	updateGender: (gender) =>
		set((state) => ({
			surveyData: { ...state.surveyData, gender },
		})),

	updateTrainingDays: (trainingDays) =>
		set((state) => ({
			surveyData: { ...state.surveyData, trainingDays },
		})),

	updateFrequency: (frequency) =>
		set((state) => ({
			surveyData: { ...state.surveyData, frequency },
		})),

	updateGoals: (goals) =>
		set((state) => ({
			surveyData: { ...state.surveyData, goals },
		})),

	updateMainDirection: (mainDirection) =>
		set((state) => ({
			surveyData: { ...state.surveyData, mainDirection },
		})),

	updateAdditionalDirections: (additionalDirections) =>
		set((state) => ({
			surveyData: { ...state.surveyData, additionalDirections },
		})),

	updateAgeGroup: (ageGroup) =>
		set((state) => ({
			surveyData: { ...state.surveyData, ageGroup },
		})),

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
			surveyData: { ...state.surveyData, notificationsEnabled },
		})),

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
	submitSurvey: async () => {
		// TODO: Implement API call to submit survey
		const surveyData = get().surveyData
		console.warn('Submitting survey:', surveyData)
	},
}))
