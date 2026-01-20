import { useQuery } from '@tanstack/react-query'

import { statsApi } from '../api/statsApi'
import { statsKeys } from '../api/queryKeys'

/**
 * Хук для получения детальной информации о конкретном дне (активностях)
 */
export const useDayDetailsQuery = (scheduleId: string | number | undefined) => {
	return useQuery({
		queryKey: statsKeys.dayDetails(scheduleId ?? ''),
		queryFn: async () => {
			if (!scheduleId) throw new Error('Schedule ID is required')
			const result = await statsApi.getDayDetails({ id: scheduleId })
			if (!result.success) throw new Error(result.error ?? 'Failed to load day details')
			return result.data
		},
		enabled: !!scheduleId,
	})
}
