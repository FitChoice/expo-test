/**
 * Survey API methods
 */

import { apiClient } from '@/shared/api'
import type { ApiResult } from '@/shared/api/types'
import type { SurveyData } from '@/entities/survey'

interface UpdateUserMetadataInput {
	name?: string
	gender?: 'male' | 'female'
	age?: number
	height?: number
	weight?: number
	train_days?: number // битовая маска дней недели
	train_frequency?: number
	train_goals?: number // битовая маска целей
	main_direction?: number
	secondary_direction?: number
	promocode?: string
}

interface UpdateUserResponse {
	status: string
}

/**
 * Преобразует SurveyData в формат API
 */
function surveyDataToApiFormat(data: SurveyData): UpdateUserMetadataInput {
	// Конвертируем массив битовых масок дней в одно число (битовую маску)
	const trainingDaysMasks = data.train_days as unknown as number[]
	const trainDaysMask = trainingDaysMasks.reduce((mask, dayMask) => {
		return mask | dayMask
	}, 0)

	// Конвертируем массив битовых масок целей в одно число (битовую маску)
	const goalsMasks = data.train_goals as unknown as number[]
	const goalsMask = goalsMasks.reduce((mask, goalMask) => {
		return mask | goalMask
	}, 0)

	// age уже хранится как число (среднее арифметическое) в стейте

	return {
		name: data.name || undefined,
		gender: data.gender || undefined,
		age: (data.age as unknown as number) || undefined,
		height: data.height || undefined,
		weight: data.weight || undefined,
		train_days: trainDaysMask || undefined,
		train_frequency: data.train_frequency || undefined,
		train_goals: goalsMask || undefined,
		main_direction: data.main_direction || undefined,
		secondary_direction: data.secondary_direction || undefined,
	}
}

export const surveyApi = {
	/**
	 * Submit survey data - обновляет метаданные пользователя
	 */
	async submitSurvey(
		userId: number,
		data: SurveyData
	): Promise<ApiResult<UpdateUserResponse>> {
		// Валидация
		if (!data.name || !data.gender) {
			return {
				success: false,
				error: 'Имя и пол обязательны для заполнения',
			}
		}

		const goalsMasks = data.train_goals as unknown as number[]
		if (!goalsMasks || goalsMasks.length === 0) {
			return {
				success: false,
				error: 'Выберите хотя бы одну цель',
			}
		}

		if (!data.main_direction) {
			return {
				success: false,
				error: 'Выберите основное направление',
			}
		}

		console.log('data')
		console.log(data)

		return apiClient.patch(`/user/update/${userId}`, data)
	},

	/**
	 * Get user metadata
	 */
	async getUserMetadata(
		userId: number
	): Promise<ApiResult<UpdateUserMetadataInput>> {
		return apiClient.get(`/user/${userId}`)
	},
}

