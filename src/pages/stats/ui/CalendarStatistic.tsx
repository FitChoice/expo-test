import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { useRouter } from 'expo-router'

import { QueryBoundary } from '@/shared/ui'
import { WEEK_DAYS_SHORT, CALENDAR_CELL_WIDTH, CALENDAR_COLORS, CALENDAR_CELL_WIDTH_NUMBER } from '@/shared/constants'
import { useCalendarQuery } from '@/features/stats'
import type { DayCell } from '@/features/stats'

import Barbell from '@/assets/images/barbell.svg'
import Diary from '@/assets/images/diary.svg'

// ============ Вспомогательные компоненты ячеек ============

/**
 * Базовая ячейка календаря с фиксированной шириной (1/7 от ряда)
 */
const CalendarCell = ({ children }: { children: React.ReactNode }) => (
	<View 
		style={{ width: CALENDAR_CELL_WIDTH }} 
		className="mb-3 items-center"
	>
		{children}
	</View>
)

/**
 * Пустая ячейка для заполнения отступов в начале месяца
 */
const EmptyCell = () => (
	<CalendarCell>
		<View className="h-16" />
	</CalendarCell>
)

/**
 * Ячейка конкретного дня со статусами тренировок и дневника
 */
const DayCellComponent = ({
	day,
	hasWorkout,
	hasDiary,
	onPress,
}: DayCell & { onPress?: () => void }) => {
	const workoutColor = hasWorkout ? CALENDAR_COLORS.active : CALENDAR_COLORS.inactive
	const diaryColor = hasDiary ? CALENDAR_COLORS.active : CALENDAR_COLORS.inactive

	return (
		<CalendarCell>
			<TouchableOpacity
				className="items-center"
				activeOpacity={0.85}
				onPress={onPress}
			>
				<Text className="mb-2 text-t3-regular text-light-text-200">{day}</Text>
				<View className="h-16 w-14 items-center justify-center rounded-3xl bg-[#1f1f1f] py-2">
					<View className="items-center gap-1">
						<Barbell width={16} height={16} color={workoutColor} fill={workoutColor} />
						<Diary width={16} height={16} color={diaryColor} fill={diaryColor} />
					</View>
				</View>
			</TouchableOpacity>
		</CalendarCell>
	)
}

// ============ Основной компонент календаря ============

export const CalendarStatistic = () => {
	const router = useRouter()
	const { months, isLoading, error, refetch } = useCalendarQuery()

	const handleDayPress = (day: DayCell) => {
		if (!day.day || !day.scheduleId) return

		router.push({
			pathname: '/stats-day',
			params: {
				id: String(day.scheduleId),
				date: day.dateKey ?? '',
			},
		})
	}

	return (
		<QueryBoundary 
			isLoading={isLoading} 
			isError={!!error} 
			error={error} 
			onRetry={refetch}
		>
			<View className="bg-brand-dark-400 mb-6 rounded-3xl p-4">
				{/* 1. Заголовок дней недели — ОДИН на весь календарь */}
				<View className="mb-4 flex-row">
					{WEEK_DAYS_SHORT.map((day) => (
						<Text
							key={day}
							style={{ width: CALENDAR_CELL_WIDTH }}
							className="text-center text-t3-regular uppercase text-light-text-500"
						>
							{day}
						</Text>
					))}
				</View>

				{/* 2. Список месяцев */}
				{months.map(({ title, weeks, key, firstDayOffset }) => (
					<View key={key} className="mb-6">
						{/* Название месяца строго над первым числом через spacer */}
						<View className="mb-3 flex-row">
							{firstDayOffset > 0 && (
								<View style={{ width: `${firstDayOffset * CALENDAR_CELL_WIDTH_NUMBER}%` }} />
							)}
							<Text className="text-light-text-100 text-body-semibold">{title}</Text>
						</View>

						{/* Сетка дней месяца — рендерится по неделям для жесткой структуры */}
						{weeks.map((week, weekIdx) => (
							<View key={`${key}-week-${weekIdx}`} className="flex-row">
								{week.map((day, dayIdx) => (
									day.day === null ? (
										<EmptyCell key={`${key}-empty-${weekIdx}-${dayIdx}`} />
									) : (
										<DayCellComponent
											key={`${key}-${day.day}`}
											{...day}
											onPress={() => handleDayPress(day)}
										/>
									)
								))}
							</View>
						))}
					</View>
				))}
			</View>
		</QueryBoundary>
	)
}
