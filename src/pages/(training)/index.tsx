import React from 'react'
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BackgroundLayout, Icon, BackButton } from '@/shared/ui'
import { NavigationBar } from '@/widgets/navigation-bar'
import { userApi } from '@/features/user'
import { getUserId } from '@/shared/lib'
import type { TrainingResponse } from '@/shared/api/types'

/**
 * Список тренировок пользователя
 */
export default function TrainingListScreen() {
    const router = useRouter()
    const insets = useSafeAreaInsets()

    // Получаем userId
    const {
        data: userId,
        isLoading: isLoadingUserId,
    } = useQuery({
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
                    <Text className="mt-4 text-body-regular text-text-secondary">
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
                    <Text className="mt-4 text-t2 text-text-primary text-center">
						Ошибка загрузки
                    </Text>
                    <Text className="mt-2 text-body-regular text-text-secondary text-center">
						Не удалось загрузить список тренировок
                    </Text>
                    <TouchableOpacity
                        onPress={() => refetch()}
                        className="mt-6 bg-brand-purple-500 px-6 py-3 rounded-2xl"
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
                <View className="flex-1" >
                    {/* Header */}
                    <View >
                        <BackButton
                            onPress={handleBack}
                            color="#989898"
                            variant="transparent"
                            position="relative"
                        />
                    </View>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 120 }}
                    >
                        {/* Title */}
                        <View className="mb-6">
                            <Text className="font-rimma text-h3 text-white mb-2">
								Ваши тренировки
                            </Text>
                            <Text className="text-body-regular text-text-secondary">
                                {trainings.length} {getTrainingWord(trainings.length)} доступно
                            </Text>
                        </View>

                        {/* Training Cards */}
                        {trainings.length === 0 ? (
                            <View className="items-center justify-center py-20">
                                <Icon name="barbell" size={64} color="rgba(255, 255, 255, 0.1)" />
                                <Text className="mt-4 text-t2 text-text-secondary">
									Тренировок пока нет
                                </Text>
                                <Text className="mt-2 text-body-regular text-text-tertiary text-center">
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

    // Рассчитываем общий прогресс
    const totalProgress = training.activities.reduce((acc, activity) => {
        const activityProgress = activity.progress.reduce((sum, p) => sum + p, 0)
        return acc + activityProgress
    }, 0)

    const totalActivities = training.activities.length
    const completedActivities = training.activities.filter(activity =>
        activity.progress.every(p => p === 1)
    ).length

    return (
        <TouchableOpacity
            onPress={onPress}
            className="bg-fill-800 rounded-3xl p-5 active:opacity-80"
            activeOpacity={0.8}
        >
            <View className="flex-row items-center justify-between mb-4">
                <View className="flex-1">
                    <Text className="font-rimma text-t2 text-white mb-1">
						Тренировка {index + 1}
                    </Text>
                    <Text className="text-caption-regular text-text-secondary">
                        {formattedDate}
                    </Text>
                </View>

                {/* Progress indicator */}
                <View className="flex-row items-center gap-2 bg-fill-600 px-3 py-2 rounded-full">
                    <Icon
                        name={completedActivities === totalActivities ? 'check-circle' : 'clock-time-eight'}
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
                    const isCompleted = activity.progress.every(p => p === 1)

                    return (
                        <View
                            key={activityIndex}
                            className="flex-row items-center gap-3 py-2"
                        >
                            <View
                                className={`w-2 h-2 rounded-full ${
                                    isCompleted ? 'bg-green-500' : 'bg-brand-purple-500'
                                }`}
                            />
                            <Text className="flex-1 text-body-regular text-text-primary">
                                {activity.type}
                            </Text>
                            {isCompleted && (
                                <Icon name="check" size={16} color="#00CF1B" />
                            )}
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
