/**
 * User API methods
 */

import { apiClient } from '@/shared/api'
import type { ApiResult, TrainingResponse } from '@/shared/api/types'

export const userApi = {
	/**
	 * Update user data
	 */
	async updateUser(
		userId: string,
		data: Record<string, unknown>
	): Promise<ApiResult<unknown>> {
		return apiClient.post(`/user/update/${userId}`, data)
	},

	/**
	 * Build training plan for user
	 */
	async buildTrainingPlan(userId: string): Promise<ApiResult<unknown>> {
		return apiClient.post(`/user/build-plan/${userId}`, {})
	},

	/**
	 * Get training information
	 */
	async getTrainInformation(
		trainingId: string,
		index: number
	): Promise<ApiResult<unknown>> {
		return apiClient.get(`/user/train/${trainingId}/${index}`)
	},

	/**
	 * Get training program for user
	 */
	async getTrainingProgram(userId: string): Promise<ApiResult<TrainingResponse[]>> {
		return apiClient.get(`/user/train-program/${userId}`)
	},
}
