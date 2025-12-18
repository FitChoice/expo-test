/**
 * Training Entry Screen (1.0a - Новая тренировка, 1.0b - Продолжить тренировку)
 * Точка входа в тренировку, отображает информацию о тренировке
 * Поддерживает возобновление прерванной тренировки
 */
import { useLocalSearchParams } from 'expo-router'
import { Text } from 'react-native'
import { usePoseCameraSetup } from '@/widgets/pose-camera'
import { Loader } from '@/shared/ui/Loader/Loader'
import { TrainingInfo } from '@/widgets/training-session/ui/TrainingInfo'
import { BackgroundLayoutNoSidePadding } from '@/shared/ui'
import { ExerciseFlow, OnboardingFlow } from '@/widgets/training-session'
import { ExerciseSuccess } from '@/widgets/training-session/ui/ExerciseSuccess'
import TrainingReportScreen from '@/pages/(training)/report'
import { TrainingAnalytics } from '@/widgets/training-session/ui/TrainingAnalytics'
import { useEffect, useState } from 'react'
import { trainingApi, trainingKeys } from '@/features/training/api'
import { useQuery } from '@tanstack/react-query'
import { type ExerciseInfoResponse, useTrainingStore } from '@/entities/training'
import {
	useCompleteTrainingMutation,
	useExecuteExerciseMutation,
} from '@/features/training-session'

export default function TrainingEntryScreen() {
	const { trainingId } = useLocalSearchParams<{ trainingId: string }>()

	const [exerciseIsLoading, setExerciseIsLoading] = useState(false)

	const {
		data: trainingData,
		isLoading,
		isError,
		error: queryError,
	} = useQuery({
		queryKey: trainingKeys.detail(Number(trainingId)),
		queryFn: () => trainingApi.getTrainingInfo(Number(trainingId)),
		enabled: !!trainingId,
		select: (result) => {
			if (!result.success) throw new Error(result.error)
			return result.data
		},
	})

	const startTraining = useTrainingStore((state) => state.startTraining)
	const resetTraining = useTrainingStore((state) => state.reset)
	const training = useTrainingStore((state) => state.training)
	const setExerciseDetails = useTrainingStore((state) => state.setExerciseDetails)
	const setExerciseDetail = useTrainingStore((state) => state.setExerciseDetail)
	// const setExerciseLoading = useTrainingStore((state) => state.setExerciseLoading)

	const status = useTrainingStore((state) => state.status)
	const { tfReady, model, orientation, error } = usePoseCameraSetup()
	const executeExercise = useExecuteExerciseMutation()
	const completeTraining = useCompleteTrainingMutation()

	// Reset local training state when the route id changes to avoid showing stale session
	useEffect(() => {
		if (!trainingId) return

		const numericId = Number(trainingId)
		if (Number.isNaN(numericId)) return

		if (training?.id && training.id !== numericId) {
			resetTraining()
		}
	}, [resetTraining, training?.id, trainingId])

	// Initialize training store when data is fetched
	useEffect(() => {
		if (trainingData && training?.id !== trainingData.id) {
			startTraining(trainingData)
		}
	}, [trainingData, training?.id, startTraining])

	useEffect(() => {
		if (!training?.id || !training.exercises?.length) return

		let isCancelled = false

		const { exercises, id } = training

		const loadExercises = async () => {
			setExerciseIsLoading(true)

			try {
				const responses = await Promise.all(
					exercises.map((exercise) =>
						trainingApi.getExerciseInfo(String(id), exercise.id)
					)
				)

				if (isCancelled) return

				const successfulExercises = responses
					.filter(
						(response): response is { success: true; data: ExerciseInfoResponse } =>
							response.success
					)
					.map((response) => response.data)

				setExerciseDetails(successfulExercises)

				if (!successfulExercises.length) {
					return
				}

				const firstExercise = successfulExercises[0]
				if (!firstExercise) {
					return
				}
				const nextExerciseId =
					exercises.find((exercise) => exercise.progress === 0)?.id ?? firstExercise.id

				const nextExerciseDetail: ExerciseInfoResponse =
					successfulExercises.find((exercise) => exercise.id === nextExerciseId) ??
					firstExercise

				setExerciseDetail(nextExerciseDetail)
			} finally {
				if (!isCancelled) {
					setExerciseIsLoading(false)
				}
			}
		}

		loadExercises()

		return () => {
			isCancelled = true
		}
	}, [setExerciseDetail, setExerciseDetails, training?.exercises, training?.id])

	// If training data is not loaded or camera is not ready, show loading
	if (isLoading || !training || !tfReady || !model || !orientation || exerciseIsLoading) {
		return (
			<>
				{error ? <Text>{error.message}</Text> : null}
				{isError ? <Text>Error loading training: {queryError?.message}</Text> : null}
				{!error && !isError && <Loader text="Загрузка тренировки..." />}
			</>
		)
	}

	const mainContent = () => {
		//   Render based on current status
		switch (status) {
			case 'info':
				return <TrainingInfo />
			case 'onboarding':
				return (
					<BackgroundLayoutNoSidePadding>
						<OnboardingFlow />
					</BackgroundLayoutNoSidePadding>
				)

			case 'finished':
				return (
					<BackgroundLayoutNoSidePadding>
						<ExerciseSuccess />
					</BackgroundLayoutNoSidePadding>
				)

			case 'report':
				return (
					<BackgroundLayoutNoSidePadding>
						<TrainingReportScreen />
					</BackgroundLayoutNoSidePadding>
				)

			case 'analytics':
				return (
					<BackgroundLayoutNoSidePadding>
						<TrainingAnalytics />
					</BackgroundLayoutNoSidePadding>
				)

			default:
				return (
					<ExerciseFlow
						model={model}
						orientation={orientation}
						onExecuteExercise={executeExercise.mutateAsync}
						onCompleteTraining={completeTraining.mutateAsync}
					/>
				)
		}
	}

	return mainContent()
}
