/**
 * ExerciseFlow widget
 * Управляет flow выполнения упражнений
 * Включает countdown, body position check, exercise execution, rest, transitions
 */

import { useState } from 'react'
import { View } from 'react-native'
import { ExerciseExampleCountdownScreen } from './exercise/ExerciseExampleCountdownScreen'
import { BodyPositionScreen } from './exercise/BodyPositionScreen'
import { ExerciseSuccessScreen } from './exercise/ExerciseSuccessScreen'
import { RestScreen } from './exercise/RestScreen'
import { ExerciseTransitionScreen } from './exercise/ExerciseTransitionScreen'
import { useTrainingStore } from '@/entities/training'
import {
	TimerExerciseScreen
} from '@/widgets/training-session/ui/exercise/TimerExerciseScreen'
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
	const [currentSideState, setCurrentSideState] = useState<'left' | 'right'>('right')


	const training = useTrainingStore((state) => state.training)
	const currentExerciseIndex = useTrainingStore((state) => state.currentExerciseIndex)
	const currentSet = useTrainingStore((state) => state.currentSet)
	const nextExercise = useTrainingStore((state) => state.nextExercise)
	const stop = useTrainingStore((state) => state.stop)
	
	const [repNumber, setRepNumber] = useState(0)
	const [setNumber, setSetNumber] = useState(0)


	if (!training) return null


	const currentExercise = training.exercises[currentExerciseIndex]
	////currentExercise {"duration": 5, "id": 0, "isAi": false, "isVertical": true,
	// "name": "Бёрпи", "progress": 15, "reps": 2, "rest_time": 10, "sets": 3, "side": "single",
	// "videoUrl": "https://media.istockphoto.com/id/1215790847/ru/%D0%B2%D0%B8%D0%B4%D0%B5%D0%BE/%D1%81%D0%BF%D0%BE%D1%80%D1%82%D1%81%D0%BC%D0%B5%D0%BD%D0%BA%D0%B0-%D0%B2%D1%8B%D1%81%D1%82%D1%83%D0%BF%D0%B0%D1%8F-burpees-%D0%B8-%D0%BF%D1%80%D0%B5%D1%81%D1%81-ups.mp4?s=mp4-640x640-is&k=20&c=GvRVrCP2Et2qv3v3NC7iArJhImaY2xEE3OKntdPvSFw="}
	/////currentSet 0
	if (!currentExercise) return null


	// Check if exercise has sides
	const hasSides = currentExercise?.side === 'both'

	console.log('hasSides')
	console.log(hasSides)

	const handleCountdownComplete = () => {
			setCurrentStep('position')
	}

	const handlePositionComplete = () => {
		setCurrentStep('execution')
	}



	const handleExecutionComplete = () => {
		if (currentExercise.side === 'single') {
			// Для single: reps = 1 set
			const newRepNumber = repNumber + 1
			setRepNumber(newRepNumber)
			
			if (newRepNumber < currentExercise.reps) {
				// Еще есть повторения в текущем сете - продолжаем выполнение
				setCurrentStep('execution')
			} else {
				// Завершили все повторения в сете
				const newSetNumber = setNumber + 1
				setSetNumber(newSetNumber)
				setRepNumber(0) // Сбрасываем счетчик повторений для следующего сета
				
				if (newSetNumber < currentExercise.sets) {
					// Есть еще сеты - сразу начинаем следующий сет без countdown
					setCurrentStep('position')
				} else {
					// Завершили все сеты упражнения
					const isLastExercise = currentExerciseIndex === training.exercises.length - 1
					if (isLastExercise) {
						setCurrentStep('success')
					} else {
						// Показываем отдых после завершения упражнения
						setCurrentStep('rest')
					}
				}
			}
		} else if (currentExercise.side === 'both') {
			// Для both: reps на одну сторону + reps на другую = 1 set
			const newRepNumber = repNumber + 1
			setRepNumber(newRepNumber)
			
			if (newRepNumber < currentExercise.reps) {
				// Еще есть повторения на текущей стороне - продолжаем выполнение
				setCurrentStep('execution')
			} else {
				// Завершили все повторения на текущей стороне
				// Проверяем, нужно ли переключать сторону
				if (currentSideState === 'right') {
					// Переключаемся на левую сторону
					setRepNumber(0)
					setCurrentSideState('left')
					setCurrentStep('side_switch')
				} else {
					// Завершили обе стороны - сет завершен
					const newSetNumber = setNumber + 1
					setSetNumber(newSetNumber)
					setRepNumber(0) // Сбрасываем счетчик повторений для следующего сета
					setCurrentSideState('right') // Сбрасываем на начальную сторону для следующего сета
					
					if (newSetNumber < currentExercise.sets) {
						// Есть еще сеты - сразу начинаем следующий сет без countdown
						setCurrentStep('position')
					} else {
						// Завершили все сеты упражнения
						const isLastExercise = currentExerciseIndex === training.exercises.length - 1
						if (isLastExercise) {
							setCurrentStep('success')
						} else {
							// Показываем отдых после завершения упражнения
							setCurrentStep('rest')
						}
					}
				}
			}
		}
	}

	const handleRestComplete = () => {
		// После отдыха переходим к следующему упражнению через transition
		setCurrentStep('transition')
	}

	const handleSuccessComplete = () => {
		// Завершение тренировки - можно перейти на экран результатов
		// или вызвать stop()
		stop()
	}

	const handleSideSwitchComplete = () => {
		// После переключения стороны продолжаем выполнение на новой стороне
	//	setCurrentSideState('left')
		setCurrentStep('execution')
	}

	const handleTransitionComplete = () => {
		// Переход к следующему упражнению
		nextExercise()
		// Сбрасываем счетчики для нового упражнения
		setRepNumber(0)
		setSetNumber(0)
		setCurrentSideState('right')
		setCurrentStep('countdown')
	}



	const nextExerciseData = training.exercises[currentExerciseIndex + 1]

	return (<Container>
		<View className="flex-1">
			{currentStep === 'countdown' && (
				<ExerciseExampleCountdownScreen
					exercise={currentExercise}
					currentSet={currentSet}
					onComplete={handleCountdownComplete}
			
				/>
			)}
		{currentStep === 'position' && (
			<BodyPositionScreen
				key="position-check"
				onComplete={handlePositionComplete}
				side={currentSideState}
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
				key="side-switch"
				onComplete={handleSideSwitchComplete}
				title={'Смена рабочей стороны'}
			//	side={hasSides ? currentSideState : undefined}
			/>

				// <SideSwitchScreen
				// 	nextSide={currentSideState === null ? 'left' : 'right'}
				// 	onComplete={handleSideSwitchComplete}
				// />
			)}
			{currentStep === 'rest' && 
			<RestScreen onComplete={handleRestComplete} duration={currentExercise.rest_time} />}

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
