import { useQuery } from '@tanstack/react-query'

import { getUserId } from '@/shared/lib/auth'
import { statsApi } from '../api/statsApi'
import { statsKeys } from '../api/queryKeys'
import type { StatKind } from '../api/types'

interface UseChartQueryProps {
	kind: StatKind
	period?: 'week' | 'month' | 'year'
	date?: string
	enabled?: boolean
}

/**
 * Хук для получения данных графика по конкретному показателю
 */
export const useChartQuery = ({ kind, period, date, enabled = true }: UseChartQueryProps) => {
	const { data: userId } = useQuery({
		queryKey: ['userId'],
		queryFn: getUserId,
	})

	return useQuery({
		queryKey: statsKeys.chart(userId ?? '', kind, period, date),
		queryFn: async () => {
			if (!userId) throw new Error('User ID not found')
			const result = await statsApi.getChart({ userId, kind, period, date })
			if (!result.success) throw new Error(result.error ?? 'Failed to load chart data')
			return result.data
		},
		enabled: !!userId && enabled,
	})
}
