import { useQuery } from '@tanstack/react-query'

import { getUserId } from '@/shared/lib/auth'
import { statsApi } from '../api/statsApi'
import { statsKeys } from '../api/queryKeys'
import type { TrainingKind } from '../api/types'

/**
 * Хук для получения списка тренировок или зарядок пользователя
 */
export const useTrainingsQuery = (kind: TrainingKind = 't', limit = 100) => {
	const { data: userId } = useQuery({
		queryKey: ['userId'],
		queryFn: getUserId,
	})

	return useQuery({
		queryKey: statsKeys.trainings(userId ?? '', kind),
		queryFn: async () => {
			if (!userId) return []
			const result = await statsApi.getTrainings({ userId, kind, limit })
			if (!result.success) throw new Error(result.error ?? 'Failed to load trainings')
			return result.data.trainings
		},
		enabled: !!userId,
	})
}
