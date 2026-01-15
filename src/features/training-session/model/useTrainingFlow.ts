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

	const setCurrentSide = useTrainingStore((state) => state.setCurrentSide)
	const currentReps = useTrainingStore((state) => state.currentReps)
	const setCurrentReps = useTrainingStore((state) => state.setCurrentReps)
	const setCurrentSetStore = useTrainingStore((state) => state.setCurrentSet)
	const nextSet = useTrainingStore((state) => state.nextSet)

	const [currentStep, setCurrentStep] = useState<ExerciseStep>('rotate')
	const [currentSideState, setCurrentSideState] = useState<'left' | 'right'>('right')
	const [restType, setRestType] = useState<'set' | 'exercise'>('set')
	const [setNumber, setSetNumber] = useState(0)
	const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)

	// Накопленные повторы для текущего упражнения (включая все сеты и стороны)
	const accumulatedExerciseReps = useRef(0)

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
		setCurrentSetStore(0)
		setCurrentSideState('right')
		setCurrentSide('right')
		setRestType('set')
	}, [setCurrentSetStore, setCurrentSide])

	const startExercise = useCallback(async (exercise: ExerciseInfoResponse) => {
		const exerciseIsVertical = !exercise.is_horizontal
		try {
			const currentOrientation = await ScreenOrientation.getOrientationAsync()
			const isPortrait =
				currentOrientation === ScreenOrientation.Orientation.PORTRAIT_UP ||
				currentOrientation === ScreenOrientation.Orientation.PORTRAIT_DOWN

			const needsRotate = exerciseIsVertical ? !isPortrait : !exerciseIsVertical && isPortrait

			if (needsRotate) {
				setCurrentStep('rotate')
				return
			}
			
			if (showTutorial) {
				setCurrentStep('theory')
			} else {
				setCurrentStep('position')
			}
		} catch {
			setCurrentStep(showTutorial ? 'theory' : 'position')
		}
	}, [showTutorial])

	useEffect(() => {
		if (!currentExercise) return
		resetExerciseProgress()
		void startExercise(currentExercise)
	}, [currentExercise?.id, resetExerciseProgress, startExercise])

	// Handler для завершения ротации
	const handleRotateComplete = useCallback(() => {
		if (showTutorial) {
			setCurrentStep('theory')
		} else {
			setCurrentStep('position')
		}
	}, [showTutorial])

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

	const completeSet = useTrainingStore((state) => state.completeSet)

	const sendExerciseCompletion = useCallback(async (exercise: ExerciseInfoResponse, isFinal: boolean) => {
		const payload: ExecuteExerciseInput = {
			id: exercise.id,
			training_id: training?.id ?? 0,
			reps: accumulatedExerciseReps.current,
			quality: 100, // TODO: Получать реальное качество из Engine
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
		accumulatedExerciseReps.current = 0 // Сброс для нового упражнения
		setCurrentExerciseIndex(nextIndex)
		setCurrentExerciseId(exercises[nextIndex].id)
	}, [currentExerciseIndex, exercises, resetExerciseProgress, setCurrentExerciseId])

	const handleExecutionComplete = useCallback(() => {
		if (!currentExercise) return

		const newSetNumber = setNumber + 1
		
		// Логируем завершение сета
		const repsDone = currentReps
		accumulatedExerciseReps.current += repsDone
		
		completeSet({
			exerciseIndex: currentExerciseIndex,
			setNumber: setNumber,
			reps: repsDone,
			formQuality: 100,
			elapsedTime: 0,
			errors: [],
		})

		if (requiresSideSwitch) {
			// Логика для упражнений с зеркалированием сторон
			if (newSetNumber < setsPerExercise) {
				// Ещё остались сеты для текущей стороны
				setSetNumber(newSetNumber)
				nextSet()
				setRestType('set')
				setCurrentStep('rest')
			} else {
				// Все сеты для текущей стороны выполнены
				if (currentSideState === 'right') {
					// Закончили правую сторону, переходим к смене на левую
					setCurrentSideState('left')
					setCurrentSide('left')
					setCurrentReps(0)
					setSetNumber(0)
					setCurrentSetStore(0)
					setCurrentStep('side_switch')
				} else {
					// Закончили левую сторону (т.е. всё упражнение)
					void sendExerciseCompletion(currentExercise, isLastExercise)
					if (!isLastExercise) {
						setRestType('exercise')
						setCurrentStep('rest')
					}
				}
			}
			return
		}

		// Логика для обычных упражнений (без сторон)
		if (newSetNumber < setsPerExercise) {
			setSetNumber(newSetNumber)
			nextSet()
			setCurrentSideState('right')
			setCurrentSide('right')
			setRestType('set')
			setCurrentStep('rest')
		} else {
			void sendExerciseCompletion(currentExercise, isLastExercise)
			if (!isLastExercise) {
				setRestType('exercise')
				setCurrentStep('rest')
			}
		}
	}, [currentExercise, currentReps, completeSet, currentExerciseIndex, setNumber, requiresSideSwitch, currentSideState, setsPerExercise, nextSet, setCurrentSide, setCurrentReps, setCurrentSetStore, sendExerciseCompletion, isLastExercise])

	const handleRestComplete = useCallback(() => {
		if (restType === 'set') {
			setCurrentStep('position')
			return
		}

		if (restType === 'exercise') {
			void proceedToNextExercise()
		}
	}, [restType, proceedToNextExercise])

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
		return restType === 'set'
			? (currentExercise.rest_between_sets ?? 15)
			: (currentExercise.rest_after_exercise ?? 30)
	}, [restType, currentExercise])

	const executionKey = `${currentExercise?.id}-${setNumber}-${currentSideState}`

	// Handler для завершения side_switch — сбрасывает счётчик и переходит к position
	const handleSideSwitchComplete = useCallback(() => {
		setCurrentReps(0)
		setSetNumber(0)
		setCurrentSetStore(0)
		setCurrentStep('position')
	}, [setCurrentReps, setCurrentSetStore])

	return {
		currentStep,
		currentExercise,
		currentSideState,
		displayCurrentSet,
		practiceVideoUrl,
		baseRestDuration,
		executionKey,
		handleRotateComplete,
		handleTheoryComplete,
		handlePositionComplete,
		handleExecutionComplete,
		handleRestComplete,
		handleSideSwitchComplete,
	}
}
