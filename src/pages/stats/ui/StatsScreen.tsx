import React from 'react'
import { View, Text, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BackgroundLayout, BackButton, StatCard, Button } from '@/shared/ui'

/**
 * Stats screen - Экран статистики пользователя
 */
export const StatsScreen = () => {
    const router = useRouter()
    const insets = useSafeAreaInsets()

    return (
        <BackgroundLayout>
            <View className="flex-1" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
                {/* Header */}
                <View className="flex-row items-center justify-between mb-6">
                    <BackButton onPress={() => router.back()} />
                    <Text className="text-h2-medium text-text-primary">Статистика</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Content */}
                <ScrollView 
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Основная статистика */}
                    <View className="mb-6">
                        <Text className="text-h3-medium text-text-primary mb-4">
							Общие показатели
                        </Text>
                        <View className="gap-3">
                            <StatCard 
                                icon="fire" 
                                value="1,234" 
                                label="Калорий сожжено"
                                size="medium"
                            />
                            <StatCard 
                                icon="dumbbell" 
                                value="24" 
                                label="Тренировок"
                                size="medium"
                            />
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

                {/* Bottom Button */}
                <View className="pt-4">
                    <Button 
                        variant="primary" 
                        size="l" 
                        fullWidth
                        onPress={() => router.push('/home')}
                    >
						Продолжить
                    </Button>
                </View>
            </View>
        </BackgroundLayout>
    )
}
