import {
	View,
	Text,
	Image,
	ScrollView,
	TouchableOpacity,
	StyleSheet,
	useWindowDimensions,
} from 'react-native'
import { router } from 'expo-router'
import { Switch, TrainingTags, ExerciseInfoCard } from '@/shared/ui'
import { useTrainingStore } from '@/entities/training'
import React, { useEffect, useMemo } from 'react'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import Entypo from '@expo/vector-icons/Entypo'
import { BottomActionBtn } from '@/shared/ui/BottomActionBtn/BottomActionBtn'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { GradientBg } from '@/shared/ui/GradientBG'

 
const trainingInfoBanner = require('@/assets/images/training_info_banner.png')

// Динамический импорт картинок оборудования
const equipmentImages = [
	require('@/assets/images/equipment/1.png'),
	require('@/assets/images/equipment/2.png'),
	require('@/assets/images/equipment/3.png'),
	require('@/assets/images/equipment/4.png'),
	require('@/assets/images/equipment/5.png'),
	require('@/assets/images/equipment/6.png'),
	require('@/assets/images/equipment/7.png'),
	require('@/assets/images/equipment/8.png'),
	require('@/assets/images/equipment/9.png'),
	require('@/assets/images/equipment/10.png'),
	require('@/assets/images/equipment/11.png'),
]

export const TrainingInfo = () => {
	const insets = useSafeAreaInsets()
	const { width: SCREEN_WIDTH } = useWindowDimensions()

	const training = useTrainingStore((state) => state.training)
	const startOnboarding = useTrainingStore((state) => state.startOnboarding)
	const showTutorial = useTrainingStore((state) => state.showTutorial)
	const setShowTutorial = useTrainingStore((state) => state.setShowTutorial)
	const setCurrentExerciseId = useTrainingStore((state) => state.setCurrentExerciseId)

	useEffect(() => {
		if (training?.exercises) {
			const firstExerciseId = training?.exercises?.find(
				(exercise) => exercise.progress == 0
			).id as number
			setCurrentExerciseId(firstExerciseId)
		}
	}, [training?.exercises])
	// Calculate training duration in minutes
	const trainingDuration = useMemo(() => {
		if (!training?.exercises) return 40
		let totalSeconds = 0
		training.exercises.forEach((exercise) => {
			// Duration per set * number of sets + rest time between sets
			const duration = 60 // Default to 60s if missing
			const rest = 30 // Default to 30s if missing
			const exerciseTime = duration * exercise.sets
			const restTime = rest * Math.max(0, exercise.sets - 1)
			totalSeconds += exerciseTime + restTime
		})
		return Math.ceil(totalSeconds / 60)
	}, [training])

	const experienceGained = training?.experience || 0

	const handleClose = () => {
		router.back()
	}

	const handleStart = () => {
		startOnboarding()
	}
	return (
		<View className="flex-1">
			<View style={[styles.gradientContainer, { width: SCREEN_WIDTH }]}>
				<GradientBg />
			</View>
			<ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
				{/* Banner Image with Close Button */}

				<View className="relative">
					<Image source={trainingInfoBanner} className="w-full" resizeMode="cover" />
					{/* Close Button - Top Right */}
					<TouchableOpacity
						onPress={handleClose}
						style={{ top: insets.top }}
						className="absolute right-4 h-12 w-12 items-center justify-center rounded-2xl bg-white/30"
					>
						<Entypo name="cross" size={24} color="white" />
					</TouchableOpacity>
				</View>

				{/* Black Block with Text */}
				<View style={{ marginTop: -180 }}>
					{/* Tags */}
					<View className="mb-2 rounded-3xl bg-black px-6 pb-6 pt-6">
						<TrainingTags
							icon1={
								<MaterialCommunityIcons
									name="clock-time-eight"
									size={16}
									color="#FFFFFF"
								/>
							}
							title1={`${trainingDuration} минут`}
							icon2={
								<MaterialCommunityIcons name="bow-arrow" size={16} color="#FFFFFF" />
							}
							title2={`+${experienceGained} опыта`}
							className="mb-4"
						/>
						<Text className="mb-4 text-h2 text-white">
							{training?.title || 'Подвижность верхнего отдела позвоночника'}
						</Text>
						<Text className="mb-6 text-t2 leading-6 text-light-text-500">
							{training?.description ||
								'Сделай тест и узнай свой уровень. Камера зафиксирует движения, а ИИ подскажет ошибки и подсчитает повторения. В конце ты получишь свой стартовый уровень и персональные рекомендации для тренировок. Всего несколько минут — и ты готов начать!'}
						</Text>

						{/* Switch Section */}
						<View className="flex-row items-center justify-between">
							<Text className="text-t3 text-white">Обучение перед упражнением</Text>
							<Switch checked={showTutorial} onChange={setShowTutorial} />
						</View>
					</View>
				</View>

				{/* Equipment Section */}
				<View className="mb-2 rounded-3xl bg-black px-6 pb-6 pt-6">
					<Text className="mb-4 text-t1.1 text-white">Инвентарь</Text>
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						contentContainerStyle={{ gap: 16 }}
					>
						{training?.inventory.map((image, index) => (
							<Image
								key={index}
								source={equipmentImages[image]}
								className="h-16 w-16"
								resizeMode="contain"
							/>
						))}
					</ScrollView>
				</View>

				<View className="rounded-3xl bg-black px-6 pb-20 pt-6">
					<Text className="mb-4 text-t1.1 text-white">
						{training?.exercises.length} упражнения
					</Text>

					{training?.exercises.map((exercise) => (
						<ExerciseInfoCard key={exercise.id} exercise={exercise} />
					))}
				</View>
			</ScrollView>

			{/* Start Button - Fixed at Bottom */}

			<BottomActionBtn handleClickBottomBtn={handleStart} title={'Начать'} />
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		position: 'relative', // Для позиционирования элементов
		zIndex: 3, // Поверх браслета и заголовка
		overflow: 'hidden', // Для корректного отображения градиента
	},
	gradientContainer: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
	},
	contentContainer: {
		flex: 1,
		paddingHorizontal: 14,
	},
})
