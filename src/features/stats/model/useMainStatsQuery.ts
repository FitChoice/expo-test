import { useQuery } from '@tanstack/react-query'

import { getUserId } from '@/shared/lib/auth'
import { statsApi } from '../api/statsApi'
import { statsKeys } from '../api/queryKeys'

/**
 * Хук для получения основных показателей статистики пользователя
 */
export const useMainStatsQuery = () => {
	const { data: userId } = useQuery({
		queryKey: ['userId'],
		queryFn: getUserId,
	})

	return useQuery({
		queryKey: statsKeys.mainStats(userId ?? ''),
		queryFn: async () => {
			if (!userId) throw new Error('User ID not found')
			const result = await statsApi.getMainStats({ userId })
			if (!result.success) throw new Error(result.error ?? 'Failed to load main stats')
			return result.data
		},
		enabled: !!userId,
	})
}
