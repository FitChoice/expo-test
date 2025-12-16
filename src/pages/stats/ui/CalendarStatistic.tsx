import React, { useMemo } from 'react'
import { Text, View } from 'react-native'

import Barbell from '@/assets/images/barbell.svg'
import Diary from '@/shared/ui/Icon/assets/diary.svg'

const ACTIVE_COLOR = '#aaec4d'
const INACTIVE_COLOR = '#3f3f3f'
const WEEK_DAYS = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс']

type DayCell = {
    day: number | null
    hasWorkout?: boolean
    hasDiary?: boolean
}

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)

const getDayState = (day: number, monthIndex: number) => ({
    hasWorkout: (day + monthIndex) % 2 === 0 || day % 5 === 0,
    hasDiary: (day + monthIndex * 2) % 3 === 0,
})

const buildMonth = (date: Date, monthIndex: number) => {
    const title = capitalize(
        new Intl.DateTimeFormat('ru-RU', { month: 'long' }).format(date),
    )

    const totalDays = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
    const firstDayOffset = (new Date(date.getFullYear(), date.getMonth(), 1).getDay() + 6) % 7 // convert Sunday=0 to Monday=0

    const days: DayCell[] = Array.from({ length: firstDayOffset + totalDays }, (_, index) => {
        if (index < firstDayOffset) return { day: null }
        const dayNumber = index - firstDayOffset + 1
        return { day: dayNumber, ...getDayState(dayNumber, monthIndex) }
    })

    return { title, days, key: `${date.getFullYear()}-${date.getMonth()}` }
}

const Day = ({ day, hasWorkout, hasDiary }: DayCell) => {
    if (!day) {
        return <View style={{ width: '14.28%' }} className="mb-3 h-16" />
    }

    const workoutColor = hasWorkout ? ACTIVE_COLOR : INACTIVE_COLOR
    const diaryColor = hasDiary ? ACTIVE_COLOR : INACTIVE_COLOR

    return (
        <View style={{ width: '14.28%' }} className="items-center mb-3">
              <Text className="text-light-text-200 text-t3-regular">{day}</Text>
            <View className="h-16 w-14 items-center justify-between rounded-3xl bg-[#1f1f1f] py-2">
                <View className=" items-center gap-1">
                    <Barbell width={16} height={16} color={workoutColor} fill={workoutColor} />
                    <Diary width={16} height={16} color={diaryColor} fill={diaryColor} />
                </View>
            
            </View>
        </View>
    )
}

export const CalendarStatistic = () => {
    const months = useMemo(() => {
        const now = new Date()
        return Array.from({ length: 3 }, (_, idx) =>
            buildMonth(new Date(now.getFullYear(), now.getMonth() + idx, 1), idx),
        )
    }, [])

    return (
        <View className="mb-6 rounded-3xl bg-brand-dark-400 p-4">
            {months.map(({ title, days, key }) => (
                <View key={key} className="mb-6">
                    <Text className="mb-3 text-center text-h2 text-light-text-100">{title}</Text>

                    <View className="mb-3 flex-row justify-between">
                        {WEEK_DAYS.map(day => (
                            <Text
                                key={day}
                                className="w-[14.28%] text-center text-t3-regular uppercase text-light-text-500"
                            >
                                {day}
                            </Text>
                        ))}
                    </View>

                    <View className="flex-row flex-wrap">
                        {days.map((day, idx) => (
                            <Day key={`${key}-${idx}`} {...day} />
                        ))}
                    </View>
                </View>
            ))}
        </View>
    )
}