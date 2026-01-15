/**
 * Exercise Success Screen (5.3)
 * Показывает мотивационное сообщение после завершения упражнения
 */

import { View, Text, useWindowDimensions } from 'react-native'
import React, { useState } from 'react'

import { Button, CircularText } from '@/shared/ui'
import { sharedStyles } from '@/shared/ui/styles/shared-styles'
import { Image as RNImage } from 'react-native'
import landingPhoto1 from 'src/assets/images/girl_success_screen.png'
import { useTrainingStore } from '@/entities/training'


const motivationalMessages = [
	'Так держать!',
	'Вы отлично справились!',
	'Прекрасно!',
	'Молодец!',
	'Великолепно!',
	'Продолжай!',
]

export function ExerciseSuccess() {
	const reportTraining = useTrainingStore((state) => state.reportTraining)

	const { width: screenWidth, height: screenHeight } = useWindowDimensions()

	const [displayMessage] = useState(
		() => motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]
	)

	const handleGoToReportPage = () => {
		reportTraining()
	}

	return (
		<View className="padding-4 flex-1 items-center justify-between gap-10 pb-5 pt-20">
			<View className="flex items-start gap-10">
				<Text style={sharedStyles.titleCenter}>{displayMessage}</Text>

				<Text className="text-h2 text-light-text-200">Давайте посмотрим отчёт</Text>

				<View
					className="absolute top-40 h-[500] w-[100%]"
					style={{ left: -screenWidth * 0.1 }}
				>
					{/* Декоративные элементы - круговой текст (позади изображения) */}
					<View className="absolute right-0 top-[22%] h-[54%] w-[108%]">
						<CircularText
							text="fit choice fit choice fit choice fit choice fit choice fit choice fit choice fit choice fit choice fit choice"
							width={screenWidth * 0.828}
							height={screenHeight * 0.192}
							centerX={screenWidth * 0.75}
							centerY={screenHeight * 0.13}
							fontSize={screenWidth * 0.0468}
							fill="#FFFFFF"
							startOffset="0%"
							fontWeight="300"
							letterSpacing="-3%"
							rotation={-17.05}
							debug={false}
						/>
					</View>

					{/* Основная фотокарточка */}
					<RNImage source={landingPhoto1} className="h-full w-full" resizeMode="cover" />

					{/* Слой 2: Текст перед изображением (только нижняя часть с маской) */}
					<View className="absolute right-0 top-[22%] h-[54%] w-[108%]">
						<CircularText
							text="fit choice fit choice fit choice fit choice fit choice fit choice fit choice fit choice fit choice fit choice"
							width={screenWidth * 0.828}
							height={screenHeight * 0.192}
							centerX={screenWidth * 0.75}
							centerY={screenHeight * 0.13}
							fontSize={screenWidth * 0.0468}
							fill="#FFFFFF"
							startOffset="0%"
							fontWeight="300"
							letterSpacing="-3%"
							rotation={-17.05}
							debug={false}
							maskRect={{
								x: screenWidth * 0.2,
								y: screenHeight * 0.13,
								width: screenWidth * 1.1,
								height: screenHeight * 0.15,
							}}
						/>
					</View>
				</View>
			</View>

			<Button variant="primary" onPress={handleGoToReportPage} className="w-full">
				Далее
			</Button>
		</View>
	)
}
