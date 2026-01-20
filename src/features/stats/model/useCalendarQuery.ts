import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { getUserId } from '@/shared/lib/auth'
import { statsApi } from '../api/statsApi'
import { statsKeys } from '../api/queryKeys'
import { buildMonths, normalizeDateKey, type MonthData } from '../lib/calendar'
import type { CalendarItem } from '../api/types'

/**
 * Хук для получения и трансформации данных календаря
 */
export const useCalendarQuery = (monthsCount = 3) => {
	// Запрос userId (может быть закеширован глобально)
	const { data: userId } = useQuery({
		queryKey: ['userId'],
		queryFn: getUserId,
	})

	// Основной запрос данных статистики
	const { 
		data: calendarItems, 
		isLoading, 
		error, 
		refetch 
	} = useQuery({
		queryKey: statsKeys.calendar(userId ?? ''),
		queryFn: async () => {
			if (!userId) return []
			// Запрашиваем 100 записей (на ~3 месяца)
			const result = await statsApi.getCalendar({ userId, page: 1, limit: 100 })
			if (!result.success) throw new Error(result.error)
			return result.data.items
		},
		enabled: !!userId,
	})

	// Группировка данных по дате для быстрого поиска при построении сетки
	const calendarByDate = useMemo(() => {
		const map = new Map<string, CalendarItem>()
		calendarItems?.forEach((item) => {
			const dateKey = normalizeDateKey(item.date)
			map.set(dateKey, item)
		})
		return map
	}, [calendarItems])

	// Формирование структуры месяцев
	const months: MonthData[] = useMemo(
		() => buildMonths(calendarByDate, monthsCount),
		[calendarByDate, monthsCount]
	)

	return {
		months,
		isLoading,
		error: error as Error | null,
		refetch,
	}
}
