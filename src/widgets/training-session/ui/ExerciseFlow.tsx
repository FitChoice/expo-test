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
import { ExerciseSuccessScreen } from './exercise/ExerciseSuccessScreen'
import { SideSwitchScreen } from './exercise/SideSwitchScreen'
import { RestScreen } from './exercise/RestScreen'
import { ExerciseTransitionScreen } from './exercise/ExerciseTransitionScreen'
import { StopModal } from './modals/StopModal'
import { useTrainingStore } from '@/entities/training'
import {
	TimerExerciseScreen
} from '@/widgets/training-session/ui/exercise/TimerExerciseScreen'
import { PauseModal } from '@/widgets/training-session'
import { Container } from '@/shared/ui'

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
	const nextExercise = useTrainingStore((state) => state.nextExercise)
	const stop = useTrainingStore((state) => state.stop)

	const [exerciseNumber, setExerciseNumber] = useState(0)

	if (!training) return null

	const currentExercise = training.exercises[currentExerciseIndex]
	if (!currentExercise) return null

	// Check if exercise has sides
	const hasSides = currentExercise?.side === 'both'

	const handleCountdownComplete = () => {
			setCurrentStep('position')
	}

	const handlePositionComplete = () => {
		setCurrentStep('execution')
	}

	const handleExecutionComplete = () => {
		// Mark set as complete
		setCurrentStep('side_switch')
		setExerciseNumber((prev) => prev + 1)
		// completeSet({
		// 	exerciseIndex: currentExerciseIndex,
		// 	setNumber: currentSet,
		// 	reps: 0, // Will be updated during execution
		// 	formQuality: 0, // Will be updated during execution
		// 	elapsedTime: 0, // Will be updated during execution
		// 	errors: [], // Will be populated during execution
		// })
		// setCurrentStep('success')
	}

	const handleSuccessComplete = () => {
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
					params: { trainingId: training.id.toString() },
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
	}
	const handleSideSwitchComplete =() => {
		// Start position check for second side

		if (exerciseNumber < 2) {
			setCurrentStep('execution')
		} else {
			setCurrentStep( 'success')
		}

	}



	const handleTransitionComplete = () => {
		// Start next exercise (countdown)
		setCurrentStep('countdown')
	}





	const nextExerciseData = training.exercises[currentExerciseIndex + 1]

	return (<Container>
		<View className="flex-1">
			{currentStep === 'countdown' && (
				<ExerciseCountdownScreen
					exercise={currentExercise}
					currentSet={currentSet}
					onComplete={handleCountdownComplete}
			
				/>
			)}
			{currentStep === 'position' && (
				<BodyPositionScreen
					onComplete={handlePositionComplete}
				/>
			)}
			{/*{currentStep === 'execution' && currentExercise.isAi && (*/}
			{/*	<AIExerciseScreen*/}
			{/*		onComplete={handleExecutionComplete}*/}

			{/*	/>*/}
			{/*)}*/}
			{currentStep === 'execution' && !currentExercise.isAi && (
				<TimerExerciseScreen
					onComplete={handleExecutionComplete}
					exercise={currentExercise}
				/>
			)}
			{currentStep === 'success' && (
				<ExerciseSuccessScreen onComplete={handleSuccessComplete} />
			)}
			{currentStep === 'side_switch' && (
				<BodyPositionScreen
					onComplete={handleSideSwitchComplete}
					title={'Смена рабочей стороны'}
				/>

				// <SideSwitchScreen
				// 	nextSide={currentSideState === null ? 'left' : 'right'}
				// 	onComplete={handleSideSwitchComplete}
				// />
			)}
			{/*{currentStep === 'rest' && (*/}
			{/*	<RestScreen onComplete={handleRestComplete} duration={currentExercise.restTime} />*/}
			{/*)}*/}
			{currentStep === 'transition' && nextExerciseData && (
				<ExerciseTransitionScreen
					nextExercise={nextExerciseData}
					onComplete={handleTransitionComplete}
				/>
			)}

		</View>
		</Container>
	)
}
