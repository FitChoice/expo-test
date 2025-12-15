import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native'

import { BackgroundLayoutNoSidePadding, Icon, Loader } from '@/shared/ui'
import { NavigationBar } from '@/widgets/navigation-bar'
import { useNavbarLayout, useStatusBar } from '@/shared/lib'
import Emo1 from '@/assets/images/moods/emo1.svg'
import Emo2 from '@/assets/images/moods/emo2.svg'
import Emo3 from '@/assets/images/moods/emo3.svg'
import Emo4 from '@/assets/images/moods/emo4.svg'
import Emo5 from '@/assets/images/moods/emo5.svg'
import girlSample from '../../../../assets/images/girl_sample.png'
import girlMeasure from '../../../../assets/images/girl-measure.png'
import Feather from '@expo/vector-icons/Feather';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Barbell from '@/assets/images/barbell.svg'
import Morning from '@/assets/images/morning_ex.svg'
import Diary from '@/shared/ui/Icon/assets/diary.svg'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Fontisto from '@expo/vector-icons/Fontisto';
import EvilIcons from '@expo/vector-icons/EvilIcons';



const overallStats = [
    { icon: <Barbell color="#aaec4d" fill="#aaec4d" /> , value: '160', label: 'Тренировок' },
    { icon: <Morning color="#aaec4d" fill="#aaec4d" />, value: '586', label: 'Энергии' },
    { icon: <Diary color="#aaec4d" fill="#aaec4d" />, value: '25', label: 'Записей дневника' },
    { icon: <MaterialCommunityIcons name="clock" size={24} color="#aaec4d" />, value: '27ч 16м', label: 'Время тренировки' },
    { icon: <Fontisto name="fire" size={24} color="#aaec4d" />, value: '100 000', label: 'Калорий сожжено' },
]

const moodPoints = [
    { day: 'пн', Icon: Emo3, color: '#FFB800', height: 180 },
    { day: 'вт', Icon: Emo2, color: '#FF69B4', height: 110 },
    { day: 'ср', Icon: Emo5, color: '#F5A524', height: 140 },
    { day: 'чт', Icon: Emo1, color: '#FF4B6E', height: 100 },
    { day: 'пт', Icon: Emo3, color: '#FFB800', height: 220 },
    { day: 'сб', Icon: Emo4,  color: '#6B7280', height: 180 },
    { day: 'вс', Icon: Emo5, color: '#10B981', height: 150 },
]

const bodyWeightPoints = [
    { month: 'ян', value: 56 },
    { month: 'фв', value: 64 },
    { month: 'мр', value: 60 },
    { month: 'ап', value: 74 },
    { month: 'мй', value: 68 },
    { month: 'ин', value: 62 },
    { month: 'ил', value: 75 },
    { month: 'ав', value: 64 },
    { month: 'сн', value: 72 },
    { month: 'ок', value: 70 },
    { month: 'нб', value: 64 },
    { month: 'дк', value: 56 },
]

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
                    <>
                        {/* Weekly summary */}
                        <View className="mb-6 gap-3">
                        <Text className='text-t.1 text-white' >На этой неделе</Text>
                            <View className="flex-row gap-3">
                                <View className="flex-1 rounded-3xl bg-fill-800 p-4">
                        
                                    <View className="mt-3 items-center gap-3 ">
                                        <View className="flex-row gap-5 items-center">
                                        <FontAwesome6 name="bolt" size={14} color="#a172ff" />                                           
                                         <Text className="text-h2 text-white">100</Text>
                                        </View>
                                        <Text className="text-caption-regular text-white/70">
                                            Тренировок подряд
                                        </Text>
                                    </View>
                                 
                                </View>

                                <View className="flex-1 rounded-3xl bg-fill-800 p-4">
                                    <View className="mt-3 items-center gap-3">
                                        <View className="flex-row gap-5 items-center ">
                                        <Feather name="arrow-up" size={24} color="#aaec4d" />                                           
                                         <Text className="text-h2 text-white">100</Text>
                                        </View>
                                        <Text className="text-caption-regular text-white/70">
                                            Чистота техники
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* All time stats */}
                        <View className="mb-6">
                        <Text className='text-t.1 text-white' >За все время</Text>
                        
                            <View className="flex-row flex-wrap gap-3">
                                {overallStats.map((stat, idx) => (
                                    <View
                                        key={stat.label}
                                        className={`rounded-2xl bg-[#1e1e1e] p-4 basis-[${idx == 2 ? 100 : 47}%]`}
                                    >
                                        <View className="mb-2 flex-row items-center justify-between">
                                          {stat.icon}  <Text className="text-h2 text-light-text-100">{stat.value}</Text>
                                            <View className="p-2 items-center justify-center rounded-2xl bg-[#F4F4F4]/20">
                                            <Feather name="arrow-right" size={24} color="white" />
                                            </View>
                                        </View>
                                    
                                        <Text className="text-caption-regular text-light-text-500">{stat.label}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* Photo progress */}
                        <View className="overflow-hidden rounded-3xl bg-[#1b1b1b]">
                            <View className="flex-row items-center gap-4 p-5">
                                <View className="h-48 flex-1 justify-between">
                                    <Text className="text-t1.1 text-white">Фото-прогресс</Text>
                                    <TouchableOpacity
                                        className="h-20 w-20 items-center justify-center rounded-full bg-brand-purple-500"
                                        activeOpacity={0.9}
                                    >
                                        <Icon name="chevrons-right" size={28} color="#FFFFFF" />
                                    </TouchableOpacity>
                                </View>

                                <Image
                                    source={girlSample}
                                    className="h-48 w-44"
                                    resizeMode="contain"
                                />
                            </View>
                        </View>

                        {/* Mood chart */}
                        <View className="mb-6 rounded-3xl bg-brand-dark-400 p-4">
                            <View className="mb-4 flex-row items-center justify-between">
                            
                             <Text className="text-t1.1 text-white">Общее состояние</Text>
                             <Text className="text-t3 text-light-text-500">За эту неделю</Text>
                         
                            
                            </View>

                            <TouchableOpacity
                                        className=" w-40 py-5 items-center flex-row justify-center rounded-2xl bg-fill-700"
                                        activeOpacity={0.9}
                                    >
                                        <Text  className="text-t3 text-light-text-200">Настроение</Text>
                                        <EvilIcons name="chevron-right" size={24} color="white" />
                                    </TouchableOpacity>

                            <View className="flex-row items-end justify-between gap-2">
                                {moodPoints.map(({ day, Icon: MoodIcon, color, height }) => (
                                    <View key={day} className="items-center gap-2">
                                        <MoodIcon width={24} height={24} />
                                        <View
                                            style={{ height, width: 24 }}
                                            className="overflow-hidden rounded-2xl bg-[#3f3f3f]"
                                        >
                                            <View style={{ height: 8, backgroundColor: color, width: '100%' }} />
                                        </View>
                                        <Text className="text-light-text-200 uppercase">{day}</Text>
                                    </View>
                                ))}
                            </View>

                            <View className="mt-4 h-20 flex-row items-center gap-4 rounded-full bg-[#3f3f3f] px-4">
                                
                                <Emo3 />
                                <Text className="text-body-regular text-light-text-200">В среднем</Text>

                            </View>
                        </View>

                        {/* Body section */}
                        <View className="mb-6 rounded-3xl bg-brand-dark-400 p-4">
                            <View className="mb-4 flex-row items-center justify-between">
                            
                             <Text className="text-t1.1 text-white">Тело</Text>
                             <Text className="text-t3 text-light-text-500">За этот год</Text>
                         
                            
                            </View>

                            <TouchableOpacity
                                        className=" w-20 mb-10 py-5 items-center flex-row justify-center rounded-2xl bg-fill-700"
                                        activeOpacity={0.9}
                                    >
                                        <Text  className="text-t3 text-light-text-200"> Вес</Text>
                                        <EvilIcons name="chevron-right" size={24} color="white" />
                                    </TouchableOpacity>

                                     <View className="flex-row items-end justify-between gap-2">
                                 {bodyWeightPoints.map(({ value, month }) => (
                                     <View key={month} className="items-center gap-1">
                                        <View
                                            style={{
                                                height: value,
                                                width: 14,
                                                backgroundColor:
                                                    month === 'дк' ? '#9AE6B4' : '#3F3F46',
                                            }}
                                            className="rounded-2xl"
                                        />
                                         <Text className="text-light-text-200">{month}</Text>
                                    </View>
                                ))}
                            </View>

                        </View>

                        <View className="mt-4 h-20 flex-row items-center gap-4 rounded-full bg-black justify-between    px-4 mb-4">
                                <Text className="text-t1 text-light-text-100">52 кг</Text>
                                <Text className="text-body-regular text-light-text-200">В ноябре</Text>

                            </View>

                        {/* CTA */}
                        <View className="overflow-hidden rounded-3xl bg-[#1b1b1b]">
                            <View className="flex-row items-center gap-4 px-5">
                                <View className="h-48 flex-1 justify-between py-2">
                                    <Text className="text-t1.1 text-white">Внести изменения за этот месяц</Text>
                                    <TouchableOpacity
                                        className="h-20 w-20 items-center justify-center rounded-full bg-brand-purple-500"
                                        activeOpacity={0.9}
                                    >
                                        <Icon name="chevrons-right" size={28} color="#FFFFFF" />
                                    </TouchableOpacity>
                                </View>

                                <Image
                                    source={girlMeasure}
                                    className="h-48 w-44"
                                    resizeMode="contain"
                                />
                            </View>
                        </View>
                    </>
                ) : (
                    <View className="mb-6 rounded-3xl bg-brand-dark-400 p-6">
                        <Text className="text-center text-body-medium text-text-secondary">
                            Календарь скоро будет доступен
                        </Text>
                    </View>
                )}
            </ScrollView>

            <NavigationBar />
        </BackgroundLayoutNoSidePadding>
    )
}