/**
 * Training Entry Screen (1.0a - Новая тренировка, 1.0b - Продолжить тренировку)
 * Точка входа в тренировку, отображает информацию о тренировке
 * Поддерживает возобновление прерванной тренировки
 */

import { View, Text, ScrollView, Image, Switch, ActivityIndicator } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SecureStore from 'expo-secure-store'
import { trainingApi } from '@/entities/training'
import { useTrainingStore } from '@/entities/training'
import { BackButton, Button, InfoTag, Container, Icon } from '@/shared/ui'
import type { SavedWorkoutState, Training } from '@/entities/training/model/types'

// Import image using relative path
// eslint-disable-next-line @typescript-eslint/no-require-imports
const landingPhoto1 = require('../../../assets/images/landing-photo-1.png')

export default function TrainingEntryScreen() {
	const { trainingId } = useLocalSearchParams<{ trainingId: string }>()

	const [showTutorial, setShowTutorial] = useState(true)
	const [savedSession, setSavedSession] = useState<SavedWorkoutState | null>(null)
	const [isCheckingSession, setIsCheckingSession] = useState(true)
	const startTraining = useTrainingStore((state) => state.startTraining)
	const resumeTraining = useTrainingStore((state) => state.resumeTraining)

	// Check if user is authenticated before making API call
	const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

	useEffect(() => {
		const checkAuth = async () => {
			try {
				const token = await SecureStore.getItemAsync('auth_token')
				setIsAuthenticated(!!token)
			} catch (error) {
				setIsAuthenticated(false)
			}
		}
		checkAuth()
	}, [])

	// Fetch training data - only if authenticated
	const {
    data: training,
    isLoading,
    error,
    refetch,
  } = useQuery({
		queryKey: ['training', trainingId],
		queryFn: async () => {
			if (!trainingId) throw new Error('Training ID is required')
			return await trainingApi.getTraining(trainingId)
		},
		enabled: !!trainingId && isAuthenticated === true,
		retry: false,
	})

	// If not authenticated, automatically show demo
	// useEffect(() => {
	// 	if (isAuthenticated === false && trainingId) {
	// 		const demo: Training = {
	// 			trainingId: trainingId,
	// 			title: 'Демо тренировка',
	// 			description: 'Локальная демо-тренировка для теста без сети',
	// 			category: 'mobility',
	// 			experiencePoints: 50,
	// 			inventory: [],
	// 			exercises: [
	// 				{
	// 					id: 'ex_demo_1',
	// 					name: 'Приседания',
	// 					type: 'ai',
	// 					sets: 2,
	// 					reps: 10,
	// 					duration: null,
	// 					restTime: 30,
	// 					videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
	// 					thumbnailUrl: '',
	// 					progress: 0,
	// 				},
	// 			],
	// 		}
	//
	// 		startTraining(demo)
	// 		//router.replace({ pathname: '/(training)/session', params: { trainingId: demo.trainingId } })
	// 	}
	// }, [isAuthenticated, trainingId, startTraining])

	// Check for saved session on mount
	useEffect(() => {
		const checkSavedSession = async () => {
			if (!trainingId) {
				setIsCheckingSession(false)
				return
			}

			try {
				const savedJson = await AsyncStorage.getItem(`training_session_${trainingId}`)
				if (savedJson) {
					const saved = JSON.parse(savedJson) as SavedWorkoutState
					setSavedSession(saved)
				}
			} catch (error) {
				console.error('Failed to load saved session:', error)
			} finally {
				setIsCheckingSession(false)
			}
		}

		checkSavedSession()
	}, [trainingId])

	const handleStart = () => {
		if (!training) return

		if (savedSession) {
			// Resume training from saved state
			startTraining(training)
			resumeTraining(savedSession)
		} else {
			// Start new training
			startTraining(training)
		}

		router.push({
			pathname: '/(training)/session',
			params: { trainingId },
		})
	}

	const handleStartFresh = async () => {
		if (!training || !trainingId) return

		// Clear saved session
		await AsyncStorage.removeItem(`training_session_${trainingId}`)
		setSavedSession(null)

		// Start new training
		startTraining(training)
		router.push({
			pathname: '/(training)/session',
			params: { trainingId },
		})
	}

	if (isLoading || isCheckingSession || isAuthenticated === null) {
		return (
			<View className="bg-background-primary flex-1 items-center justify-center">
				<ActivityIndicator size="large" color="#9333EA" />
			</View>
		)
	}

  if (error || !training) {
    const handleOpenDemo = () => {
      const demo: Training = {
        trainingId: (trainingId as string) || 'demo',
        title: 'Демо тренировка',
        description: 'Локальная демо-тренировка для теста без сети',
        category: 'mobility',
        experiencePoints: 50,
        inventory: [],
        exercises: [
          {
            id: 'ex_demo_1',
            name: 'Приседания',
            type: 'ai',
            sets: 2,
            reps: 10,
            duration: null,
            restTime: 30,
            // Public sample video to avoid web player errors
            videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
            thumbnailUrl: '',
            progress: 0,
          },
        ],
      }

      startTraining(demo)
      router.push({ pathname: '/(training)/session', params: { trainingId: demo.trainingId } })
    }

    return (
      <View className="bg-background-primary flex-1 items-center justify-center px-4">
        <Text className="text-h3-medium text-text-primary mb-2">Ошибка загрузки</Text>
        <Text className="text-body-regular text-text-secondary mb-6 text-center">
          Не удалось загрузить данные тренировки
        </Text>
        <View className="w-full gap-3">
          <Button onPress={() => refetch()} variant="primary" className="w-full">
            Повторить
          </Button>
          <Button onPress={() =>handleOpenDemo()} variant="secondary" className="w-full">
            Открыть демо-тренировку
          </Button>
		  			{/* Survey Button */}
					  <Button
					onPress={() => router.push('/survey')}
					variant="secondary"
					className="mb-3 w-full"
				>
					📋 Пройти опрос
				</Button>

				{/* Training Buttons */}
          <Button onPress={() => router.back()} variant="secondary" className="w-full">
            Назад
          </Button>
        </View>
      </View>
    )
	}

	// Calculate duration in minutes
	const duration = Math.round(
		training.exercises.reduce((sum, ex) => {
			const exerciseTime = ex.duration || (ex.reps || 0) * 3 // Estimate 3 sec per rep
			const restTotal = ex.restTime * (ex.sets - 1)
			return sum + exerciseTime * ex.sets + restTotal
		}, 0) / 60
	)

	return (
		<View className="bg-background-primary flex-1">
			<ScrollView showsVerticalScrollIndicator={false}>
				{/* Hero Header with Background Image */}
				<View className="relative h-[280px]">
					{/* Background Image with Gradient Overlay */}
					<Image source={landingPhoto1} className="h-full w-full" resizeMode="cover" />
					<View className="to-background-primary absolute inset-0 bg-gradient-to-b from-transparent" />

					{/* Back Button */}
					<View className="absolute left-4 top-12">
						<BackButton onPress={() => router.back()} />
					</View>

					{/* Tags */}
					<View className="absolute bottom-6 left-4 flex-row gap-2">
						<InfoTag label={`${duration} мин`} icon="clock" />
						<InfoTag
							label={`${training.experiencePoints} опыта`}
							icon="star"
							variant="accent"
						/>
					</View>
				</View>

				<Container className="py-6">
					{/* Title */}
					<Text className="text-h2-medium text-text-primary mb-3">{training.title}</Text>

					{/* Description */}
					<Text className="text-body-regular text-text-secondary mb-6">
						{training.description}
					</Text>

					{/* Tutorial Toggle */}
					<View className="mb-6 flex-row items-center justify-between py-4">
						<Text className="text-body-medium text-text-primary">
							Обучение перед упражнениями
						</Text>
						<Switch
							value={showTutorial}
							onValueChange={setShowTutorial}
							trackColor={{ false: '#374151', true: '#9333EA' }}
							thumbColor="#FFFFFF"
						/>
					</View>

					{/* Inventory Section */}
					{training.inventory.length > 0 && (
						<View className="mb-6">
							<Text className="text-body-medium text-text-primary mb-3">Инвентарь</Text>
							<ScrollView
								horizontal
								showsHorizontalScrollIndicator={false}
								className="flex-row gap-3"
							>
								{training.inventory.map((item) => (
									<View
										key={item.id}
										className="bg-brand-dark-200 h-20 w-20 items-center justify-center rounded-2xl"
									>
										<View className="bg-brand-dark-300 h-12 w-12 rounded-lg" />
										<Text className="text-caption-regular text-text-secondary mt-1 text-center">
											{item.name}
										</Text>
									</View>
								))}
							</ScrollView>
						</View>
					)}

					{/* Exercises List */}
					<View className="mb-6">
						<Text className="text-body-medium text-text-primary mb-3">
							{training.exercises.length} упражнений
						</Text>
						{training.exercises.map((exercise, index) => {
							const isCompleted = savedSession?.completedExercises.includes(index)

							return (
								<View
									key={exercise.id}
									className="border-brand-dark-300 mb-3 flex-row items-center gap-4 border-b pb-3"
								>
									{/* Thumbnail */}
									<View className="bg-brand-dark-300 h-16 w-16 rounded-2xl" />

									{/* Exercise Info */}
									<View className="flex-1">
										<View className="mb-2 flex-row items-center gap-2">
											<Text className="text-body-medium text-text-primary">
												{exercise.name}
											</Text>
											{isCompleted && (
												<Icon name="check-circle" size={16} color="#00CF1B" />
											)}
										</View>
										<View className="flex-row gap-2">
											<InfoTag label={`${exercise.sets} подхода`} variant="default" />
											<InfoTag
												label={`${exercise.reps || exercise.duration} ${exercise.reps ? 'повт.' : 'сек'}`}
												variant="default"
											/>
											{exercise.type === 'ai' && (
												<InfoTag label="AI-анализ" variant="accent" />
											)}
										</View>
									</View>
								</View>
							)
						})}
					</View>
				</Container>
			</ScrollView>

			{/* Action Buttons */}
			<View className="border-brand-dark-300 bg-background-primary border-t p-4">
				{savedSession ? (
					<>
						<Button onPress={handleStart} variant="primary" className="mb-3 w-full">
							{`Продолжить с «${training.exercises[savedSession.currentExerciseIndex]?.name || 'упражнения'}»`}
						</Button>
						<Button onPress={handleStartFresh} variant="secondary" className="w-full">
							Начать сначала
						</Button>
					</>
				) : (
					<Button onPress={handleStart} variant="primary" className="w-full">
						Начать
					</Button>
				)}
			</View>
		</View>
	)
}