import { useQuery } from '@tanstack/react-query'

import { getUserId } from '@/shared/lib/auth'
import { statsApi } from '../api/statsApi'
import { statsKeys } from '../api/queryKeys'

/**
 * Хук для получения списка заполненных дневников пользователя
 */
export const useDiariesQuery = (limit = 100) => {
	const { data: userId } = useQuery({
		queryKey: ['userId'],
		queryFn: getUserId,
	})

	return useQuery({
		queryKey: statsKeys.diaries(userId ?? ''),
		queryFn: async () => {
			if (!userId) return []
			const result = await statsApi.getDiaries({ userId, limit })
			if (!result.success) throw new Error(result.error ?? 'Failed to load diaries')
			return result.data.diaries
		},
		enabled: !!userId,
	})
}
