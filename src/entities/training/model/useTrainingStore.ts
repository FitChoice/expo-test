/**
 * Zustand store для управления состоянием тренировки
 */

import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type {
	Training,
	TrainingStatus,
	ExerciseSide,
	ErrorLog,
	SetData,
	SavedWorkoutState,
} from './types'

interface TrainingState {
	// Current training data
	training: Training | null

	// Session state
	status: TrainingStatus
	currentExerciseIndex: number
	currentSet: number
	currentReps: number
	currentSide: ExerciseSide | null

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
	startTraining: (training: Training) => void
	resumeTraining: (state: SavedWorkoutState) => void
	pause: () => Promise<void>
	resume: () => void
	stop: () => Promise<void>

	nextExercise: () => void
	nextSet: () => void
	completeSet: (setData: SetData) => void
	incrementRep: () => void

	logError: (error: ErrorLog) => void

	updateTimer: (elapsed: number, active: number) => void

	reset: () => void

	// Helpers
	getSavedState: () => Promise<SavedWorkoutState | null>
	clearSavedState: () => Promise<void>
}

const initialState = {
	training: null,
	status: 'idle' as TrainingStatus,
	currentExerciseIndex: 0,
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
}

export const useTrainingStore = create<TrainingState>((set, get) => ({
	...initialState,

	/**
	 * Start a new training session
	 */
	startTraining: (training) => {
		set({
			...initialState,
			training,
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
			currentExerciseIndex: savedState.currentExerciseIndex,
			currentSet: savedState.currentSet,
			currentReps: savedState.currentReps,
			currentSide: savedState.currentSide,
			elapsedTime: savedState.elapsedTime,
			completedExercises: savedState.completedExercises,
			status: 'running',
		})
	},

	/**
	 * Pause training and save state
	 */
	pause: async () => {
		const state = get()
		const { training } = state
		if (!training) return

		set({ status: 'paused' })

		// Save state to AsyncStorage
		const savedState: SavedWorkoutState = {
			trainingId: training.trainingId,
			currentExerciseIndex: state.currentExerciseIndex,
			currentSet: state.currentSet,
			currentReps: state.currentReps,
			currentSide: state.currentSide,
			elapsedTime: state.elapsedTime,
			completedExercises: state.completedExercises,
			pausedAt: new Date().toISOString(),
		}

		await AsyncStorage.setItem(
			`training_session_${training.trainingId}`,
			JSON.stringify(savedState)
		)
	},

	/**
	 * Resume from pause
	 */
	resume: () => {
		set({ status: 'running' })
	},

	/**
	 * Stop training and save state
	 */
	stop: async () => {
		await get().pause()
	},

	/**
	 * Move to next exercise
	 */
	nextExercise: () => {
		const { training, currentExerciseIndex, completedExercises } = get()
		if (!training) return

		const newIndex = currentExerciseIndex + 1

		set({
			currentExerciseIndex: newIndex,
			currentSet: 1,
			currentReps: 0,
			currentSide: training.exercises[newIndex]?.side || null,
			completedExercises: [...completedExercises, currentExerciseIndex],
		})

		// Check if training is finished
		if (newIndex >= training.exercises.length) {
			set({ status: 'finished' })
		}
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

	/**
	 * Increment rep counter
	 */
	incrementRep: () => {
		const { currentReps } = get()
		set({ currentReps: currentReps + 1 })
	},

	/**
	 * Log an error
	 */
	logError: (error) => {
		const { errors } = get()
		set({ errors: [...errors, error] })
	},

	/**
	 * Update timers
	 */
	updateTimer: (elapsed, active) => {
		set({
			elapsedTime: elapsed,
			activeTime: active,
		})
	},

	/**
	 * Reset store to initial state
	 */
	reset: () => {
		set(initialState)
	},

	/**
	 * Get saved state from AsyncStorage
	 */
	getSavedState: async () => {
		const { training } = get()
		if (!training) return null

		const savedJson = await AsyncStorage.getItem(
			`training_session_${training.trainingId}`
		)

		if (!savedJson) return null

		try {
			return JSON.parse(savedJson) as SavedWorkoutState
		} catch (error) {
			console.error('Failed to parse saved workout state:', error)
			return null
		}
	},

	/**
	 * Clear saved state from AsyncStorage
	 */
	clearSavedState: async () => {
		const { training } = get()
		if (!training) return

		await AsyncStorage.removeItem(`training_session_${training.trainingId}`)
	},
}))
