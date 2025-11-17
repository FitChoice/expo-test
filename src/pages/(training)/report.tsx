/**
 * Training Report Screen (7.0)
 * Показывает статистику завершенной тренировки
 * Использует данные из Zustand store
 */

import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { Button, StatCard, Icon, Container, MetricCard, TrainingTags } from '@/shared/ui'
import { useTrainingStore } from '@/entities/training'
import { GradientBg } from '@/shared/ui/GradientBG'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Fontisto from '@expo/vector-icons/Fontisto';



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
		router.replace('/')
	}

	if (!training) {
		return (
			<View className="bg-background-primary flex-1 items-center justify-center">
				<Text className="text-text-primary">Loading...</Text>
			</View>
		)
	}

	return ( <Container>

		    <GradientBg />

			{/* Training Header Block */}
			<View className="w-full flex-row items-center px-4 py-10 bg-transparent">
				{/* Icon Circle */}
				<View className="h-12 w-12 rounded-full bg-purple-500 items-center justify-center mr-3">
					<MaterialCommunityIcons name="dumbbell" size={24} color="#FFFFFF" />
				</View>

				{/* Content */}
				<View className="flex-1">
					<Text className="text-white text-t2 mb-2">
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
					className="h-10 w-10 rounded-lg bg-green-800/30 items-center justify-center ml-3"
					onPress={handleFinish}
				>
					<MaterialCommunityIcons name="close" size={20} color="#FFFFFF" />
				</TouchableOpacity>
			</View>

			<View className="w-full h-[250px] p-2">
			<MetricCard
				icon={<MaterialCommunityIcons name="clock-time-eight" size={24} color="#689F38" />}
			displayNumber={20}
			title={'минут'}
			description={'Длительность тренировки'}

			/>
			</View>

			<View className='flex-row flex-1 w-full px-2 gap-2'>

			<View className='flex-1' >
			<MetricCard
				icon={<MaterialCommunityIcons name="run-fast" size={24} color="#689F38"  />}
			displayNumber={20}
			title={'минут'}
			description={'Длительность тренировки'}

			/>
			</View>

			<View className='flex-1' >
			<MetricCard
				icon={<Fontisto name="fire" size={24} color="#689F38"  />}
			displayNumber={20}
			title={'минут'}
			description={'Длительность тренировки'}

			/>
			</View>

			</View>

		{/* Button at bottom */}
		<View className=" flex-row gap-2 py-2">
			<Button variant="tertiary"  className="flex-1" >
				Закрыть
			</Button>
			<Button variant="primary"  className="flex-1" >
				Анализ ошибок
			</Button>
		</View>

		</Container>
	)
}
