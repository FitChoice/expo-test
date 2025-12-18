/**
 * ExerciseFlow widget (no network side-effects)
 * - Owns step FSM + UI flow
 * - Delegates server-side effects via injected callbacks (from pages/features)
 */

import { useEffect, useMemo, useState } from 'react'
import type * as posedetection from '@tensorflow-models/pose-detection'
import * as ScreenOrientation from 'expo-screen-orientation'
import { useKeepAwake } from 'expo-keep-awake'

import {
	useTrainingStore,
	type CompleteTrainingInput,
	type ExecuteExerciseInput,
	type ExerciseInfoResponse,
} from '@/entities/training'
import { ExerciseFlowView } from './ExerciseFlowView'

type ExerciseStep =
	| 'theory'
	| 'position'
	| 'execution'
	| 'side_switch'
	| 'rest'
	| 'rotate'

type ExerciseFlowProps = {
	model: posedetection.PoseDetector
	orientation: ScreenOrientation.Orientation
	onExecuteExercise: (payload: ExecuteExerciseInput) => Promise<unknown>
	onCompleteTraining: (payload: CompleteTrainingInput) => Promise<unknown>
}

export function ExerciseFlow({
	model,
	orientation,
	onExecuteExercise,
	onCompleteTraining,
}: ExerciseFlowProps) {
	useKeepAwake()

	const showTutorial = useTrainingStore((state) => state.showTutorial)
	const exercises = useTrainingStore((state) => state.exerciseDetails)
	const currentExerciseDetail = useTrainingStore((state) => state.currentExerciseDetail)
	const setCurrentExerciseId = useTrainingStore((state) => state.setCurrentExerciseId)

	const training = useTrainingStore((state) => state.training)
	const finishTraining = useTrainingStore((state) => state.finishTraining)
	const activeTime = useTrainingStore((state) => state.activeTime)
	const caloriesBurned = useTrainingStore((state) => state.caloriesBurned)
	const averageFormQuality = useTrainingStore((state) => state.averageFormQuality)
	const elapsedTime = useTrainingStore((state) => state.elapsedTime)

	const entryStep: ExerciseStep = showTutorial ? 'theory' : 'position'

	const [currentStep, setCurrentStep] = useState<ExerciseStep>(entryStep)
	const [currentSideState, setCurrentSideState] = useState<'left' | 'right'>('right')
	const [restType, setRestType] = useState<'rep' | 'set' | 'exercise'>('set')
	const [restPhase, setRestPhase] = useState<'main' | 'practice'>('main')
	const [setNumber, setSetNumber] = useState(0)
	const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
	const [shouldSwitchSide, setShouldSwitchSide] = useState(false)

	const resetExerciseProgress = () => {
		setSetNumber(0)
		setCurrentSideState('right')
		setRestType('set')
		setRestPhase('main')
		setShouldSwitchSide(false)
	}

	useEffect(() => {
		if (!currentExerciseDetail && exercises[0]) {
			setCurrentExerciseId(exercises[0].id)
		}
	}, [currentExerciseDetail, exercises, setCurrentExerciseId])

	useEffect(() => {
		if (!exercises.length) return
		if (currentExerciseDetail) {
			const matchedIndex = exercises.findIndex(
				(exercise) => exercise.id === currentExerciseDetail.id
			)
			if (matchedIndex !== -1) {
				setCurrentExerciseIndex(matchedIndex)
				return
			}
		}
		setCurrentExerciseIndex(0)
	}, [currentExerciseDetail, exercises])

	const currentExercise =
		currentExerciseDetail ??
		(exercises.length > 0 ? exercises[currentExerciseIndex] : null)

	const isLastExercise = currentExerciseIndex === exercises.length - 1
	const setsPerExercise = currentExercise?.sets ?? 1
	const requiresSideSwitch = Boolean(
		typeof currentExercise?.is_mirror === 'number'
			? Number(currentExercise.is_mirror)
			: currentExercise?.is_mirror
	)

	const displayCurrentSet = useMemo(() => {
		if (!currentExercise) return 1
		return Math.max(1, Math.min(setNumber + 1, currentExercise.sets ?? setNumber + 1))
	}, [currentExercise, setNumber])

	const startExercise = async (
		exercise: ExerciseInfoResponse,
		nextStep: ExerciseStep = entryStep
	) => {
		const exerciseIsVertical = !exercise.is_horizontal
		try {
			const currentOrientation = await ScreenOrientation.getOrientationAsync()
			const isPortrait =
				currentOrientation === ScreenOrientation.Orientation.PORTRAIT_UP ||
				currentOrientation === ScreenOrientation.Orientation.PORTRAIT_DOWN
			const isLandscape =
				currentOrientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
				currentOrientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT

			const needsRotate =
				(exerciseIsVertical && !isPortrait) || (!exerciseIsVertical && !isLandscape)

			if (needsRotate) {
				setCurrentStep('rotate')
				return
			}

			setCurrentStep(nextStep)
		} catch (err) {
			console.warn('Error checking orientation:', err)
			setCurrentStep(nextStep)
		}
	}

	useEffect(() => {
		if (!currentExercise) return
		resetExerciseProgress()
		void startExercise(currentExercise, entryStep)
	}, [currentExercise?.id, entryStep])

	useEffect(() => {
		if (currentStep === 'rest') {
			setRestPhase('main')
		}
	}, [currentStep])

	if (!currentExercise || !training?.id) return null

	const buildCompleteTrainingPayload = () => ({
		report_active_time: activeTime,
		report_cals: caloriesBurned,
		report_duration: elapsedTime,
		report_technique_quality: averageFormQuality,
		time: new Date().toISOString(),
		training_id: training.id,
	})

	const sendExerciseCompletion = async (
		exercise: ExerciseInfoResponse,
		isFinalExercise: boolean
	) => {
		const totalSides = exercise.is_mirror ? 2 : 1
		const totalReps = (exercise.reps ?? 0) * (exercise.sets ?? 1) * totalSides

		const payload: ExecuteExerciseInput = {
			id: exercise.id,
			training_id: training.id,
			reps: totalReps,
			quality: 100,
			recorded_errors: [],
		}

		if (!isFinalExercise) {
			void onExecuteExercise(payload)
			return
		}

		await onExecuteExercise(payload)
		await onCompleteTraining(buildCompleteTrainingPayload())
		finishTraining()
	}

	const handleExecutionComplete = () => {
		if (!currentExercise) return

		if (requiresSideSwitch) {
			if (currentSideState === 'right') {
				setCurrentSideState('left')
				setRestType('rep')
				setShouldSwitchSide(true)
				setCurrentStep('rest')
				return
			}

			const newSetNumber = setNumber + 1
			setSetNumber(newSetNumber)
			setCurrentSideState('right')

			if (newSetNumber < setsPerExercise) {
				setRestType('set')
				setShouldSwitchSide(false)
				setCurrentStep('rest')
			} else {
				void sendExerciseCompletion(currentExercise, isLastExercise)
				if (!isLastExercise) {
					setRestType('exercise')
					setCurrentStep('rest')
				}
			}
			return
		}

		const newSetNumber = setNumber + 1
		setSetNumber(newSetNumber)
		setCurrentSideState('right')

		if (newSetNumber < setsPerExercise) {
			setRestType('set')
			setCurrentStep('rest')
		} else {
			void sendExerciseCompletion(currentExercise, isLastExercise)
			if (!isLastExercise) {
				setRestType('exercise')
				setCurrentStep('rest')
			}
		}
	}

	const proceedToNextExercise = async () => {
		const nextIndex = currentExerciseIndex + 1
		if (!exercises[nextIndex]) return
		resetExerciseProgress()
		setCurrentExerciseIndex(nextIndex)
		setCurrentExerciseId(exercises[nextIndex].id)
	}

	const handleRestComplete = () => {
		if (restType === 'rep') {
			if (requiresSideSwitch && shouldSwitchSide) {
				setShouldSwitchSide(false)
				setCurrentStep('side_switch')
				return
			}
			setCurrentStep('execution')
			return
		}

		if (restType === 'set') {
			setCurrentStep('position')
			return
		}

		if (restType === 'exercise') {
			void proceedToNextExercise()
		}
	}

	const baseRestDuration =
		restType === 'rep'
			? 5
			: restType === 'set'
				? (currentExercise.rest_between_sets ?? 15)
				: (currentExercise.rest_after_exercise ?? 30)

	// Practice/theory during rest is allowed ONLY between repetitions of the same exercise.
	// In this flow that means the `rep` rest (we will resume execution of the same exercise after rest).
	// If it's the last repetition, `rep` rest will not happen => practice won't be shown.
	const hasPracticePhase = restType === 'rep' && baseRestDuration > 10
	const mainRestDuration = hasPracticePhase ? baseRestDuration - 10 : baseRestDuration

	const handleRestPhaseComplete = () => {
		if (hasPracticePhase && restPhase === 'main') {
			setRestPhase('practice')
			return
		}
		handleRestComplete()
	}

	const practiceVideoUrl = useMemo(() => {
		if (!currentExercise) return null
		if (!currentExercise.is_mirror) return currentExercise.video_practice
		return currentSideState === 'left'
			? currentExercise.video_practice_second || currentExercise.video_practice
			: currentExercise.video_practice
	}, [currentExercise, currentSideState])

	const executionKey = `${currentExercise.id}-${setNumber}-${currentSideState}`

	return (
		<ExerciseFlowView
			model={model}
			orientation={orientation}
			currentStep={currentStep}
			exercise={currentExercise}
			currentSet={displayCurrentSet}
			executionKey={executionKey}
			restPhase={restPhase}
			mainRestDuration={mainRestDuration}
			practiceVideoUrl={practiceVideoUrl}
			onRotateComplete={() => setCurrentStep(entryStep)}
			onCountdownComplete={() => setCurrentStep('position')}
			onPositionComplete={() => setCurrentStep('execution')}
			onExecutionComplete={handleExecutionComplete}
			onSideSwitchComplete={() => setCurrentStep('execution')}
			onRestPhaseComplete={handleRestPhaseComplete}
			onRestComplete={handleRestComplete}
		/>
	)
}
