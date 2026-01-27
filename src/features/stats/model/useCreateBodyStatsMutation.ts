import { useMutation, useQueryClient } from '@tanstack/react-query'

import { statsApi } from '../api/statsApi'
import { statsKeys } from '../api/queryKeys'
import type { BodyStatsInput } from '../api/types'
import { getUserId } from '@/shared/lib/auth'

export type CreateBodyStatsInput = Omit<BodyStatsInput, 'user_id' | 'date'>

/**
 * Хук для создания записи замеров тела пользователя
 */
export function useCreateBodyStatsMutation() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (input: CreateBodyStatsInput) => {
			const userId = await getUserId()
			if (!userId) throw new Error('Не удалось определить пользователя')

			const payload: BodyStatsInput = {
				...input,
				user_id: userId,
				date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
			}

			const result = await statsApi.createBodyStats(userId, payload)
			if (!result.success) {
				throw new Error(result.error ?? 'Не удалось сохранить замеры')
			}
			return result.data
		},
		onSuccess: async () => {
			const userId = await getUserId()
			if (userId) {
				// Инвалидируем основные показатели, графики и замеры тела, так как они зависят от новых данных
				await Promise.all([
					queryClient.invalidateQueries({ queryKey: statsKeys.mainStats(userId) }),
					queryClient.invalidateQueries({ queryKey: statsKeys.bodyStats(userId) }),
					queryClient.invalidateQueries({ queryKey: [...statsKeys.all, 'chart', userId] }),
				])
			}
		},
	})
}
