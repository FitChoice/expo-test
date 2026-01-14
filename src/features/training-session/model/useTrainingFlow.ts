import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as ScreenOrientation from 'expo-screen-orientation'
import type { ExerciseInfoResponse, ExecuteExerciseInput, CompleteTrainingInput } from '@/entities/training'
import { useTrainingStore } from '@/entities/training'

export type ExerciseStep = 'theory' | 'position' | 'execution' | 'side_switch' | 'rest' | 'rotate'

interface UseTrainingFlowProps {
	exercises: ExerciseInfoResponse[]
	onExecuteExercise: (payload: ExecuteExerciseInput) => Promise<unknown>
	onCompleteTraining: (payload: CompleteTrainingInput) => Promise<unknown>
}

export function useTrainingFlow({
	exercises,
	onExecuteExercise,
	onCompleteTraining,
}: UseTrainingFlowProps) {
	const showTutorial = useTrainingStore((state) => state.showTutorial)
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

	// Ref для хранения целевого шага после ротации (избегаем closure issues)
	const postRotateStepRef = useRef<ExerciseStep | null>(null)

	const currentExercise = currentExerciseDetail ?? (exercises.length > 0 ? exercises[currentExerciseIndex] : null)
	const isLastExercise = currentExerciseIndex === exercises.length - 1
	const setsPerExercise = currentExercise?.sets ?? 1
	const requiresSideSwitch = Boolean(
		typeof currentExercise?.is_mirror === 'number'
			? Number(currentExercise.is_mirror)
			: currentExercise?.is_mirror
	)

	const resetExerciseProgress = useCallback(() => {
		setSetNumber(0)
		setCurrentSideState('right')
		setRestType('set')
		setRestPhase('main')
		setShouldSwitchSide(false)
	}, [])

	const startExercise = useCallback(async (exercise: ExerciseInfoResponse, nextStep: ExerciseStep) => {
		const exerciseIsVertical = !exercise.is_horizontal
		try {
			const currentOrientation = await ScreenOrientation.getOrientationAsync()
			const isPortrait =
				currentOrientation === ScreenOrientation.Orientation.PORTRAIT_UP ||
				currentOrientation === ScreenOrientation.Orientation.PORTRAIT_DOWN
			const isLandscape =
				currentOrientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
				currentOrientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT

			const needsRotate = (exerciseIsVertical && !isPortrait) || (!exerciseIsVertical && !isLandscape)

			if (needsRotate) {
				postRotateStepRef.current = nextStep // Сохраняем целевой шаг
				setCurrentStep('rotate')
				return
			}
			postRotateStepRef.current = null
			setCurrentStep(nextStep)
		} catch {
			postRotateStepRef.current = null
			setCurrentStep(nextStep)
		}
	}, [])

	useEffect(() => {
		if (!currentExercise) return
		resetExerciseProgress()
		void startExercise(currentExercise, entryStep)
	}, [currentExercise?.id, entryStep, resetExerciseProgress, startExercise])

	// Handler для завершения ротации — использует ref для избежания stale closure
	const handleRotateComplete = useCallback(() => {
		const targetStep = postRotateStepRef.current ?? entryStep
		postRotateStepRef.current = null
		setCurrentStep(targetStep)
	}, [entryStep])

	// Handler для завершения теории — переход к позиционированию
	const handleTheoryComplete = useCallback(() => {
		setCurrentStep('position')
	}, [])

	// Handler для завершения позиционирования — переход к выполнению
	const handlePositionComplete = useCallback(() => {
		setCurrentStep('execution')
	}, [])

	const buildCompleteTrainingPayload = useCallback((): CompleteTrainingInput => ({
		report_active_time: activeTime,
		report_cals: caloriesBurned,
		report_duration: elapsedTime,
		report_technique_quality: averageFormQuality,
		time: new Date().toISOString(),
		training_id: training?.id ?? 0,
	}), [activeTime, caloriesBurned, elapsedTime, averageFormQuality, training?.id])

	const sendExerciseCompletion = useCallback(async (exercise: ExerciseInfoResponse, isFinal: boolean) => {
		const totalSides = exercise.is_mirror ? 2 : 1
		const totalReps = (exercise.reps ?? 0) * (exercise.sets ?? 1) * totalSides

		const payload: ExecuteExerciseInput = {
			id: exercise.id,
			training_id: training?.id ?? 0,
			reps: totalReps,
			quality: 100,
			recorded_errors: [],
		}

		if (!isFinal) {
			void onExecuteExercise(payload)
			return
		}

		await onExecuteExercise(payload)
		await onCompleteTraining(buildCompleteTrainingPayload())
		finishTraining()
	}, [training?.id, onExecuteExercise, onCompleteTraining, buildCompleteTrainingPayload, finishTraining])

	const proceedToNextExercise = useCallback(async () => {
		const nextIndex = currentExerciseIndex + 1
		if (!exercises[nextIndex]) return
		resetExerciseProgress()
		setCurrentExerciseIndex(nextIndex)
		setCurrentExerciseId(exercises[nextIndex].id)
	}, [currentExerciseIndex, exercises, resetExerciseProgress, setCurrentExerciseId])

	const setCurrentSide = useTrainingStore((state) => state.setCurrentSide)
	const setCurrentReps = useTrainingStore((state) => state.setCurrentReps)
	const nextSet = useTrainingStore((state) => state.nextSet)

	const handleExecutionComplete = useCallback(() => {
		if (!currentExercise) return

		if (requiresSideSwitch) {
			if (currentSideState === 'right') {
				setCurrentSideState('left')
				setCurrentSide('left')
				setCurrentReps(0) // Явный сброс счётчика перед сменой стороны
				setRestType('rep')
				setShouldSwitchSide(true)
				setCurrentStep('rest')
				return
			}

			const newSetNumber = setNumber + 1
			setSetNumber(newSetNumber)
			nextSet()
			setCurrentSideState('right')
			setCurrentSide('right')

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
		nextSet()
		setCurrentSideState('right')
		setCurrentSide('right')

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
	}, [currentExercise, requiresSideSwitch, currentSideState, setNumber, setsPerExercise, sendExerciseCompletion, isLastExercise, setCurrentSide, setCurrentReps, nextSet])

	const handleRestComplete = useCallback(() => {
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
	}, [restType, requiresSideSwitch, shouldSwitchSide, proceedToNextExercise])

	const handleRestPhaseComplete = useCallback(() => {
		const baseRestDuration = restType === 'rep' ? 5 : restType === 'set' ? (currentExercise?.rest_between_sets ?? 15) : (currentExercise?.rest_after_exercise ?? 30)
		const hasPracticePhase = restType === 'rep' && baseRestDuration > 10

		if (hasPracticePhase && restPhase === 'main') {
			setRestPhase('practice')
			return
		}
		handleRestComplete()
	}, [restType, currentExercise, restPhase, handleRestComplete])

	const displayCurrentSet = Math.max(
		1,
		Math.min(setNumber + 1, currentExercise?.sets ?? setNumber + 1)
	)

	const practiceVideoUrl = useMemo(() => {
		if (!currentExercise) return null
		if (!currentExercise.is_mirror) return currentExercise.video_practice
		return currentSideState === 'left'
			? currentExercise.video_practice_second || currentExercise.video_practice
			: currentExercise.video_practice
	}, [currentExercise, currentSideState])

	const baseRestDuration = useMemo(() => {
		if (!currentExercise) return 15
		return restType === 'rep'
			? 5
			: restType === 'set'
				? (currentExercise.rest_between_sets ?? 15)
				: (currentExercise.rest_after_exercise ?? 30)
	}, [restType, currentExercise])

	const hasPracticePhase = restType === 'rep' && baseRestDuration > 10
	const mainRestDuration = hasPracticePhase ? baseRestDuration - 10 : baseRestDuration

	const executionKey = `${currentExercise?.id}-${setNumber}-${currentSideState}`

	// Handler для завершения side_switch — сбрасывает счётчик и переходит к execution
	const handleSideSwitchComplete = useCallback(() => {
		setCurrentReps(0) // Гарантированный сброс перед execution на второй стороне
		setCurrentStep('execution')
	}, [setCurrentReps])

	return {
		currentStep,
		currentExercise,
		currentSideState,
		restPhase,
		displayCurrentSet,
		practiceVideoUrl,
		mainRestDuration,
		executionKey,
		handleRotateComplete,
		handleTheoryComplete,
		handlePositionComplete,
		handleExecutionComplete,
		handleRestComplete,
		handleRestPhaseComplete,
		handleSideSwitchComplete,
	}
}
