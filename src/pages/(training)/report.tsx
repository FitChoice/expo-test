/**
 * Training Report Screen (7.0)
 * Показывает статистику завершенной тренировки
 * Использует данные из Zustand store
 */

import { View, Text, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { Button, Icon, Loader, MetricCard, TrainingTags } from '@/shared/ui'
import { useTrainingStore } from '@/entities/training'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import Fontisto from '@expo/vector-icons/Fontisto'
import { useQuery } from '@tanstack/react-query'
import type { ApiResult } from '@/shared/api'
import { trainingApi } from '@/features/training/api'
import { type TrainingReport } from '@/features/training/api/trainingApi'
import { useEffect } from 'react'
import { showToast } from '@/shared/lib'

export default function TrainingReportScreen() {
	const training = useTrainingStore((state) => state.training)
	const goToAnalytics = useTrainingStore((state) => state.setAnalytics)
	const reset = useTrainingStore((state) => state.reset)


	useEffect(() => {
		showToast.success('Все ли вам понравилось?', 'Пожалуйста, оцените качество тренировки, это поможет нам развиваться', 'headset')
	}, [])


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
					<View className="mr-5 h-16 w-16 items-center justify-center rounded-full bg-[#A172FF]">
						<Icon name="dumbbell" size={24} color="#FFFFFF" />
					</View>

					{/* Content */}
					<View className="flex-1">
						<Text className="mb-2 text-t2-bold text-white">
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
						className="ml-3 p-3 items-center justify-center rounded-2xl bg-[#F4F4F4]/20"
						onPress={handleFinish}
					>
						<MaterialCommunityIcons name="close" size={20} color="#FFFFFF" />
					</TouchableOpacity>
				</View>

				<View className="h-[170px] w-full p-2">
					<MetricCard
						icon={
							<MaterialCommunityIcons name="clock-time-eight" size={24} color="#AAEC4D" />
						}
						displayNumber={trainingReport?.data.report_duration}
						title={'минут'}
						description={'Длительность тренировки'}
					/>
				</View>

				<View className="w-full flex-1 flex-row gap-2 px-2">
					<View className="flex-1">
						<MetricCard
							icon={<MaterialCommunityIcons name="run-fast" size={24} color="#AAEC4D" />}
							displayNumber={trainingReport?.data.report_active_time}
							title={'минуты'}
							description={'Активного времени'}
						/>
					</View>

					<View className="flex-1">
						<MetricCard
							icon={<Fontisto name="fire" size={24} color="#AAEC4D" />}
							displayNumber={trainingReport?.data.report_calories}
							title={'ккал'}
							description={'Сожжено калорий'}
						/>
					</View>
				</View>
			{
				trainingReport?.data.report_technique_quality  ?
				<View className="h-[170px] w-full p-2">
					<MetricCard
						icon={<Fontisto name="fire" size={24} color="#AAEC4D" />}
						displayNumber={trainingReport?.data.report_technique_quality}
						title={'%'}
						description={'Читстота техники'}
					/>
				</View> : <></>
			}

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
