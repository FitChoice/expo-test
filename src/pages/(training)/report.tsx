/**
 * Training Report Screen (7.0)
 * Показывает статистику завершенной тренировки
 * Использует данные из Zustand store
 */

import { View, Text, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { Button, MetricCard, TrainingTags } from '@/shared/ui'
import { useTrainingStore } from '@/entities/training'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import Fontisto from '@expo/vector-icons/Fontisto'

export default function TrainingReportScreen() {
	const training = useTrainingStore((state) => state.training)
	const elapsedTime = useTrainingStore((state) => state.elapsedTime)
	const activeTime = useTrainingStore((state) => state.activeTime)
	const caloriesBurned = useTrainingStore((state) => state.caloriesBurned)
	const averageFormQuality = useTrainingStore((state) => state.averageFormQuality)
	const totalReps = useTrainingStore((state) => state.totalReps)
	const completedExercises = useTrainingStore((state) => state.completedExercises)
	const goToAnalytics = useTrainingStore((state) => state.setAnalytics)
	const reset = useTrainingStore((state) => state.reset)

	// Format time in minutes
	const formatMinutes = (seconds: number) => {
		return `${Math.floor(seconds / 60)} мин`
	}

	// Format date as DD.MM.YYYY
	const formatDate = (date: Date) => {
		const day = String(date.getDate()).padStart(2, '0')
		const month = String(date.getMonth() + 1).padStart(2, '0')
		const year = date.getFullYear()
		return `${day}.${month}.${year}`
	}

	// Calculate experience points based on workout
	const experienceGained = training?.experience || 0

	const handleFinish = () => {
		// Reset training store
		reset()
		// Navigate to home
		router.replace('/home')
	}

	if (!training) {
		return (
			<View className="bg-background-primary flex-1 items-center justify-center">
				<Text className="text-text-primary">Loading...</Text>
			</View>
		)
	}

	return (
		<View className="flex-1">
			{/* Training Header Block */}
			<View className="w-full flex-row items-center bg-transparent px-4 py-10">
				{/* Icon Circle */}
				<View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-purple-500">
					<MaterialCommunityIcons name="dumbbell" size={24} color="#FFFFFF" />
				</View>

				{/* Content */}
				<View className="flex-1">
					<Text className="mb-2 text-t2 text-white">
						{training.title || 'Силовая тренировка'}
					</Text>

					{/* Tags */}
					<TrainingTags
						icon1={null}
						title1={formatDate(new Date())}
						icon2={<MaterialCommunityIcons name="bow-arrow" size={16} color="#FFFFFF" />}
						title2={`+${experienceGained} опыта`}
					/>
				</View>

				{/* Close Button */}
				<TouchableOpacity
					className="ml-3 h-10 w-10 items-center justify-center rounded-lg bg-green-800/30"
					onPress={handleFinish}
				>
					<MaterialCommunityIcons name="close" size={20} color="#FFFFFF" />
				</TouchableOpacity>
			</View>

			<View className="h-[250px] w-full p-2">
				<MetricCard
					icon={
						<MaterialCommunityIcons name="clock-time-eight" size={24} color="#689F38" />
					}
					displayNumber={10}
					title={'минут'}
					description={'Активного времени'}
				/>
			</View>

			<View className="w-full flex-1 flex-row gap-2 px-2">
				<View className="flex-1">
					<MetricCard
						icon={<MaterialCommunityIcons name="run-fast" size={24} color="#689F38" />}
						displayNumber={130}
						title={'ккал'}
						description={'Каллорий сожжено'}
					/>
				</View>

				<View className="flex-1">
					<MetricCard
						icon={<Fontisto name="fire" size={24} color="#689F38" />}
						displayNumber={80}
						title={'%'}
						description={'Читстота техники'}
					/>
				</View>
			</View>

			{/* Button at bottom */}
			<View className="flex-row gap-2 py-2 pb-20">
				<Button variant="tertiary" onPress={handleFinish} className="flex-1">
					Закрыть
				</Button>
				<Button variant="primary" onPress={goToAnalytics} className="flex-1">
					Анализ ошибок
				</Button>
			</View>
		</View>
	)
}
