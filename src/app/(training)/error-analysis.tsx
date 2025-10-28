/**
 * Error Analysis Screen (8.0)
 * Показывает детальный анализ ошибок техники по упражнениям
 * ПРИМЕЧАНИЕ: Это MVP версия. Полная реализация требует интеграции с pose detection
 */

import { View, Text, ScrollView } from 'react-native'
import { router } from 'expo-router'
import { Button, Icon, Container, BackButton } from '@/shared/ui'

export default function ErrorAnalysisScreen() {
	// TODO: Get actual error data from training store
	// For MVP, showing placeholder UI

	const handleBack = () => {
		router.back()
	}

	return (
		<View className="bg-background-primary flex-1">
			{/* Header */}
			<View className="px-4 pt-12">
				<BackButton onPress={handleBack} />
			</View>

			<ScrollView showsVerticalScrollIndicator={false}>
				<Container className="py-6">
					{/* Title */}
					<Text className="text-h2-medium text-text-primary mb-6">Анализ техники</Text>

					{/* Placeholder Message */}
					<View className="bg-brand-dark-300 mb-6 rounded-2xl p-6">
						<View className="mb-4 items-center">
							<Icon name="info" size={48} color="#9333EA" />
						</View>
						<Text className="text-body-medium text-text-primary mb-2 text-center">
							Функция в разработке
						</Text>
						<Text className="text-body-regular text-text-secondary text-center">
							Детальный анализ ошибок техники будет доступен в следующей версии
							приложения. Пока вы можете отслеживать общее качество выполнения в отчете о
							тренировке.
						</Text>
					</View>

					{/* Placeholder Error Cards - For UI Preview */}
					<Text className="text-body-medium text-text-primary mb-3">
						Будущие возможности:
					</Text>

					<View className="gap-3">
						{/* Error Card 1 */}
						<View className="bg-brand-dark-300 rounded-2xl p-4">
							<View className="mb-2 flex-row items-center gap-2">
								<Icon name="warning" size={20} color="#FF6B6B" />
								<Text className="text-body-medium text-text-primary">
									Недостаточная глубина приседа
								</Text>
							</View>
							<Text className="text-caption-regular text-text-secondary mb-3">
								Обнаружено в 3 подходах
							</Text>
							<View className="bg-brand-dark-400 rounded-lg p-3">
								<Text className="text-caption-regular mb-1 text-brand-green-500">
									✓ Совет 1
								</Text>
								<Text className="text-caption-regular text-text-secondary">
									Опускайтесь ниже, пока бедра не станут параллельны полу
								</Text>
							</View>
						</View>

						{/* Error Card 2 */}
						<View className="bg-brand-dark-300 rounded-2xl p-4">
							<View className="mb-2 flex-row items-center gap-2">
								<Icon name="info" size={20} color="#FFB74D" />
								<Text className="text-body-medium text-text-primary">
									Несимметричное движение
								</Text>
							</View>
							<Text className="text-caption-regular text-text-secondary mb-3">
								Обнаружено в 1 подходе
							</Text>
							<View className="bg-brand-dark-400 rounded-lg p-3">
								<Text className="text-caption-regular mb-1 text-brand-green-500">
									✓ Совет 1
								</Text>
								<Text className="text-caption-regular text-text-secondary">
									Следите за равномерным распределением веса на обе ноги
								</Text>
							</View>
						</View>
					</View>
				</Container>
			</ScrollView>

			{/* Action Button */}
			<View className="border-brand-dark-300 bg-background-primary border-t p-4">
				<Button onPress={handleBack} variant="primary" className="w-full">
					Понятно
				</Button>
			</View>
		</View>
	)
}
