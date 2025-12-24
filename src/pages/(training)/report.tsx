/**
 * Training Report Screen (7.0)
 * Показывает статистику завершенной тренировки
 * Использует данные из Zustand store
 */

import { View, Text, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { Button, Loader, MetricCard, TrainingTags } from '@/shared/ui'
import { useTrainingStore } from '@/entities/training'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import Fontisto from '@expo/vector-icons/Fontisto'
import { useQuery } from '@tanstack/react-query'
import type { ApiResult } from '@/shared/api'
import { trainingApi } from '@/features/training/api'
import { type TrainingReport } from '@/features/training/api/trainingApi'

export default function TrainingReportScreen() {
	const training = useTrainingStore((state) => state.training)
	const goToAnalytics = useTrainingStore((state) => state.setAnalytics)
	const reset = useTrainingStore((state) => state.reset)


	const { data: trainingReport, isLoading } = useQuery<ApiResult<TrainingReport>, Error>({
		queryKey: ['trainingReport', training?.id],
		queryFn: async () => {
			if (!training?.id) throw new Error('training ID is required')
			return await trainingApi.getTrainingReport(training.id)
		},
		staleTime: 5 * 60 * 1000,
		enabled: !!training?.id,
		retry: false,
	})

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

	if (!training || isLoading) {
		return (
			<Loader />
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
					displayNumber={trainingReport?.data?.report_active_time}
					title={'минут'}
					description={'Активного времени'}
				/>
			</View>

			<View className="w-full flex-1 flex-row gap-2 px-2">
				<View className="flex-1">
					<MetricCard
						icon={<MaterialCommunityIcons name="run-fast" size={24} color="#689F38" />}
						displayNumber={trainingReport?.data?.cals}
						title={'ккал'}
						description={'Каллорий сожжено'}
					/>
				</View>

				<View className="flex-1">
					<MetricCard
						icon={<Fontisto name="fire" size={24} color="#689F38" />}
						displayNumber={trainingReport?.data?.report_technique_quality}
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
