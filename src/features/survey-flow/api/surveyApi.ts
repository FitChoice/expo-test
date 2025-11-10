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
	// Конвертируем массив дней в битовую маску
	const trainDaysMask = data.trainingDays.reduce((mask, day) => {
		const dayIndex = [
			'monday',
			'tuesday',
			'wednesday',
			'thursday',
			'friday',
			'saturday',
			'sunday',
		].indexOf(day)
		return mask | (1 << dayIndex)
	}, 0)

	// Конвертируем массив целей в битовую маску
	const goalsMask = data.goals.reduce((mask, goal) => {
		const goalIndex = [
			'posture',
			'pain_relief',
			'flexibility',
			'strength',
			'weight_loss',
			'stress_relief',
			'energy',
			'wellness',
		].indexOf(goal)
		return mask | (1 << goalIndex)
	}, 0)

	// Конвертируем age group в число
	const ageGroupMap: Record<string, number> = {
		under_18: 17,
		'18_24': 21,
		'25_34': 29,
		'35_44': 39,
		'45_54': 49,
		'55_64': 59,
		'65_plus': 70,
	}

	// Конвертируем frequency в число
	const frequencyMap: Record<string, number> = {
		never: 0,
		sometimes: 1,
		'2-3times': 2,
		almost_daily: 3,
	}

	// Конвертируем direction в число
	const directionMap: Record<string, number> = {
		strength: 0,
		cardio: 1,
		stretching: 2,
		back_health: 3,
	}

	return {
		name: data.name || undefined,
		gender: data.gender || undefined,
		age: data.ageGroup ? ageGroupMap[data.ageGroup] : undefined,
		height: data.height || undefined,
		weight: data.weight || undefined,
		train_days: trainDaysMask || undefined,
		train_frequency: data.frequency ? frequencyMap[data.frequency] : undefined,
		train_goals: goalsMask || undefined,
		main_direction: data.mainDirection
			? directionMap[data.mainDirection]
			: undefined,
		secondary_direction: data.additionalDirections[0]
			? directionMap[data.additionalDirections[0]]
			: undefined,
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

		if (data.goals.length === 0) {
			return {
				success: false,
				error: 'Выберите хотя бы одну цель',
			}
		}

		if (!data.mainDirection) {
			return {
				success: false,
				error: 'Выберите основное направление',
			}
		}

		const apiData = surveyDataToApiFormat(data)
		return apiClient.patch(`/api/v1/user/update/${userId}`, apiData)
	},

	/**
	 * Get user metadata
	 */
	async getUserMetadata(
		userId: number
	): Promise<ApiResult<UpdateUserMetadataInput>> {
		return apiClient.get(`/api/v1/user/${userId}`)
	},
}

