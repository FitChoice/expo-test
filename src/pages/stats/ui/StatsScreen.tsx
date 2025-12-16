import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'

import { BackgroundLayoutNoSidePadding, Loader } from '@/shared/ui'
import { NavigationBar } from '@/widgets/navigation-bar'
import { useNavbarLayout, useStatusBar } from '@/shared/lib'
import { DayStatistic } from '@/pages/stats/ui/DayStatistic'
import { CalendarStatistic } from '@/pages/stats/ui/CalendarStatistic'

type TabKey = 'stats' | 'calendar'

const tabs: { key: TabKey; label: string }[] = [
    { key: 'stats', label: 'Статистика' },
    { key: 'calendar', label: 'Календарь' },
]

const Tabs = ({ value, onChange }: { value: TabKey; onChange: (tab: TabKey) => void }) => (
    <View className="mb-6 flex-row items-center rounded-full bg-brand-dark-400 p-1">
        {tabs.map(({ key, label }) => {
            const isActive = value === key
            return (
                <TouchableOpacity
                    key={key}
                    className={`flex-1 rounded-full px-4 py-3 ${
                        isActive ? 'bg-[#3f3f3f]' : '#1e1e1e'
                    }`}
                    activeOpacity={0.9}
                    onPress={() => onChange(key)}
                >
                    <Text
                        className={`text-center ${
                            isActive ? 'text-body-semibold text-white' : 'text-body-medium text-light-text-500'
                        }`}
                    >
                        {label}
                    </Text>
                </TouchableOpacity>
            )
        })}
    </View>
)

/**
 * Stats screen - Экран статистики пользователя
 * Основной таб навигации
 */
export const StatsScreen = () => {
    const { contentPaddingBottom } = useNavbarLayout()
    const [activeTab, setActiveTab] = useState<TabKey>('stats')
    const [isLoading, setIsLoading] = useState(true)
    useStatusBar({ style: 'light', backgroundColor: '#1E1E1E' })

    useEffect(() => {
        const timeout = setTimeout(() => setIsLoading(false), 800)
        return () => clearTimeout(timeout)
    }, [])

    if (isLoading) {
        return <Loader />
    }

    return (
        <BackgroundLayoutNoSidePadding needBg={false}>
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: contentPaddingBottom + 24, paddingTop: 16 }}
            >
                <Tabs value={activeTab} onChange={setActiveTab} />

                {activeTab === 'stats' ? (
                    <DayStatistic />
                ) : (
                    <CalendarStatistic />
                )}
            </ScrollView>

            <NavigationBar />
        </BackgroundLayoutNoSidePadding>
    )
}