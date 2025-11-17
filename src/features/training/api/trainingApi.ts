/**
 * Training API methods
 */

import { apiClient } from '@/shared/api'
import type { ApiResult } from '@/shared/api/types'

// Types for training responses
interface TrainingPlan {
	// TODO: Define based on actual API response
	[key: string]: unknown
}

interface TrainingReport {
	// TODO: Define based on actual API response
	[key: string]: unknown
}

interface TrainingInfo {
	// TODO: Define based on actual API response
	[key: string]: unknown
}

interface CompleteTrainingInput {
	// TODO: Define based on actual API request
	[key: string]: unknown
}

interface CompleteTrainingResponse {
	// TODO: Define based on actual API response
	[key: string]: unknown
}

interface ExecuteExerciseInput {
	// TODO: Define based on actual API request
	[key: string]: unknown
}

interface ExecuteExerciseResponse {
	// TODO: Define based on actual API response
	[key: string]: unknown
}

interface BuildTrainingPlanInput {
	time: string
}

interface BuildTrainingPlanResponse {
	// TODO: Define based on actual API response
	[key: string]: unknown
}

export const trainingApi = {
	/**
	 * Get latest training program
	 */
	async getTrainingPlan(userId: number): Promise<ApiResult<TrainingPlan>> {
		return apiClient.get(`/api/v1/trainings/plan/${userId}`)
	},

	/**
	 * Get training report
	 */
	async getTrainingReport(trainingId: number): Promise<ApiResult<TrainingReport>> {
		return apiClient.get(`/api/v1/trainings/report/${trainingId}`)
	},

	/**
	 * Get training info
	 */
	async getTrainingInfo(trainingId: number): Promise<ApiResult<TrainingInfo>> {
		return apiClient.get(`/api/v1/trainings/train/${trainingId}`)
	},

	/**
	 * Complete a training
	 */
	async completeTraining(
		data: CompleteTrainingInput
	): Promise<ApiResult<CompleteTrainingResponse>> {
		return apiClient.put(`/api/v1/trainings/complete`, data)
	},

	/**
	 * Execute exercise
	 */
	async executeExercise(
		data: ExecuteExerciseInput
	): Promise<ApiResult<ExecuteExerciseResponse>> {
		return apiClient.put(`/api/v1/trainings/exercise`, data)
	},

	/**
	 * Build training plan
	 * Generates and saves a personalized training plan for a user based on their metadata and start date.
	 * @param id - User ID (path parameter)
	 * @param data - Input data with start time
	 */
	async buildTrainingPlan(
		id: number,
		data: BuildTrainingPlanInput
	): Promise<ApiResult<BuildTrainingPlanResponse>> {
		return apiClient.post(`/api/v1/trainings/plan/${id}`, data)
	},
}

