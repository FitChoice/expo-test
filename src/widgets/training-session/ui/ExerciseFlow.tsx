/**
 * ExerciseFlow widget
 * Управляет flow выполнения упражнений
 * Включает countdown, body position check, exercise execution, rest, transitions
 */

import { useState, useEffect } from 'react'
import { View } from 'react-native'
import * as ScreenOrientation from 'expo-screen-orientation'
import type * as posedetection from '@tensorflow-models/pose-detection'
import { BodyPositionScreen } from './exercise/BodyPositionScreen'
import { RestScreen } from './exercise/RestScreen'
import { ExerciseTransitionScreen } from './exercise/ExerciseTransitionScreen'
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
	| 'transition'
	| 'rotate'

type ExerciseFlowProps = {
	model: posedetection.PoseDetector
	orientation: ScreenOrientation.Orientation
}

export function ExerciseFlow({ model, orientation }: ExerciseFlowProps) {
    useKeepAwake()
    const showTutorial = useTrainingStore((state) => state.showTutorial)
    const [currentStep, setCurrentStep] = useState<ExerciseStep>(showTutorial ? 'theory' : 'position')
    const [currentSideState, setCurrentSideState] = useState<'left' | 'right'>('right')
    const [restType, setRestType] = useState<'rep' | 'set' | 'exercise'>('rep')

    const training = useTrainingStore((state) => state.training)

    const nextExercise = useTrainingStore((state) => state.nextExercise)
    const finishTraining = useTrainingStore((state) => state.finishTraining)
    const exerciseDetails = useTrainingStore((state) => state.exerciseDetails)
    const currentExercise = useTrainingStore((state) => state.currentExerciseDetail)
    const [repNumber, setRepNumber] = useState(0)
    const [setNumber, setSetNumber] = useState(0)

    // Проверяем ориентацию при изменении упражнения или при первом запуске
    useEffect(() => {
        if (currentStep === 'theory' && currentExercise) {
            const checkOrientation = async () => {
                try {
                    const orientation = await ScreenOrientation.getOrientationAsync()
                    const isPortrait =
						orientation === ScreenOrientation.Orientation.PORTRAIT_UP ||
						orientation === ScreenOrientation.Orientation.PORTRAIT_DOWN
                    const isLandscape =
						orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
						orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT

                    const exerciseIsVertical = !currentExercise?.is_horizontal

                    // Если ориентация не соответствует упражнению, показываем rotate экран
                    if (
                        (exerciseIsVertical && !isPortrait) ||
						(!exerciseIsVertical && !isLandscape)
                    ) {
                        setCurrentStep('rotate')
                    }
                } catch (err) {
                    console.warn('Error checking orientation:', err)
                }
            }
            checkOrientation()
        }
    }, [ currentStep, currentExercise])

    if (!training) return null

    const currentExerciseIndex = training.exercises.findIndex((exercise) => exercise.id === currentExercise?.id)

    // const currentExercise = training.exercises[currentExerciseIndex]
    // const isVertical = currentExercise?.isVertical

    if (!currentExercise) return null

    // UI expects 1-based set number; internal state stays 0-based for calculations
    const displayCurrentSet = Math.max(1, Math.min(setNumber + 1, currentExercise.sets ?? setNumber + 1))

    // Check if exercise has sides
    // const hasSides = currentExercise?.side === 'both'

    const handleRotateComplete = () => {
        setCurrentStep('theory')
    }

    const handleCountdownComplete = () => {
        setCurrentStep('position')
    }

    const handlePositionComplete = () => {
        setCurrentStep('execution')
    }

    const handleExecutionComplete = () => {

        if (!currentExercise.is_mirror) {
            // Для single: reps = 1 set
            const newRepNumber = repNumber + 1
            setRepNumber(newRepNumber)

            if (newRepNumber < currentExercise.reps) {
                // Еще есть повторения в текущем сете - показываем отдых после rep (10 сек)
                setRestType('rep')
                setCurrentStep('rest')
            } else {
                // Завершили все повторения в сете
                const newSetNumber = setNumber + 1
                setSetNumber(newSetNumber)

                if (newSetNumber < currentExercise.sets) {
                    // Есть еще сеты - показываем отдых после set (15 сек)
                    setRestType('set')
                    setCurrentStep('rest')
                } else {
                    // Завершили все сеты упражнения
                    const isLastExercise = currentExerciseIndex === training.exercises.length - 1
                    if (isLastExercise) {
                        //  setCurrentStep('finished')
                        finishTraining()
                    } else {
                        // Показываем отдых после завершения упражнения
                        setRestType('exercise')
                        setCurrentStep('rest')
                    }
                }
            }
        } else  {
            // Для both: reps на одну сторону + reps на другую = 1 set
            const newRepNumber = repNumber + 1
            setRepNumber(newRepNumber)

            if (newRepNumber < currentExercise.reps) {
                // Еще есть повторения на текущей стороне - показываем отдых после rep (10 сек)
                setRestType('rep')
                setCurrentStep('rest')
            } else {
                // Завершили все повторения на текущей стороне
                // Проверяем, нужно ли переключать сторону
                if (currentSideState === 'right') {
                    // Переключаемся на левую сторону - показываем отдых после rep перед переключением
                    setRestType('rep')
                    setCurrentStep('rest')
                } else {
                    // Завершили все повторения на левой стороне - показываем отдых после rep перед завершением сета
                    setRestType('rep')
                    setCurrentStep('rest')
                }
            }
        }
    }

    const handleRestComplete = () => {

        if (restType === 'rep') {
            // После отдыха после rep продолжаем выполнение или переключаем сторону/завершаем сет
            if (
                currentExercise.is_mirror  &&
                currentSideState === 'right' &&
                repNumber >= currentExercise.reps
            ) {
                // Завершили все reps на правой стороне - переключаемся на левую
                setRepNumber(0)
                setCurrentSideState('left')
                setCurrentStep('side_switch')
            } else if (
                currentExercise.is_mirror &&
                currentSideState === 'left' &&
                repNumber >= currentExercise.reps
            ) {
                // Завершили все reps на левой стороне - завершаем сет
                const newSetNumber = setNumber + 1
                setSetNumber(newSetNumber)
                setRepNumber(0)
                setCurrentSideState('right')

                if (newSetNumber < currentExercise.sets) {
                    // Есть еще сеты - показываем отдых после set (15 сек)
                    setRestType('set')
                    setCurrentStep('rest')
                } else {
                    // Завершили все сеты упражнения
                    const isLastExercise = currentExerciseIndex === training.exercises.length - 1
                    if (isLastExercise) {
                        // setCurrentStep('success')
                        finishTraining()
                    } else {
                        // Показываем отдых после завершения упражнения
                        setRestType('exercise')
                        setCurrentStep('rest')
                    }
                }
            } else {
                // Продолжаем выполнение
                setCurrentStep('execution')
            }
        } else if (restType === 'set') {
            // После отдыха после set начинаем следующий сет
            setRepNumber(0) // Сбрасываем счетчик повторений для следующего сета
            setCurrentStep('position')
        } else if (restType === 'exercise') {
            // После отдыха после упражнения переходим к следующему упражнению через transition
            setCurrentStep('transition')
        }
    }

    const handleSideSwitchComplete = () => {
        // После переключения стороны продолжаем выполнение на новой стороне
        //	setCurrentSideState('left')
        setCurrentStep('execution')
    }

    const handleTransitionComplete = async () => {
        // Получаем данные следующего упражнения до вызова nextExercise()
        const nextExerciseData = training.exercises[currentExerciseIndex + 1]
        const nextExerciseDetail = exerciseDetails.find((exercise) => exercise.id === nextExerciseData?.id)

        // Переход к следующему упражнению
        nextExercise()
        // Сбрасываем счетчики для нового упражнения
        setRepNumber(0)
        setSetNumber(0)
        setCurrentSideState('right')
        setRestType('rep')

        // Проверяем ориентацию перед началом следующего упражнения
        if (nextExerciseDetail) {
            const nextIsVertical = !nextExerciseDetail.is_horizontal
            try {
                const orientation = await ScreenOrientation.getOrientationAsync()
                const isPortrait =
					orientation === ScreenOrientation.Orientation.PORTRAIT_UP ||
					orientation === ScreenOrientation.Orientation.PORTRAIT_DOWN
                const isLandscape =
					orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
					orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT

                // Если ориентация не соответствует следующему упражнению, показываем rotate экран
                if ((nextIsVertical && !isPortrait) || (!nextIsVertical && !isLandscape)) {
                    setCurrentStep('rotate')
                } else {
                    setCurrentStep('theory')
                }
            } catch (err) {
                console.warn('Error checking orientation:', err)
                setCurrentStep('theory')
            }
        } else {
            setCurrentStep('theory')
        }
    }

    const nextExerciseData = training.exercises[currentExerciseIndex + 1]

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
                    //side={hasSides ? currentSideState : undefined}
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
                    isVertical={true}//{!currentExercise.is_horizontal}
                />
            )}

            {/*{currentStep === 'execution' && currentExercise.isAi && (*/}
            {/*	<AIExerciseScreen*/}
            {/*		onComplete={handleExecutionComplete}*/}

            {/*	/>*/}
            {/*)}*/}
            {currentStep === 'execution' && (
                <ExerciseExecutionScreen
                    model={model}
                    orientation={orientation}
                    onComplete={handleExecutionComplete}
                    exercise={currentExercise}
                    isVertical={!currentExercise.is_horizontal}
                    currentSet={displayCurrentSet}
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
                    orientation={orientation}
                />

            // <SideSwitchScreen
            // 	nextSide={currentSideState === null ? 'left' : 'right'}
            // 	onComplete={handleSideSwitchComplete}
            // />
            )}
            {currentStep === 'rest' && (
                <RestScreen
                    onComplete={handleRestComplete}
                    duration={
                        restType === 'rep' ? 10 : restType === 'set' ? currentExercise.rest_between_sets : (currentExercise.rest_after_exercise || 30)
                    }
                />
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
