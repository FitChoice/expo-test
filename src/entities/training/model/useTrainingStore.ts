/**
 * Zustand store для управления состоянием тренировки
 */

import { create } from 'zustand'
import {
	type Training,
	type TrainingStatus,
	type ExerciseSide,
	type ErrorLog,
	type SetData,
	type SavedWorkoutState,
	type ExerciseInfoResponse,
	type ExerciseDetails,
} from './types'

interface TrainingState {
	// Current training data
	training: Training | null
	currentExerciseDetail: ExerciseDetails | null
	exerciseDetails: ExerciseInfoResponse[]
	isExerciseLoading: boolean
	setCurrentExerciseId: (value: number) => void

	// Session state
	status: TrainingStatus
	currentExerciseId: number
	currentSet: number
	currentReps: number
	currentSide: ExerciseSide | null
	showTutorial: boolean

	// Timers
	elapsedTime: number
	activeTime: number
	restTime: number

	// Progress tracking
	completedExercises: number[]
	setHistory: SetData[]
	errors: ErrorLog[]

	// Metrics
	totalReps: number
	averageFormQuality: number
	caloriesBurned: number

	// Actions
	startOnboarding: () => void
	startTraining: (training: Training) => void
	resumeTraining: (state: SavedWorkoutState) => void
	resume: () => void
	stop: () => Promise<void>
	reportTraining: () => void
	reset: () => void
	setAnalytics: () => void
	setShowTutorial: (val: boolean) => void

	//setCurrentExerciseIndex: (val: number) => void
	nextExercise: () => void
	nextSet: () => void
	completeSet: (setData: SetData) => void
	finishTraining: () => void
	setCurrentReps: (reps: number) => void
	setCurrentSide: (side: ExerciseSide | null) => void
	setExerciseDetail: (detail: ExerciseInfoResponse | null) => void
	setExerciseLoading: (loading: boolean) => void
	setExerciseDetails: (successfulExercises: ExerciseInfoResponse[]) => void
	setStatus: (status: TrainingStatus) => void
}

const initialState = {
	training: null,
	status: 'idle' as TrainingStatus,
	currentExerciseId: 0,
	currentSet: 0,
	currentReps: 0,
	currentSide: null,
	elapsedTime: 0,
	activeTime: 0,
	restTime: 0,
	completedExercises: [],
	setHistory: [],
	errors: [],
	totalReps: 0,
	averageFormQuality: 0,
	caloriesBurned: 0,
	showTutorial: true,
	currentExerciseDetail: null,
	isExerciseLoading: false,
	exerciseDetails: [],
}

export const useTrainingStore = create<TrainingState>((set, get) => ({
	...initialState,

	setExerciseDetail: (detail: ExerciseInfoResponse | null) => {
		set({ currentExerciseDetail: detail })
	},

	setExerciseDetails: (details: ExerciseInfoResponse[]) => {
		const { currentExerciseId } = get()
		const matchedExercise =
			details.find((exercise) => exercise.id === currentExerciseId) ?? null

		set({
			exerciseDetails: details,
			currentExerciseDetail: matchedExercise ?? details[0] ?? null,
		})
	},

	setExerciseLoading: (loading: boolean) => {
		set({ isExerciseLoading: loading })
	},

	setStatus: (status) => {
		set({ status })
	},

	/**
	 * Start a new training session
	 */
	startTraining: (training) => {
		set({
			...initialState,
			training,
			status: 'info',
		})
	},

	startOnboarding: () => {
		set({
			status: 'onboarding',
		})
	},

	/**
	 * Resume training from saved state
	 */
	resumeTraining: (savedState) => {
		const { training } = get()
		if (!training) return

		set({
			//  currentExerciseIndex: savedState.currentExerciseIndex,
			currentSet: savedState.currentSet,
			currentReps: savedState.currentReps,
			currentSide: savedState.currentSide,
			elapsedTime: savedState.elapsedTime,
			completedExercises: savedState.completedExercises,
			status: 'running',
		})
	},

	/**
	 * Resume training after onboarding (change status from 'onboarding' to 'running')
	 */
	resume: () => {
		const { status } = get()
		if (status === 'onboarding') {
			set({ status: 'running' })
		}
	},

	reportTraining: () => {
		set({ status: 'report' })
	},

	finishTraining: () => {
		set({ status: 'finished' })
	},

	setCurrentReps: (reps) => {
		set({ currentReps: reps })
	},

	setCurrentSide: (side) => {
		set({ currentSide: side })
	},

	setAnalytics: () => {
		set({
			status: 'analytics',
		})
	},

	stop: async () => {
		set({ status: 'idle' })
	},

	setShowTutorial: (val) => {
		set({ showTutorial: val })
	},
	/**
	 * Reset training store to initial state
	 */
	reset: () => {
		set({ ...initialState })
	},

	setCurrentExerciseId: (id: number) => {
		const { exerciseDetails } = get()
		const nextDetail = exerciseDetails.find((exercise) => exercise.id === id) ?? null

		set({
			currentExerciseId: id,
			currentExerciseDetail: nextDetail,
		})
	},
	/**
	 * Move to next exercise
	 */
	nextExercise: () => {
		// const { training, currentExerciseIndex, completedExercises } = get()
		// if (!training) return
		//
		// const newIndex = currentExerciseIndex + 1
		//
		// const exerciseSide = training.exercises[newIndex]?.side || 'single'
		// set({
		//     currentExerciseIndex: newIndex,
		//     currentSet: 1,
		//     currentReps: 0,
		//     currentSide:
		// exerciseSide === 'single' ? null : (exerciseSide as ExerciseSide | null),
		//     completedExercises: [...completedExercises, currentExerciseIndex],
		// })
		//
		// // // Check if training is finished
		// // if (newIndex >= training.exercises.length) {
		// //     set({ status: 'finished' })
		// // }
	},

	/**
	 * Move to next set
	 */
	nextSet: () => {
		const { currentSet } = get()
		set({
			currentSet: currentSet + 1,
			currentReps: 0,
		})
	},

	/**
	 * Complete current set and log data
	 */
	completeSet: (setData) => {
		const { setHistory, totalReps, caloriesBurned } = get()

		const newSetHistory = [...setHistory, setData]
		const newTotalReps = totalReps + setData.reps

		// Calculate new average form quality
		const totalQuality = setHistory.reduce((sum, s) => sum + s.formQuality, 0)
		const newAvgQuality = (totalQuality + setData.formQuality) / newSetHistory.length

		// Estimate calories (simple: 0.5 cal per rep)
		const newCalories = caloriesBurned + setData.reps * 0.5

		set({
			setHistory: newSetHistory,
			totalReps: newTotalReps,
			averageFormQuality: Math.round(newAvgQuality),
			caloriesBurned: Math.round(newCalories),
		})
	},
}))
