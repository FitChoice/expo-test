/**
 * Training API methods
 */

import { apiClient } from '@/shared/api'
import type { ApiResult } from '@/shared/api/types'
import type {
	CompleteTrainingInput,
	ExecuteExerciseInput,
	ExerciseInfoResponse,
	Training,
} from '@/entities/training/model/types'
import { refreshAccessToken } from '@/shared/api/refreshToken'

export type Activity = {
	Duration: number
	Experience: number
	ID: number
	Progress: number[]
	Type: string
	is_diary_complete: boolean
}

export type TrainingPlanTraining = {
	activities: Activity[]
	date: string
	id: number
	period_id: number
	is_diary_complete: boolean
}

// Types for training responses
export type TrainingPlan = TrainingPlanTraining[]

interface TrainingReport {
	// TODO: Define based on actual API response
	[key: string]: unknown
}

// NOTE: используем доменные типы из entities/training, не дублируем.

interface CompleteTrainingResponse {
	// TODO: Define based on actual API response
	[key: string]: unknown
}

interface ExecuteExerciseResponse {
	// TODO: Define based on actual API response
	[key: string]: unknown
}

interface BuildTrainingPlanInput {
	time: string ////ISO
}

interface BuildTrainingPlanResponse {
	// TODO: Define based on actual API response
	[key: string]: unknown
}

export const trainingApi = {
	/**
	 * Get exercise info
	 * Returns detailed information about a specific exercise within a training, including progress
	 * @param trainingId - Training ID
	 * @param exerciseId - Exercise ID
	 */
	async getExerciseInfo(
		trainingId: string,
		exerciseId: number
	): Promise<ApiResult<ExerciseInfoResponse>> {
		return apiClient.get(`/trainings/exercise/${trainingId}/${exerciseId}`)
	},

	/**
	 * Get latest training program
	 */
	async getTrainingPlan(userId: number): Promise<ApiResult<TrainingPlan>> {
		return apiClient.get(`/trainings/plan/${userId}`)
	},

	/**
	 * Get training report
	 */
	async getTrainingReport(trainingId: number): Promise<ApiResult<TrainingReport>> {
		return apiClient.get(`/trainings/report/${trainingId}`)
	},

	/**
	 * Get training info
	 */
	async getTrainingInfo(trainingId: number): Promise<ApiResult<Training>> {
		return apiClient.get(`/trainings/train/${trainingId}`)
	},

	/**
	 * Complete a training
	 */
	async completeTraining(
		data: CompleteTrainingInput
	): Promise<ApiResult<CompleteTrainingResponse>> {
		const refreshResult = await refreshAccessToken()
		if (refreshResult !== 'ok') {
			return { success: false, error: 'Unauthorized' }
		}
		return apiClient.put('/trainings/complete', data)
	},

	/**
	 * Execute exercise
	 */
	async executeExercise(
		data: ExecuteExerciseInput
	): Promise<ApiResult<ExecuteExerciseResponse>> {
		const refreshResult = await refreshAccessToken()
		if (refreshResult !== 'ok') {
			return { success: false, error: 'Unauthorized' }
		}
		return apiClient.put('/trainings/exercise', data)
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
		return apiClient.post(`/trainings/plan/${id}`, data)
	},
}
