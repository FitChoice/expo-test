import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ScrollView,
    StyleSheet,
} from 'react-native'
import { GradientHeader } from '@/shared/ui/GradientBG'
import React, { useEffect, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { CloseBtn } from '@/shared/ui/CloseBtn'
import { SafeAreaContainer } from '@/shared/ui/SafeAreaContainer'
import { Button } from '@/shared/ui/Button'
import { dairyApi } from '@/features/dairy/api'
import type { DiaryInput } from '@/features/dairy/api'
import Emo1 from '@/assets/images/moods/emo1.svg'
import Emo2 from '@/assets/images/moods/emo2.svg'
import Emo3 from '@/assets/images/moods/emo3.svg'
import Emo4 from '@/assets/images/moods/emo4.svg'
import Emo5 from '@/assets/images/moods/emo5.svg'


interface RatingOption {
	id: number
	Icon: React.ComponentType<any>
	color: string
}

const ratingOptions: RatingOption[] = [
    { id: 1, Icon: Emo1, color: '#FF4B6E' },
    { id: 2, Icon: Emo2, color: '#FF69B4' },
    { id: 3, Icon: Emo3, color: '#FFB800' },
    { id: 4, Icon: Emo4, color: '#6B7280' },
    { id: 5, Icon: Emo5, color: '#10B981' },
]

const formatTimeInput = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4)
    let hours = digits.slice(0, 2)
    let minutes = digits.slice(2, 4)

    if (hours.length === 2) {
        const hoursNum = Number(hours)
        if (!Number.isNaN(hoursNum) && hoursNum > 23) {
            hours = '23'
        }
    }

    if (minutes.length === 2) {
        const minutesNum = Number(minutes)
        if (!Number.isNaN(minutesNum) && minutesNum > 59) {
            minutes = '59'
        }
    }

    if (digits.length <= 2) {
        return hours
    }

    return `${hours}:${minutes}`
}

const normalizeTimeForSubmit = (value: string) => {
    const digits = value.replace(/\D/g, '').padEnd(4, '0').slice(0, 4)
    const hoursNum = Math.min(Number(digits.slice(0, 2)) || 0, 23)
    const minutesNum = Math.min(Number(digits.slice(2, 4)) || 0, 59)

    return `${String(hoursNum).padStart(2, '0')}:${String(minutesNum).padStart(2, '0')}`
}

interface QuestionSectionProps {
	title: string
	subtitle: string
	selectedValue: number | null
	onSelect: (value: number) => void
}

const QuestionSection = ({
    title,
    subtitle,
    selectedValue,
    onSelect,
}: QuestionSectionProps) => {
    return (
        <View
            className="mb-2 bg-bg-dark-500 p-4"
            style={{ overflow: 'hidden', borderRadius: 14 }}
        >
            <Text className="mb-1 text-t1.1 font-semibold text-white">{title}</Text>
            <Text className="mb-4 text-t3 text-gray-400">{subtitle}</Text>
            <View className="flex-row justify-between">
                {ratingOptions.map((option) => {
                    const Icon = option.Icon
                    const isSelected = selectedValue === option.id
                    return (
                        <TouchableOpacity key={option.id} onPress={() => onSelect(option.id)}>
                            <View
                                style={{
                                    borderRadius: 27,
                                    borderWidth: isSelected ? 1 : 0,
                                    borderColor: isSelected ? option.color : 'transparent',
                                    padding: 0,
                                }}
                            >
                                <View
                                    style={{
                                        width: 54,
                                        height: 54,
                                        borderRadius: 27,
                                        borderWidth: 10,
                                        borderColor: '#3f3f3f',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Icon width={35} height={35} />
                                </View>
                            </View>
                        </TouchableOpacity>
                    )
                })}
            </View>
        </View>
    )
}

export const DiaryScreen = () => {
    const router = useRouter()
    const { id: resolvedScheduleId } =  useLocalSearchParams()
    const [mood, setMood] = useState<number | null>(null)
    const [wellBeing, setWellBeing] = useState<number | null>(null)
    const [energyLevel, setEnergyLevel] = useState<number | null>(null)
    const [sleepQuality, setSleepQuality] = useState<number | null>(null)
    const [sleepTime, setSleepTime] = useState('00:00')
    const [wakeTime, setWakeTime] = useState('07:00')
    const [notes, setNotes] = useState('')

    const isFormValid =
        mood !== null && wellBeing !== null && energyLevel !== null && sleepQuality !== null

    const handleSave = async () => {
        console.log('resolvedScheduleId')
        console.log(resolvedScheduleId)
        const payload: DiaryInput = {
            schedule_id: Number(resolvedScheduleId),
            diary_energy_level: energyLevel ?? 0,
            diary_mood: mood ?? 0,
            diary_note: notes,
            diary_sleep_quality: sleepQuality ?? 0,
            diary_sleep_time: normalizeTimeForSubmit(sleepTime),
            diary_wake_time: normalizeTimeForSubmit(wakeTime),
            diary_wellbeing: wellBeing ?? 0,
        }

        try {
            console.log('payload')
            console.log(payload)
            await dairyApi.upsertDiary(payload).then((res) => {
                console.log('res')
                console.log(res)
                if (res.success) {
                    router.navigate('/home')
                }
            })
        
        } catch (error) {
            console.error('Failed to save diary:', error)
        }
    }

    const currentDate = new Date().toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        weekday: 'long',
    })

    return (
        <View className="flex-1 bg-black">
            {/* Header with gradient */}
            <View
                className="absolute left-0 right-0 top-0 z-0"
                style={{ overflow: 'hidden', borderRadius: 34 }}
            >
                <GradientHeader />
            </View>
            <SafeAreaContainer style={styles.contentContainer}>
                {/* Header Content */}
                <View className="z-10 px-4 pb-14 pt-10">
                    <View className="mb-2 items-center">
                        <Text className="text-center text-t2 text-gray-400">{currentDate}</Text>
                    </View>
                    <CloseBtn classNames={'rounded-2xl'} handlePress={() => router.back()} />

                    <Text className="text-center font-rimma text-2xl text-white">НОВАЯ ЗАПИСЬ</Text>
                </View>

                {/* Scrollable Content */}
                <ScrollView
                    className="flex-1 bg-black px-4 pt-10"
                    showsVerticalScrollIndicator={false}
                >
                    <QuestionSection
                        title="Настроение"
                        subtitle="Какое у вас общее настроение?"
                        selectedValue={mood}
                        onSelect={setMood}
                    />

                    <QuestionSection
                        title="Самочувствие"
                        subtitle="Когда вы чувствуете себя физически?"
                        selectedValue={wellBeing}
                        onSelect={setWellBeing}
                    />

                    <QuestionSection
                        title="Уровень энергии"
                        subtitle="Сколько у вас сил сегодня?"
                        selectedValue={energyLevel}
                        onSelect={setEnergyLevel}
                    />

                    <QuestionSection
                        title="Качество сна"
                        subtitle="Как вы спали прошлой ночью?"
                        selectedValue={sleepQuality}
                        onSelect={setSleepQuality}
                    />

                    {/* Sleep Time Section */}
                    <View
                        className="mb-6 bg-bg-dark-500 p-4"
                        style={{ overflow: 'hidden', borderRadius: 14 }}
                    >
                        <Text className="mb-1 text-lg font-semibold text-white">Время сна</Text>
                        <Text className="mb-4 text-sm text-gray-400">
							Во сколько легли и когда проснулись?
                        </Text>
                        <View className="flex-row justify-between">
                            <View className="mr-2 flex-1">
                                <Text className="mb-2 text-sm text-gray-400">Засыпание</Text>
                                <TextInput
                                    value={sleepTime}
                                    onChangeText={(value) => setSleepTime(formatTimeInput(value))}
                                    className="rounded-xl bg-[#2E322D] px-4 py-3 text-white"
                                    keyboardType="number-pad"
                                    maxLength={5}
                                    placeholder="00:00"
                                    placeholderTextColor="#666"
                                />
                            </View>
                            <View className="ml-2 flex-1">
                                <Text className="mb-2 text-sm text-gray-400">Пробуждение</Text>
                                <TextInput
                                    value={wakeTime}
                                    onChangeText={(value) => setWakeTime(formatTimeInput(value))}
                                    className="rounded-xl bg-[#2E322D] px-4 py-3 text-white"
                                    keyboardType="number-pad"
                                    maxLength={5}
                                    placeholder="07:00"
                                    placeholderTextColor="#666"
                                />
                            </View>
                        </View>
                    </View>

                    {/* Notes Section */}
                    <View
                        className="mb-6 bg-bg-dark-500 p-4"
                        style={{ overflow: 'hidden', borderRadius: 14 }}
                    >
                        <Text className="mb-1 text-lg font-semibold text-white">Заметки</Text>
                        <Text className="mb-4 text-sm text-gray-400">
							Можете ли напишите что добавить?
                        </Text>
                        <TextInput
                            value={notes}
                            onChangeText={setNotes}
                            className="min-h-[100px] rounded-xl bg-[#2E322D] px-4 py-3 text-white"
                            placeholder="Сегодня я..."
                            placeholderTextColor="#666"
                            multiline
                            textAlignVertical="top"
                        />
                        <Text className="mt-2 text-right text-xs text-gray-500">
							0 / 500 символов
                        </Text>
                    </View>
                </ScrollView>

                {isFormValid && (
                    <View className="px-4 pb-4 pt-2">
                        <Button variant="primary" size="l" fullWidth onPress={handleSave}>
                            Сохранить
                        </Button>
                    </View>
                )}
            </SafeAreaContainer>
        </View>
    )
}

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        paddingHorizontal: 14,
    },
})
