/**
 * Training Report Screen (7.0)
 * Показывает статистику завершенной тренировки
 * Использует данные из Zustand store
 */

import { View, Text, ScrollView } from 'react-native'
import { router } from 'expo-router'
import { Button, StatCard, Icon, Container } from '@/shared/ui'
import { useTrainingStore } from '@/entities/training'

export default function TrainingReportScreen() {
	const training = useTrainingStore((state) => state.training)
	const elapsedTime = useTrainingStore((state) => state.elapsedTime)
	const activeTime = useTrainingStore((state) => state.activeTime)
	const caloriesBurned = useTrainingStore((state) => state.caloriesBurned)
	const averageFormQuality = useTrainingStore((state) => state.averageFormQuality)
	const totalReps = useTrainingStore((state) => state.totalReps)
	const completedExercises = useTrainingStore((state) => state.completedExercises)
	const reset = useTrainingStore((state) => state.reset)

	// Format time in minutes
	const formatMinutes = (seconds: number) => {
		return `${Math.floor(seconds / 60)} мин`
	}

	// Calculate experience points based on workout
	const experienceGained = training?.experiencePoints || 0

	const handleFinish = () => {
		// Reset training store
		reset()
		// Navigate to home
		router.replace('/')
	}

	if (!training) {
		return (
			<View className="bg-background-primary flex-1 items-center justify-center">
				<Text className="text-text-primary">Loading...</Text>
			</View>
		)
	}

	return (
		<View className="bg-background-primary flex-1">
			<ScrollView showsVerticalScrollIndicator={false}>
				{/* Header */}
				<View className="bg-gradient-to-b from-brand-purple-500/20 to-transparent px-4 pb-8 pt-12">
					<View className="mb-6 items-center">
						<View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-brand-green-500">
							<Icon name="check-circle" size={32} color="#000000" />
						</View>
						<Text className="text-h2-medium text-text-primary mb-2 text-center">
							Отличная работа!
						</Text>
						<Text className="text-body-regular text-text-secondary text-center">
							Тренировка завершена
						</Text>
					</View>

					{/* Main Stats */}
					<View className="flex-row gap-3">
						<View className="flex-1">
							<StatCard
								icon="clock"
								value={formatMinutes(elapsedTime)}
								label="Общее время"
								size="medium"
							/>
						</View>
						<View className="flex-1">
							<StatCard
								icon="star"
								value={`+${experienceGained}`}
								label="Опыт"
								size="medium"
							/>
						</View>
					</View>
				</View>

				<Container className="py-6">
					{/* Additional Stats Grid */}
					<View className="mb-6 gap-3">
						<View className="flex-row gap-3">
							<View className="flex-1">
								<StatCard
									icon="fire"
									value={`${caloriesBurned}`}
									label="Калории"
									size="small"
								/>
							</View>
							<View className="flex-1">
								<StatCard
									icon="activity"
									value={formatMinutes(activeTime)}
									label="Активное время"
									size="small"
								/>
							</View>
						</View>
						<View className="flex-row gap-3">
							<View className="flex-1">
								<StatCard
									icon="repeat"
									value={totalReps}
									label="Повторений"
									size="small"
								/>
							</View>
							<View className="flex-1">
								<StatCard
									icon="target"
									value={`${Math.round(averageFormQuality)}%`}
									label="Качество"
									size="small"
								/>
							</View>
						</View>
					</View>

					{/* Training Info */}
					<View className="bg-brand-dark-300 mb-6 rounded-2xl p-4">
						<Text className="text-body-medium text-text-primary mb-2">
							{training.title}
						</Text>
						<Text className="text-caption-regular text-text-secondary mb-3">
							{training.description}
						</Text>
						<Text className="text-caption-regular text-text-secondary">
							Выполнено {completedExercises.length} из {training.exercises.length}{' '}
							упражнений
						</Text>
					</View>
				</Container>
			</ScrollView>

			{/* Action Button */}
			<View className="border-brand-dark-300 bg-background-primary border-t p-4">
				<Button onPress={handleFinish} variant="primary" className="w-full">
					Завершить
				</Button>
			</View>
		</View>
	)
}
