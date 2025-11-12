/**
 * Training API - работа с тренировками
 */

import { apiClient } from '@/shared/api/client'
import { ActivitiesResponse } from '../model';


/**
 * Training API methods
 */
export const trainingApi = {

	/**
	 * Получить программу тренировок по userId
	 */
	async getTrainingProgram(userId: number): Promise<ActivitiesResponse> {
		const result = await apiClient.get<ActivitiesResponse>(`/trainings/plan/${userId}`);

		console.log('result', result)
	
		if (!result.success || !result.data) {
			const errorMessage = !result.success ? result.error : 'No data received';
			throw new Error(errorMessage || 'Failed to fetch training program');
		}
	
		return result.data
	},


	async getCurrentTrainingProgram(trainingId: number): Promise<ActivitiesResponse> {
		const result = await apiClient.get<ActivitiesResponse>(`/trainings/train/${trainingId}`);

		console.log('result', result)
	
		if (!result.success || !result.data) {
			const errorMessage = !result.success ? result.error : 'No data received';
			throw new Error(errorMessage || 'Failed to fetch training program');
		}
	
		return result.data
	}
	
}

