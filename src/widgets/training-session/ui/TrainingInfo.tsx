import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { router } from "expo-router"
import { Button, Icon, Switch, Container, TrainingTags, ExerciseInfoCard } from '@/shared/ui'
import { useTrainingStore } from "@/entities/training"
import { useState, useMemo } from "react"
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const trainingInfoBanner = require("@/assets/images/training_info_banner.png")

// eslint-disable-next-line @typescript-eslint/no-require-imports
const equipment1 = require("@/assets/images/equipment/1.png")
// eslint-disable-next-line @typescript-eslint/no-require-imports
const equipment2 = require("@/assets/images/equipment/2.png")
// eslint-disable-next-line @typescript-eslint/no-require-imports
const equipment3 = require("@/assets/images/equipment/3.png")
// eslint-disable-next-line @typescript-eslint/no-require-imports
const equipment4 = require("@/assets/images/equipment/4.png")
// eslint-disable-next-line @typescript-eslint/no-require-imports
const equipment5 = require("@/assets/images/equipment/5.png")

const equipmentImages = [equipment1, equipment2, equipment3, equipment4, equipment5]

export const TrainingInfo = () => {
	const insets = useSafeAreaInsets()
	const training = useTrainingStore((state) => state.training)
	const startOnboarding = useTrainingStore((state) => state.startOnboarding)
	const [showTutorial, setShowTutorial] = useState(true)

	// Calculate training duration in minutes
	const trainingDuration = useMemo(() => {
		if (!training?.exercises) return 40
		let totalSeconds = 0
		training.exercises.forEach((exercise) => {
			// Duration per set * number of sets + rest time between sets
			const exerciseTime = exercise.duration * exercise.sets
			const restTime = exercise.rest_time * Math.max(0, exercise.sets - 1)
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

	return ( <Container>
		<View className="bg-background-primary flex-1">
			<ScrollView 
				className="flex-1" 
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: 100 }}
			>
				{/* Banner Image with Close Button */}
				<View className="relative">
					<Image 
						source={trainingInfoBanner} 
						className="w-full"
						resizeMode="cover"
					/>
					{/* Close Button - Top Right */}
					<TouchableOpacity
						onPress={handleClose}
						className="absolute right-4 h-12 w-12 items-center justify-center rounded-2xl bg-black/30"
						style={{ top: insets.top + 12 }}
					>
						<Icon name="close" size={24} color="#FFFFFF" />
					</TouchableOpacity>
				</View>

				{/* Black Block with Text */}
				<View style={{ marginTop: -180 }}>
					{/* Tags */}
                    <View className="bg-black px-6 pt-6 pb-6 rounded-t-2xl rounded-b-2xl">
					<TrainingTags
						icon1={<MaterialCommunityIcons name="clock-time-eight" size={16} color="#FFFFFF" />}
						title1={`${trainingDuration} минут`}
						icon2={<MaterialCommunityIcons name="bow-arrow" size={16} color="#FFFFFF" />}
						title2={`+${experienceGained} опыта`}
						className="mb-4"
					/>

					<Text className="text-h2-medium text-white mb-4">
						{training?.title || 'Подвижность верхнего отдела позвоночника'}
					</Text>
					<Text className="text-body-regular text-white leading-6 mb-6">
						Сделай тест и узнай свой уровень. Камера зафиксирует движения, а ИИ подскажет ошибки и подсчитает повторения. В конце ты получишь свой стартовый уровень и персональные рекомендации для тренировок. Всего несколько минут — и ты готов начать!
					</Text>

					{/* Switch Section */}
					<View className="flex-row items-center justify-between">
						<Text className="text-body-regular text-white">
							Обучение перед упражнением
						</Text>
						<Switch 
							checked={showTutorial}
							onChange={setShowTutorial}
						/>
					</View>
                    </View>
				</View>

				{/* Equipment Section */}
				<View className="bg-black px-6 pt-6 pb-6 rounded-t-2xl rounded-b-2xl">
					<Text className="text-body-medium text-white mb-4">
						Инвентарь
					</Text>
					<ScrollView 
						horizontal 
						showsHorizontalScrollIndicator={false}
						contentContainerStyle={{ gap: 16 }}
					>
						{equipmentImages.map((image, index) => (
							<Image
								key={index}
								source={image}
								className="w-16 h-16"
								resizeMode="contain"
							/>
						))}
					</ScrollView>
				</View>

                <View className="bg-black px-6 pt-6 pb-6 rounded-t-2xl rounded-b-2xl">
                <ExerciseInfoCard
  name="Дыхательное упражнение"
  sets="3 подхода"
  reps="10 повторений"
  isAi={true}
/>

<ExerciseInfoCard
  name="Дыхательное упражнение"
  sets="3 подхода"
  reps="10 повторений"

/>

<ExerciseInfoCard
  name="Дыхательное упражнение"
  sets="3 подхода"
  reps="10 повторений"
  isAi={true}
/>
                </View>
			</ScrollView>

			{/* Start Button - Fixed at Bottom */}
			<View className="absolute bottom-0 left-0 right-0 px-6 bg-background-primary">
				<Button 
					variant="primary" 
					fullWidth 
					onPress={handleStart}
					size="l"
				>
					Начать
				</Button>
			</View>
		</View>
		</Container>
	)
}