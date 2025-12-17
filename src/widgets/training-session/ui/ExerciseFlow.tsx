/**
 * ExerciseFlow widget
 * Управляет flow выполнения упражнений
 * Включает countdown, body position check, exercise execution, rest
 */

import { useState, useEffect } from 'react'
import { View } from 'react-native'
import * as ScreenOrientation from 'expo-screen-orientation'
import type * as posedetection from '@tensorflow-models/pose-detection'
import { BodyPositionScreen } from './exercise/BodyPositionScreen'
import { RestScreen } from './exercise/RestScreen'
import { RotateScreen } from './exercise/RotateScreen'
import { useTrainingStore } from '@/entities/training'
import { ExerciseExecutionScreen } from '@/widgets/training-session/ui/exercise/ExerciseExecutionScreen'
import { useKeepAwake } from 'expo-keep-awake'
import { ExerciseTheoryScreen } from '@/widgets/training-session/ui/exercise/ExerciseTheoryScreen'
import { trainingApi, type ExecuteExerciseInput } from '@/features/training/api'
import type { ExerciseInfoResponse } from '@/entities/training'
import { showToast } from '@/shared/lib'

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
}

export function ExerciseFlow({ model, orientation }: ExerciseFlowProps) {
    useKeepAwake()
    const showTutorial = useTrainingStore((state) => state.showTutorial)
    const exercises = useTrainingStore((state) => state.exerciseDetails)
    const currentExerciseDetail = useTrainingStore((state) => state.currentExerciseDetail)
    const setCurrentExerciseId = useTrainingStore((state) => state.setCurrentExerciseId)
    const training = useTrainingStore((state) => state.training)
    const activeTime = useTrainingStore((state) => state.activeTime)
    const caloriesBurned = useTrainingStore((state) => state.caloriesBurned)
    const averageFormQuality = useTrainingStore((state) => state.averageFormQuality)
    const elapsedTime = useTrainingStore((state) => state.elapsedTime)
    const entryStep: ExerciseStep = showTutorial ? 'theory' : 'position'
    const [currentStep, setCurrentStep] = useState<ExerciseStep>(entryStep)
    const [currentSideState, setCurrentSideState] = useState<'left' | 'right'>('right')
    const [restType, setRestType] = useState<'rep' | 'set' | 'exercise'>('rep')
    const [restPhase, setRestPhase] = useState<'main' | 'practice'>('main')
    const [repNumber, setRepNumber] = useState(0)
    const [setNumber, setSetNumber] = useState(0)
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
    const [shouldSwitchSide, setShouldSwitchSide] = useState(false)

    console.log('currentExerciseDetail', currentExerciseDetail)
    console.log('exercises', exercises)
    console.log('currentExerciseIndex', currentExerciseIndex)

    const finishTraining = useTrainingStore((state) => state.finishTraining)

    const sendTrainingCompletion = () => {
        if (!training?.id) return

        const payload: Parameters<(typeof trainingApi)['completeTraining']>[0] = {
            report_active_time: activeTime,
            report_cals: caloriesBurned,
            report_duration: elapsedTime,
            report_technique_quality: averageFormQuality,
            time: new Date().toISOString(),
            training_id: training.id,
        }

        void trainingApi
            .completeTraining(payload)
            .then((result) => {
                if (result.success) {
                    showToast.success('Тренировка успешно завершена')
                } else {
                    showToast.error(result.error ?? 'Не удалось завершить тренировку')
                }
            })
            .catch((error) => {
                showToast.error(error?.message ?? 'Ошибка завершения тренировки')
            })
    }

    const finishTrainingFlow = () => {
        finishTraining()
        sendTrainingCompletion()
    }

    const resetReps = () => {
        setRepNumber(0)
    }

    const resetExerciseProgress = () => {
        setRepNumber(0)
        setSetNumber(0)
        setCurrentSideState('right')
        setRestType('rep')
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
		currentExerciseDetail ?? (exercises.length > 0 ? exercises[currentExerciseIndex] : null)

    const startExercise = async (
        exercise: (typeof exercises)[number],
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
        if (!currentExercise) {
            return
        }
        resetExerciseProgress()
        void startExercise(currentExercise, entryStep)
    }, [currentExercise?.id, entryStep])

    useEffect(() => {
        if (currentStep === 'rest') {
            setRestPhase('main')
        }
    }, [currentStep])

    if (!currentExercise) return null

    const displayCurrentSet = Math.max(
        1,
        Math.min(setNumber + 1, currentExercise.sets ?? setNumber + 1)
    )

    const isLastExercise = currentExerciseIndex === exercises.length - 1
    const repsPerSide = currentExercise.reps ?? 1
    const setsPerExercise = currentExercise.sets ?? 1
    const requiresSideSwitch = Boolean(
        typeof currentExercise.is_mirror === 'number'
            ? Number(currentExercise.is_mirror)
            : currentExercise.is_mirror
    )

    const handleRotateComplete = () => {
        setCurrentStep(entryStep)
    }

    const handleCountdownComplete = () => {
        setCurrentStep('position')
    }

    const handlePositionComplete = () => {
        setCurrentStep('execution')
    }

    const sendExerciseCompletion = (exercise: ExerciseInfoResponse) => {
        if (!training?.id) return

        const totalSides = exercise.is_mirror ? 2 : 1
        const totalReps = (exercise.reps ?? 0) * (exercise.sets ?? 1) * totalSides

        const payload: ExecuteExerciseInput = {
            id: exercise.id,
            training_id: training.id,
            reps: totalReps,
            quality: 100,
            recorded_errors: [],
        }

        void trainingApi
            .executeExercise(payload)
            .then((result) => {
                if (result.success) {
                    showToast.success('Упражнение отправлено')
                } else {
                    showToast.error(result.error ?? 'Не удалось отправить упражнение')
                }
            })
            .catch((error) => {
                showToast.error(error?.message ?? 'Ошибка отправки упражнения')
            })
    }

    const getPracticeVideoUrl = (exercise: ExerciseInfoResponse) => {
        if (!exercise.is_mirror) {
            return exercise.video_practice
        }
        if (currentSideState === 'left') {
            return exercise.video_practice_second || exercise.video_practice
        }
        return exercise.video_practice
    }

    const handleExecutionComplete = () => {
        if (!currentExercise) {
            return
        }
        // onComplete срабатывает после выполнения нужного количества повторений,
        // поэтому считаем, что текущая сторона завершена полностью
        resetReps()

        if (requiresSideSwitch) {
            const isRightSide = currentSideState === 'right'

            if (isRightSide) {
                setShouldSwitchSide(true)
                setRestType('rep')
                setCurrentStep('rest')
                return
            }

            const newSetNumber = setNumber + 1
            setSetNumber(newSetNumber)
            resetReps()
            setCurrentSideState('right')

            if (newSetNumber < setsPerExercise) {
                setRestType('set')
                setCurrentStep('rest')
            } else {
                sendExerciseCompletion(currentExercise)

                if (isLastExercise) {
                    finishTrainingFlow()
                } else {
                    setRestType('exercise')
                    setCurrentStep('rest')
                }
            }
            return
        }

        const newSetNumber = setNumber + 1
        setSetNumber(newSetNumber)
        resetReps()
        setCurrentSideState('right')

        if (newSetNumber < setsPerExercise) {
            setRestType('set')
            setCurrentStep('rest')
        } else {
            sendExerciseCompletion(currentExercise)

            if (isLastExercise) {
                finishTrainingFlow()
            } else {
                setRestType('exercise')
                setCurrentStep('rest')
            }
        }
    }

    const proceedToNextExercise = async () => {
        const nextIndex = currentExerciseIndex + 1

        if (!exercises[nextIndex]) {
            finishTrainingFlow()
            return
        }
        resetExerciseProgress()
        setCurrentExerciseIndex(nextIndex)
        setCurrentExerciseId(exercises[nextIndex].id)
    }

    const handleRestComplete = () => {
        if (restType === 'rep') {
            if (requiresSideSwitch && shouldSwitchSide) {
                setShouldSwitchSide(false)
                resetReps()
                setCurrentSideState('left')
                setCurrentStep('side_switch')
                return
            }
            setCurrentStep('execution')
            return
        }

        if (restType === 'set') {
            resetReps()
            setCurrentSideState('right')
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
		        ? currentExercise.rest_between_sets ?? 15
		        : currentExercise.rest_after_exercise ?? 30

    const hasPracticePhase = baseRestDuration > 10
    const mainRestDuration = hasPracticePhase ? baseRestDuration - 10 : baseRestDuration

    const handleRestPhaseComplete = () => {
        if (hasPracticePhase && restPhase === 'main') {
            setRestPhase('practice')
            return
        }
        handleRestComplete()
    }

    const handleSideSwitchComplete = () => {
        setCurrentStep('execution')
    }

    const executionKey = `${currentExercise.id}-${setNumber}-${currentSideState}`

    return (
        <View className="flex-1">
            {currentStep === 'rotate' && (
                <RotateScreen
                    isVertical={!currentExercise.is_horizontal}
                    onComplete={handleRotateComplete}
                />
            )}
            {currentStep === 'position' && (
                <BodyPositionScreen
                    isVertical={!currentExercise.is_horizontal}
                    key="position-check"
                    onComplete={handlePositionComplete}
                    model={model}
                    orientation={orientation}
                />
            )}

            {currentStep === 'theory' && (
                <ExerciseTheoryScreen
                    exercise={currentExercise}
                    currentSet={displayCurrentSet}
                    onComplete={handleCountdownComplete}
                    isVertical={!currentExercise.is_horizontal}
                />
            )}

            {currentStep === 'execution' && (
                <ExerciseExecutionScreen
                    key={executionKey}
                    model={model}
                    orientation={orientation}
                    onComplete={handleExecutionComplete}
                    exercise={currentExercise}
                    isVertical={!currentExercise.is_horizontal}
                    practiceVideoUrl={getPracticeVideoUrl(currentExercise)}
                />
            )}
            {/*{currentStep === 'success' && (*/}
            {/*    <ExerciseSuccess onComplete={handleSuccessComplete} />*/}
            {/*)}*/}
            {currentStep === 'side_switch' && (
                <BodyPositionScreen
                    key="side-switch"
                    onComplete={handleSideSwitchComplete}
                    model={model}
                    type="side_switch"
                    orientation={orientation}
                    title="Смена рабочей стороны"
                    titleClassName="mb-2 text-left text-h1 text-brand-green-500"
                    subtitle=""
                    isVertical={!currentExercise.is_horizontal}
                />
            )}
            {currentStep === 'rest' && (
                <>
                    {restPhase === 'main' && (
                        <RestScreen
                            onComplete={handleRestPhaseComplete}
                            duration={mainRestDuration}
                            exercise={currentExercise}
                            currentSet={displayCurrentSet}
                        />
                    )}
                    {restPhase === 'practice' && (
                        <ExerciseTheoryScreen
                            exercise={currentExercise}
                            currentSet={displayCurrentSet}
                            onComplete={handleRestComplete}
                            isVertical
                            videoUrlOverride={getPracticeVideoUrl(currentExercise)}
                            durationOverrideSeconds={10}
                        />
                    )}
                </>
            )}

        </View>
    )
}
