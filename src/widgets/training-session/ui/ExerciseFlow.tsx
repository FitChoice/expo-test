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
    const entryStep: ExerciseStep = showTutorial ? 'theory' : 'position'
    const [currentStep, setCurrentStep] = useState<ExerciseStep>(entryStep)
    const [currentSideState, setCurrentSideState] = useState<'left' | 'right'>('right')
    const [restType, setRestType] = useState<'rep' | 'set' | 'exercise'>('rep')
    const [restPhase, setRestPhase] = useState<'main' | 'practice'>('main')
    const [repNumber, setRepNumber] = useState(0)
    const [setNumber, setSetNumber] = useState(0)
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
    const [shouldSwitchSide, setShouldSwitchSide] = useState(false)

    const finishTraining = useTrainingStore((state) => state.finishTraining)
    const exerciseDetails = [
        {
            duration: 0,
            id: 0,
            is_ai: false,
            is_horizontal: false,
            is_mirror: false,
            layout: 'стоя',
            name: 'Приседания 1',
            progress: 0,
            reps: 2,
            rest_after_exercise: 20,
            rest_between_sets: 20,
            sets: 2,
            error_codes: [],
            video_practice: 'https://storage.yandexcloud.net/fitdb/trainings/0001%20-%20%D0%BF%D1%80%D0%B0%D0%BA%D1%82%D0%B8%D0%BA%D0%B0.mp4',
            video_practice_second: '',
            video_theory: 'https://storage.yandexcloud.net/fitdb/trainings/0001%20-%20%D1%82%D0%B5%D0%BE%D1%80%D0%B8%D1%8F.mp4',
            working_side: '-',
            working_side_second: '',
        },
        {
            duration: 0,
            id: 1,
            is_ai: false,
            is_horizontal: false,
            is_mirror: true,
            layout: 'стоя',
            name: 'Приседания 2',
            progress: 0,
            reps: 2,
            rest_after_exercise: 20,
            rest_between_sets: 20,
            sets: 2,
            error_codes: [],
            video_practice: 'https://storage.yandexcloud.net/fitdb/trainings/0001%20-%20%D0%BF%D1%80%D0%B0%D0%BA%D1%82%D0%B8%D0%BA%D0%B0.mp4',
            video_practice_second: '',
            video_theory: 'https://storage.yandexcloud.net/fitdb/trainings/0001%20-%20%D1%82%D0%B5%D0%BE%D1%80%D0%B8%D1%8F.mp4',
            working_side: '-',
            working_side_second: '',
        },
    ]
    const exercises = exerciseDetails
    const currentExercise = exercises[currentExerciseIndex]

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

            if (needsRotate || exercise.is_horizontal) {
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
        setRepNumber(0)
        setSetNumber(0)
        setCurrentSideState('right')
        setRestType('rep')
        setRestPhase('main')
        setShouldSwitchSide(false)
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
    const requiresSideSwitch = Boolean(currentExercise.is_mirror)

    const handleRotateComplete = () => {
        setCurrentStep(currentExercise.is_horizontal ? 'position' : entryStep)
    }

    const handleCountdownComplete = () => {
        setCurrentStep('position')
    }

    const handlePositionComplete = () => {
        setCurrentStep('execution')
    }

    const handleExecutionComplete = () => {
        const newRepNumber = repNumber + 1
        setRepNumber(newRepNumber)

        if (requiresSideSwitch) {
            const finishedSide = newRepNumber >= repsPerSide

            if (!finishedSide) {
                setRestType('rep')
                setCurrentStep('rest')
                return
            }

            if (currentSideState === 'right') {
                setShouldSwitchSide(true)
                setRestType('rep')
                setCurrentStep('rest')
                return
            }

            const newSetNumber = setNumber + 1
            setSetNumber(newSetNumber)
            setRepNumber(0)
            setCurrentSideState('right')

            if (newSetNumber < setsPerExercise) {
                setRestType('set')
                setCurrentStep('rest')
            } else {
                if (isLastExercise) {
                    finishTraining()
                } else {
                    setRestType('exercise')
                    setCurrentStep('rest')
                }
            }
            return
        }

        const finishedReps = newRepNumber >= repsPerSide

        if (!finishedReps) {
            setRestType('rep')
            setCurrentStep('rest')
            return
        }

        const newSetNumber = setNumber + 1
        setSetNumber(newSetNumber)
        setRepNumber(0)

        if (newSetNumber < setsPerExercise) {
            setRestType('set')
            setCurrentStep('rest')
        } else {
            if (isLastExercise) {
                finishTraining()
            } else {
                setRestType('exercise')
                setCurrentStep('rest')
            }
        }
    }

    const proceedToNextExercise = async () => {
        const nextIndex = currentExerciseIndex + 1

        if (!exercises[nextIndex]) {
            finishTraining()
            return
        }
        setCurrentExerciseIndex(nextIndex)
    }

    const handleRestComplete = () => {
        if (restType === 'rep') {
            if (requiresSideSwitch && shouldSwitchSide) {
                setShouldSwitchSide(false)
                setRepNumber(0)
                setCurrentSideState('left')
                setCurrentStep('side_switch')
                return
            }
            setCurrentStep('execution')
            return
        }

        if (restType === 'set') {
            setRepNumber(0)
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
                    model={model}
                    orientation={orientation}
                    onComplete={handleExecutionComplete}
                    exercise={currentExercise}
                    isVertical={!currentExercise.is_horizontal}
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
                    isVertical={true}
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
                            videoUrlOverride={currentExercise.video_practice}
                            durationOverrideSeconds={10}
                        />
                    )}
                </>
            )}

        </View>
    )
}
