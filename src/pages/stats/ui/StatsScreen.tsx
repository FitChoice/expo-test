import React from 'react'
import { View, Text, ScrollView } from 'react-native'
import { BackgroundLayout, StatCard } from '@/shared/ui'
import { NavigationBar } from '@/widgets/navigation-bar'
import { useNavbarLayout } from '@/shared/lib'

/**
 * Stats screen - Экран статистики пользователя
 * Основной таб навигации
 */
export const StatsScreen = () => {
    const { contentPaddingBottom } = useNavbarLayout()

    return (
        <BackgroundLayout>
            <View className="flex-1">
                {/* Header */}
                <View className="mb-6 pt-4">
                    <Text className="text-h2-medium text-text-primary text-center">
                        Статистика
                    </Text>
                </View>

                {/* Content */}
                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: contentPaddingBottom }}
                >
                    {/* Основная статистика */}
                    <View className="mb-6">
                        <Text className="text-h3-medium text-text-primary mb-4">
                            Общие показатели
                        </Text>
                        <View className="gap-3">
                            <StatCard icon="fire" value="1,234" label="Калорий сожжено" size="medium" />
                            <StatCard icon="dumbbell" value="24" label="Тренировок" size="medium" />
                            <StatCard
                                icon="clock"
                                value="12ч 30мин"
                                label="Общее время"
                                size="medium"
                            />
                        </View>
                    </View>

                    {/* Дополнительная информация */}
                    <View className="mb-6">
                        <Text className="text-body-regular text-text-secondary text-center">
                            Продолжайте тренироваться для достижения лучших результатов
                        </Text>
                    </View>
                </ScrollView>

                <NavigationBar />
            </View>
        </BackgroundLayout>
    )
}
