import { View, Text, ScrollView } from 'react-native'
import React from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { CloseBtn } from '@/shared/ui/CloseBtn'
import { SafeAreaContainer } from '@/shared/ui/SafeAreaContainer'
import { Button } from '@/shared/ui/Button'
import { Icon } from '@/shared/ui'
import { dairyApi } from '@/features/dairy/api'
import { Loader } from '@/shared/ui/Loader/Loader'
import { formatTime } from '@/shared/lib/formatters'

import Emo1 from '@/assets/images/moods/emo1.svg'
import Emo2 from '@/assets/images/moods/emo2.svg'
import Emo3 from '@/assets/images/moods/emo3.svg'
import Emo4 from '@/assets/images/moods/emo4.svg'
import Emo5 from '@/assets/images/moods/emo5.svg'

const ratingOptions = [
    { id: 1, Icon: Emo1, color: '#FF4B6E' },
    { id: 2, Icon: Emo2, color: '#FF69B4' },
    { id: 3, Icon: Emo3, color: '#FFB800' },
    { id: 4, Icon: Emo4, color: '#6B7280' },
    { id: 5, Icon: Emo5, color: '#10B981' },
]

export const DiaryCompletedScreen = () => {
    const router = useRouter()
    const { id: scheduleId, date } = useLocalSearchParams()

    const { data: diaryResult, isLoading } = useQuery({
        queryKey: ['diary', scheduleId],
        queryFn: async () => {
            if (!scheduleId) throw new Error('Schedule ID required')
            return await dairyApi.getDiary(Number(scheduleId))
        },
        enabled: !!scheduleId,
    })

    const diary = diaryResult?.success ? diaryResult.data : undefined

    if (isLoading) {
        return <Loader text="Загрузка дневника..." />
    }

    if (!diary) {
        return (
            <View className="flex-1 bg-black items-center justify-center">
                <Text className="text-white mb-4">Дневник не найден</Text>
                <Button variant="secondary" onPress={() => router.back()}>Назад</Button>
            </View>
        )
    }

    const getIconForValue = (value: number) => {
        const option = ratingOptions.find((o) => o.id === value)
        return option ? { Icon: option.Icon, color: option.color } : { Icon: Emo3, color: '#FFB800' }
    }

    const renderStatItem = (label: string, value: number) => {
        const { Icon, color } = getIconForValue(value)
        return (
            <View className="flex-row items-center bg-[#1E1E1E] rounded-[30px] p-4 mb-3 h-[80px]">
                <View
                    style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        backgroundColor: '#3f3f3f',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 16,
                    }}
                >
                    <Icon width={32} height={32} />
                </View>
                <Text className="text-white text-lg font-semibold">{label}</Text>
            </View>
        )
    }

    return (
        <View className="flex-1 bg-black">
            <SafeAreaContainer style={{ flex: 1, paddingHorizontal: 14 }}>
                {/* Header */}
                <View className="flex-row justify-between items-start pt-6 pb-6">
                    <View className="flex-row items-center gap-3">
                        <View
                            style={{
                                width: 48,
                                height: 48,
                                borderRadius: 24,
                                backgroundColor: '#A172FF',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Icon name="diary" size={24} color="#FFFFFF" />
                        </View>
                        <View>
                            <Text className="text-white text-lg font-bold">Запись в дневнике</Text>
                            {date ? (
                                <View className="bg-[#2E2E2E] px-3 py-1 rounded-full self-start mt-1">
                                    <Text className="text-[#949494] text-xs">{String(date)}</Text>
                                </View>
                            ) : null}
                        </View>
                    </View>
                    <CloseBtn classNames="rounded-2xl" handlePress={() => router.back()} />
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                    {renderStatItem('Настроение', diary.diary_mood)}
                    {renderStatItem('Самочувствие', diary.diary_wellbeing)}
                    {renderStatItem('Уровень энергии', diary.diary_energy_level)}
                    {renderStatItem('Качество сна', diary.diary_sleep_quality)}

                    <View className="flex-row gap-3 mb-4 mt-2">
                        <View className="flex-1 bg-[#1E1E1E] rounded-[24px] p-5 items-center justify-between flex-row">
                            <Text className="text-white font-semibold">Засыпание</Text>
                            <Text className="text-[#949494]">{formatTime(diary.diary_sleep_time)}</Text>
                        </View>
                        <View className="flex-1 bg-[#1E1E1E] rounded-[24px] p-5 items-center justify-between flex-row">
                            <Text className="text-white font-semibold">Пробуждение</Text>
                            <Text className="text-[#949494]">{formatTime(diary.diary_wake_time)}</Text>
                        </View>
                    </View>

                    <View className="bg-[#1E1E1E] rounded-[24px] p-5 mb-4 min-h-[120px]">
                        <Text className="text-[#949494]">{diary.diary_note || 'Нет заметки'}</Text>
                    </View>
                </ScrollView>

                <View className="absolute bottom-10 left-4 right-4">
                    <Button variant="tertiary" size="l" fullWidth onPress={() => router.back()}>
                        Закрыть
                    </Button>
                </View>
            </SafeAreaContainer>
        </View>
    )
}

