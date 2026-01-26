import { useMutation, useQueryClient } from '@tanstack/react-query'
import { surveyApi } from '../api'
import { trainingApi, trainingKeys } from '@/features/training/api'
import { getUserId, showToast } from '@/shared/lib'
import type { SurveyData } from '@/entities/survey'

export const useUpdateTrainingProgramMutation = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (data: SurveyData) => {
			const userId = await getUserId()
			if (!userId) {
				showToast.error('Не удалось определить пользователя')
				throw new Error('Не удалось определить пользователя')
			}

			const updateResult = await surveyApi.submitSurvey(userId, data)
			if (!updateResult.success) {
				showToast.error('Ошибка обновления программы')
				throw new Error(updateResult.error || 'Ошибка обновления программы')

			}

			const planResult = await trainingApi.buildTrainingPlan(userId, {
				time: new Date().toISOString(),
			})
			if (!planResult.success) {
				showToast.error('Ошибка создания плана тренировок')
				throw new Error(planResult.error || 'Ошибка создания плана тренировок')
			}

			return { userId }
		},
		onSuccess: ({ userId }) => {
			showToast.success('Программа тренировок обновлена', '', 'check' )

			queryClient.invalidateQueries({ queryKey: ['profile', userId] })
			queryClient.invalidateQueries({ queryKey: trainingKeys.plan(userId) })
		},
	})
}
