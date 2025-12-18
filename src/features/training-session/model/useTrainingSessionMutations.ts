import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
	trainingApi,
	trainingKeys,
	type ExecuteExerciseInput,
} from '@/features/training/api'
import { showToast } from '@/shared/lib'

type CompleteTrainingInput = Parameters<(typeof trainingApi)['completeTraining']>[0]

export function useExecuteExerciseMutation() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (payload: ExecuteExerciseInput) => {
			const result = await trainingApi.executeExercise(payload)
			if (!result.success) {
				throw new Error(result.error ?? 'Не удалось отправить упражнение')
			}
			return result.data
		},
		onSuccess: (_data, variables) => {
			showToast.success('Упражнение отправлено')

			queryClient.invalidateQueries({
				queryKey: trainingKeys.exercise(variables.training_id, variables.id),
			})
			queryClient.invalidateQueries({
				queryKey: trainingKeys.detail(variables.training_id),
			})
			queryClient.invalidateQueries({
				queryKey: trainingKeys.report(variables.training_id),
			})
		},
	})
}

export function useCompleteTrainingMutation() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (payload: CompleteTrainingInput) => {
			const result = await trainingApi.completeTraining(payload)
			if (!result.success) {
				throw new Error(result.error ?? 'Не удалось завершить тренировку')
			}
			return result.data
		},
		onSuccess: (_data, variables) => {
			showToast.success('Тренировка успешно завершена')

			queryClient.invalidateQueries({
				queryKey: trainingKeys.detail(variables.training_id),
			})
			queryClient.invalidateQueries({
				queryKey: trainingKeys.report(variables.training_id),
			})
		},
	})
}
