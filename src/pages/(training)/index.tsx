import React from 'react'
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { BackgroundLayout, Icon, BackButton } from '@/shared/ui'
import { NavigationBar } from '@/widgets/navigation-bar'
import { userApi } from '@/features/user'
import { getUserId, useNavbarLayout } from '@/shared/lib'
import type { TrainingResponse } from '@/shared/api/types'

/**
 * Список тренировок пользователя
 */
export default function TrainingListScreen() {
	const router = useRouter()
	const { contentPaddingBottom } = useNavbarLayout()

	// Получаем userId
	const { data: userId, isLoading: isLoadingUserId } = useQuery({
		queryKey: ['userId'],
		queryFn: getUserId,
		staleTime: Infinity,
	})

	// Получаем список тренировок
	const {
		data: trainingsResult,
		isLoading: isLoadingTrainings,
		error,
		refetch,
	} = useQuery({
		queryKey: ['training-program', userId],
		queryFn: async () => {
			if (!userId) throw new Error('User ID not found')
			return await userApi.getTrainingProgram(String(userId))
		},
		enabled: !!userId,
	})

	const isLoading = isLoadingUserId || isLoadingTrainings
	const trainings = trainingsResult?.data || []

	const handleTrainingPress = (trainingId: number) => {
		router.push(`/(training)/${trainingId}`)
	}

	const handleBack = () => {
		router.back()
	}

	if (isLoading) {
		return (
			<BackgroundLayout>
				<View className="flex-1 items-center justify-center">
					<ActivityIndicator size="large" color="#A172FF" />
					<Text className="text-body-regular text-text-secondary mt-4">
						Загружаем ваши тренировки...
					</Text>
				</View>
			</BackgroundLayout>
		)
	}

	if (error) {
		return (
			<BackgroundLayout>
				<View className="flex-1 items-center justify-center px-6">
					<Icon name="alert-circle" size={48} color="#FF4444" />
					<Text className="text-text-primary mt-4 text-center text-t2">
						Ошибка загрузки
					</Text>
					<Text className="text-body-regular text-text-secondary mt-2 text-center">
						Не удалось загрузить список тренировок
					</Text>
					<TouchableOpacity
						onPress={() => refetch()}
						className="mt-6 rounded-2xl bg-brand-purple-500 px-6 py-3"
					>
						<Text className="text-body-medium text-white">Попробовать снова</Text>
					</TouchableOpacity>
				</View>
			</BackgroundLayout>
		)
	}

	return (
		<View className="flex-1 bg-[#151515]">
			<BackgroundLayout>
				<View className="flex-1">
					{/* Header */}
					<View>
						<BackButton
							onPress={handleBack}
							color="#989898"
							variant="transparent"
							position="relative"
						/>
					</View>

					<ScrollView
						showsVerticalScrollIndicator={false}
						contentContainerStyle={{ paddingBottom: contentPaddingBottom }}
					>
						{/* Title */}
						<View className="mb-6">
							<Text className="text-h3 mb-2 font-rimma text-white">Ваши тренировки</Text>
							<Text className="text-body-regular text-text-secondary">
								{trainings.length} {getTrainingWord(trainings.length)} доступно
							</Text>
						</View>

						{/* Training Cards */}
						{trainings.length === 0 ? (
							<View className="items-center justify-center py-20">
								<Icon name="barbell" size={64} color="rgba(255, 255, 255, 0.1)" />
								<Text className="text-text-secondary mt-4 text-t2">
									Тренировок пока нет
								</Text>
								<Text className="text-body-regular text-text-tertiary mt-2 text-center">
									Завершите опрос, чтобы получить{'\n'}персональный план тренировок
								</Text>
							</View>
						) : (
							<View className="gap-4">
								{trainings.map((training, index) => (
									<TrainingCard
										key={training.id}
										training={training}
										index={index}
										onPress={() => handleTrainingPress(training.id)}
									/>
								))}
							</View>
						)}
					</ScrollView>

					{/* Navigation Bar */}
					<NavigationBar />
				</View>
			</BackgroundLayout>
		</View>
	)
}

/**
 * Карточка тренировки
 */
interface TrainingCardProps {
	training: TrainingResponse
	index: number
	onPress: () => void
}

const TrainingCard: React.FC<TrainingCardProps> = ({ training, index, onPress }) => {
	const date = new Date(training.date)
	const formattedDate = date.toLocaleDateString('ru-RU', {
		day: 'numeric',
		month: 'long',
	})

	const totalActivities = training.activities.length
	const completedActivities = training.activities.filter((activity) =>
		activity.progress.every((p) => p === 1)
	).length

	return (
		<TouchableOpacity
			onPress={onPress}
			className="rounded-3xl bg-fill-800 p-5 active:opacity-80"
			activeOpacity={0.8}
		>
			<View className="mb-4 flex-row items-center justify-between">
				<View className="flex-1">
					<Text className="mb-1 font-rimma text-t2 text-white">
						Тренировка {index + 1}
					</Text>
					<Text className="text-caption-regular text-text-secondary">
						{formattedDate}
					</Text>
				</View>

				{/* Progress indicator */}
				<View className="bg-fill-600 flex-row items-center gap-2 rounded-full px-3 py-2">
					<Icon
						name={
							completedActivities === totalActivities
								? 'check-circle'
								: 'clock-time-eight'
						}
						size={16}
						color={completedActivities === totalActivities ? '#00CF1B' : '#A172FF'}
					/>
					<Text className="text-caption-medium text-white">
						{completedActivities}/{totalActivities}
					</Text>
				</View>
			</View>

			{/* Activities */}
			<View className="gap-2">
				{training.activities.map((activity, activityIndex) => {
					const isCompleted = activity.progress.every((p) => p === 1)

					return (
						<View key={activityIndex} className="flex-row items-center gap-3 py-2">
							<View
								className={`h-2 w-2 rounded-full ${
									isCompleted ? 'bg-green-500' : 'bg-brand-purple-500'
								}`}
							/>
							<Text className="text-body-regular text-text-primary flex-1">
								{activity.type}
							</Text>
							{isCompleted && <Icon name="check" size={16} color="#00CF1B" />}
						</View>
					)
				})}
			</View>

			{/* Arrow */}
			<View className="absolute right-5 top-1/2 -translate-y-3">
				<Icon name="chevron-right" size={24} color="#6E6E6E" />
			</View>
		</TouchableOpacity>
	)
}

/**
 * Склонение слова "тренировка"
 */
function getTrainingWord(count: number): string {
	const lastDigit = count % 10
	const lastTwoDigits = count % 100

	if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
		return 'тренировок'
	}

	if (lastDigit === 1) {
		return 'тренировка'
	}

	if (lastDigit >= 2 && lastDigit <= 4) {
		return 'тренировки'
	}

	return 'тренировок'
}
