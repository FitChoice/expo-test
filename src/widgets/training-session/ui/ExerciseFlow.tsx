/**
 * ExerciseFlow widget
 * Управляет flow выполнения упражнений
 * Включает countdown, body position check, exercise execution, rest, transitions
 */

import { useState, useCallback } from 'react'
import { View } from 'react-native'
import { router } from 'expo-router'
import { ExerciseCountdownScreen } from './exercise/ExerciseCountdownScreen'
import { BodyPositionScreen } from './exercise/BodyPositionScreen'
import { AIExerciseScreen } from './exercise/AIExerciseScreen'
import { TimerExerciseScreen } from './exercise/TimerExerciseScreen'
import { ExerciseSuccessScreen } from './exercise/ExerciseSuccessScreen'
import { SideSwitchScreen } from './exercise/SideSwitchScreen'
import { RestScreen } from './exercise/RestScreen'
import { ExerciseTransitionScreen } from './exercise/ExerciseTransitionScreen'
import { useTrainingStore } from '@/entities/training'

type ExerciseStep =
	| 'countdown'
	| 'position'
	| 'execution'
	| 'success'
	| 'side_switch'
	| 'rest'
	| 'transition'

export function ExerciseFlow() {
	const [currentStep, setCurrentStep] = useState<ExerciseStep>('countdown')
	const [currentSideState, setCurrentSideState] = useState<'left' | 'right' | null>(null)
	const training = useTrainingStore((state) => state.training)
	const currentExerciseIndex = useTrainingStore((state) => state.currentExerciseIndex)
	const currentSet = useTrainingStore((state) => state.currentSet)
	const completeSet = useTrainingStore((state) => state.completeSet)
	const nextExercise = useTrainingStore((state) => state.nextExercise)
	const pause = useTrainingStore((state) => state.pause)
	const stop = useTrainingStore((state) => state.stop)

	if (!training) return null

	const currentExercise = training.exercises[currentExerciseIndex]
	if (!currentExercise) return null

	// Check if exercise has sides
	const hasSides = currentExercise.side === 'both'

	const handleCountdownComplete = useCallback(() => {
		// Skip body position for timer exercises
		if (currentExercise.type === 'timer') {
			setCurrentStep('execution')
		} else {
			setCurrentStep('position')
		}
	}, [currentExercise.type])

	const handlePositionComplete = useCallback(() => {
		setCurrentStep('execution')
	}, [])

	const handleExecutionComplete = useCallback(() => {
		// Mark set as complete
		completeSet({
			exerciseIndex: currentExerciseIndex,
			setNumber: currentSet,
			reps: 0, // Will be updated during execution
			formQuality: 0, // Will be updated during execution
			elapsedTime: 0, // Will be updated during execution
			errors: [], // Will be populated during execution
		})
		setCurrentStep('success')
	}, [completeSet, currentExerciseIndex, currentSet])

	const handleSuccessComplete = useCallback(() => {
		// Check if need to switch sides
		if (hasSides && currentSideState === null) {
			// First side done, switch to right
			setCurrentSideState('left')
			setCurrentStep('side_switch')
			return
		}

		if (hasSides && currentSideState === 'left') {
			// Right side done, continue to rest/next
			setCurrentSideState(null) // Reset for next set
		}

		const isLastSet = currentSet >= currentExercise.sets
		const isLastExercise = currentExerciseIndex >= training.exercises.length - 1

		if (isLastSet) {
			if (isLastExercise) {
				// Workout complete - navigate to report
				stop() // This marks training as finished
				router.replace({
					pathname: '/(training)/report',
					params: { trainingId: training.trainingId },
				})
			} else {
				// Move to next exercise
				nextExercise()
				setCurrentStep('transition')
			}
		} else {
			// Rest before next set
			setCurrentStep('rest')
		}
	}, [hasSides, currentSideState, currentSet, currentExercise.sets, currentExerciseIndex, training.exercises.length, training.trainingId, stop, nextExercise])

	const handleSideSwitchComplete = useCallback(() => {
		// Start position check for second side
		setCurrentStep('position')
	}, [])

	const handleRestComplete = useCallback(() => {
		// Start next set (countdown)
		setCurrentStep('countdown')
	}, [])

	const handleTransitionComplete = useCallback(() => {
		// Start next exercise (countdown)
		setCurrentStep('countdown')
	}, [])

	const handlePause = useCallback(() => {
		pause()
	}, [pause])

	const handleStop = useCallback(() => {
		stop()
		router.back()
	}, [stop])

	const nextExerciseData = training.exercises[currentExerciseIndex + 1]

	return (
		<View className="flex-1">
			{currentStep === 'countdown' && (
				<ExerciseCountdownScreen
					exercise={currentExercise}
					currentSet={currentSet}
					onComplete={handleCountdownComplete}
					onPause={handlePause}
					onStop={handleStop}
				/>
			)}
			{currentStep === 'position' && (
				<BodyPositionScreen
					onComplete={handlePositionComplete}
					onPause={handlePause}
					onStop={handleStop}
				/>
			)}
			{currentStep === 'execution' && currentExercise.type === 'ai' && (
				<AIExerciseScreen
					onComplete={handleExecutionComplete}
					onPause={handlePause}
					onStop={handleStop}
				/>
			)}
			{currentStep === 'execution' && currentExercise.type === 'timer' && (
				<TimerExerciseScreen
					onComplete={handleExecutionComplete}
					onPause={handlePause}
					onStop={handleStop}
				/>
			)}
			{currentStep === 'success' && (
				<ExerciseSuccessScreen onComplete={handleSuccessComplete} />
			)}
			{currentStep === 'side_switch' && (
				<SideSwitchScreen
					nextSide={currentSideState === null ? 'left' : 'right'}
					onComplete={handleSideSwitchComplete}
				/>
			)}
			{currentStep === 'rest' && (
				<RestScreen onComplete={handleRestComplete} duration={currentExercise.restTime} />
			)}
			{currentStep === 'transition' && nextExerciseData && (
				<ExerciseTransitionScreen
					nextExercise={nextExerciseData}
					onComplete={handleTransitionComplete}
				/>
			)}
		</View>
	)
}
