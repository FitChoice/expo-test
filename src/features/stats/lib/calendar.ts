import type { CalendarItem } from '../api/types'

/**
 * Нормализует дату к формату YYYY-MM-DD
 * Позволяет избежать смещения таймзоны при парсинге сервером
 */
export const normalizeDateKey = (value: string): string => {
	const isoMatch = value.match(/^\d{4}-\d{2}-\d{2}/)
	if (isoMatch) return isoMatch[0]

	const parsed = new Date(value)
	return Number.isNaN(parsed.getTime())
		? value.slice(0, 10)
		: parsed.toISOString().slice(0, 10)
}

/**
 * Форматирует дату в UTC ISO строку (YYYY-MM-DD)
 */
export const formatDateUtc = (year: number, month: number, day: number): string =>
	new Date(Date.UTC(year, month, day)).toISOString().slice(0, 10)

/**
 * Капитализирует первую букву строки
 */
export const capitalize = (value: string): string =>
	value.charAt(0).toUpperCase() + value.slice(1)

/**
 * Разбивает массив на чанки указанного размера
 */
export function chunkArray<T>(array: T[], size: number): T[][] {
	const chunks: T[][] = []
	for (let i = 0; i < array.length; i += size) {
		chunks.push(array.slice(i, i + size))
	}
	return chunks
}

export type DayCell = {
	day: number | null
	hasWorkout?: boolean
	hasDiary?: boolean
	scheduleId?: number
	dateKey?: string
}

export type MonthData = {
	title: string
	weeks: DayCell[][]
	key: string
	firstDayOffset: number
}

/**
 * Строит данные месяца для отображения в сетке календаря
 */
export const buildMonth = (
	date: Date,
	calendarByDate: Map<string, CalendarItem>
): MonthData => {
	const title = capitalize(
		new Intl.DateTimeFormat('ru-RU', { month: 'long' }).format(date)
	)

	const totalDays = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
	// Получаем смещение первого дня месяца (0 = пн, 6 = вс)
	const firstDayOffset = (new Date(date.getFullYear(), date.getMonth(), 1).getDay() + 6) % 7

	const days: DayCell[] = Array.from(
		{ length: firstDayOffset + totalDays },
		(_, index) => {
			if (index < firstDayOffset) return { day: null }
			
			const dayNumber = index - firstDayOffset + 1
			const key = formatDateUtc(date.getFullYear(), date.getMonth(), dayNumber)
			const item = calendarByDate.get(key)

			return {
				day: dayNumber,
				hasWorkout: Boolean(item?.completedTraining),
				hasDiary: Boolean(item?.filledDiary),
				scheduleId: item?.id,
				dateKey: key,
			}
		}
	)

	// Разбиваем на недели по 7 дней для стабильной верстки
	const weeks = chunkArray(days, 7)

	return { 
		title, 
		weeks, 
		key: `${date.getFullYear()}-${date.getMonth()}`, 
		firstDayOffset 
	}
}

/**
 * Строит массив данных для нескольких месяцев
 */
export const buildMonths = (
	calendarByDate: Map<string, CalendarItem>,
	count = 3
): MonthData[] => {
	const now = new Date()
	return Array.from({ length: count }, (_, idx) =>
		buildMonth(new Date(now.getFullYear(), now.getMonth() + idx, 1), calendarByDate)
	)
}
