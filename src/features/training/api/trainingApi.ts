/**
 * Training API methods
 */

import { apiClient } from '@/shared/api'
import type { ApiResult } from '@/shared/api/types'

export type Activity = {
    Duration:number,
    Experience: number,
    ID: number,
    Progress: number[],
    Type: string,
}

export type TrainingPlanTraining = {
	activities: Activity[],
	date: string,
	id: number,
	period_id: number,
}

// Types for training responses
export type TrainingPlan = {
	data: TrainingPlanTraining[]
}

interface TrainingReport {
	// TODO: Define based on actual API response
	[key: string]: unknown
}

export interface Exercise {
	id: number
	name: string
	rest_time: number
	duration: number
	progress: number
	sets: number
	reps: number
	isAi: boolean
	videoUrl: string
}

export interface TrainingInfo {
	id: number
	trainingType: string
	title: string
	description: string
	difficulty: number
	experience: number
	inventory: number[]
	exercises: Exercise[]
}

interface CompleteTrainingInput {
	report_active_time: number
	report_cals: number
	report_duration: number
	report_technique_quality: number
	time: string ////ISO
	training_id: number
}

interface CompleteTrainingResponse {
	// TODO: Define based on actual API response
	[key: string]: unknown
}

interface ExecuteExerciseInput {
	id: number
	reps: number
	training_id: number
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
    async getTrainingInfo(trainingId: number): Promise<ApiResult<TrainingInfo>> {
        return apiClient.get(`/trainings/train/${trainingId}`)
    },

    /**
	 * Complete a training
	 */
    async completeTraining(
        data: CompleteTrainingInput
    ): Promise<ApiResult<CompleteTrainingResponse>> {
        return apiClient.put('/trainings/complete', data)
    },

    /**
	 * Execute exercise
	 */
    async executeExercise(
        data: ExecuteExerciseInput
    ): Promise<ApiResult<ExecuteExerciseResponse>> {
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
