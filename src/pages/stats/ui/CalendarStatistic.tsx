import React, { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'

import { statsApi } from '@/features/stats/api/statsApi'
import Barbell from '@/assets/images/barbell.svg'
import Diary from '@/assets/images/diary.svg'
import type { CalendarItem } from '@/features/stats/api/types'

import { getUserId } from '@/shared/lib/auth'

const ACTIVE_COLOR = '#aaec4d'
const INACTIVE_COLOR = '#3f3f3f'
const WEEK_DAYS = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс']

type DayCell = {
    day: number | null
    hasWorkout?: boolean
    hasDiary?: boolean
}

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)
const formatDateUtc = (year: number, month: number, day: number) =>
    new Date(Date.UTC(year, month, day)).toISOString().slice(0, 10)

const normalizeDateKey = (value: string) => {
    // Prefer direct slice to avoid timezone shifts when server returns plain YYYY-MM-DD
    const isoMatch = value.match(/^\d{4}-\d{2}-\d{2}/)
    if (isoMatch) return isoMatch[0]

    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? value.slice(0, 10) : parsed.toISOString().slice(0, 10)
}

const buildMonth = (date: Date, calendarByDate: Map<string, CalendarItem>) => {
    const title = capitalize(
        new Intl.DateTimeFormat('ru-RU', { month: 'long' }).format(date),
    )

    const totalDays = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
    const firstDayOffset = (new Date(date.getFullYear(), date.getMonth(), 1).getDay() + 6) % 7 // convert Sunday=0 to Monday=0

    const days: DayCell[] = Array.from({ length: firstDayOffset + totalDays }, (_, index) => {
        if (index < firstDayOffset) return { day: null }
        const dayNumber = index - firstDayOffset + 1
        const key = formatDateUtc(date.getFullYear(), date.getMonth(), dayNumber)
        const item = calendarByDate.get(key)

        return {
            day: dayNumber,
            hasWorkout: Boolean(item?.completedTraining),
            hasDiary: Boolean(item?.filledDiary),
        }
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
            <Text className="mb-2 text-light-text-200 text-t3-regular">{day}</Text>
            <View className="h-16 w-14 items-center justify-center rounded-3xl bg-[#1f1f1f] py-2">
                <View className="items-center gap-1">
                    <Barbell width={16} height={16} color={workoutColor} fill={workoutColor} />
                    <Diary width={16} height={16} color={diaryColor} fill={diaryColor} />
                </View>
            </View>
        </View>
    )
}

export const CalendarStatistic = () => {
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [calendarByDate, setCalendarByDate] = useState<Map<string, CalendarItem>>(new Map())

    useEffect(() => {
        let isMounted = true

        const loadCalendar = async () => {
            setIsLoading(true)
            setError(null)

            const userId = await getUserId()
            if (!userId) {
                if (isMounted) {
                    setError('Не удалось определить пользователя')
                    setIsLoading(false)
                }
                return
            }

            const result = await statsApi.getCalendar({ userId, page: 1, limit: 100 })

            if (!isMounted) return

            if (!result.success) {
                setError(result.error)
                setIsLoading(false)
                return
            }

            const map = new Map<string, CalendarItem>()
            result.data.items.forEach((item) => {
                const dateKey = normalizeDateKey(item.date)
                map.set(dateKey, item)
            })

            setCalendarByDate(map)
            setIsLoading(false)
        }

        loadCalendar()

        return () => {
            isMounted = false
        }
    }, [])

    const months = useMemo(() => {
        const now = new Date()
        return Array.from({ length: 3 }, (_, idx) =>
            buildMonth(new Date(now.getFullYear(), now.getMonth() + idx, 1), calendarByDate),
        )
    }, [calendarByDate])



    if (isLoading) {
        return (
            <View className="mb-6 items-center justify-center rounded-3xl bg-brand-dark-400 p-6">
                <ActivityIndicator color={ACTIVE_COLOR} />
                <Text className="mt-3 text-center text-body-medium text-light-text-200">
                    Загружаем календарь...
                </Text>
            </View>
        )
    }

    if (error) {
        return (
            <View className="mb-6 rounded-3xl bg-brand-dark-400 p-6">
                <Text className="text-center text-body-medium text-feedback-negative-900">
                    {error}
                </Text>
            </View>
        )
    }

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
                        {days.map((day, idx) => {
                            console.log('day')
                            console.log(day)
                            return <Day key={`${key}-${idx}`} {...day} />
                        })}
                    </View>
                </View>
            ))}
        </View>
    )
}