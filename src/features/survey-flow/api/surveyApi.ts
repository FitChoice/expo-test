/**
 * Survey API methods
 */

import { apiClient } from '@/shared/api'
import type { ApiResult } from '@/shared/api/types'
import type { SurveyData } from '@/entities/survey'

interface UpdateUserMetadataInput {
	age?: number,
	avatar_url?: string,
	gender?: string,
	height?: number,
	main_direction?: number,
	name?: string,
	notif_main?: boolean,
	notif_progress?: boolean,
	notif_report?: boolean,
	notif_system?: boolean,
	promocode?: string,
	secondary_direction?: number,
	train_days?: number,
	train_frequency?: number,
	train_goals?: number,
	weight?: number,
}




interface UpdateUserResponse {
	status: string
}

/**
 * Преобразует SurveyData в формат API
 */
function surveyDataToApiFormat(data: SurveyData): UpdateUserMetadataInput {
	const out: UpdateUserMetadataInput = {}

	const setString = (key: keyof UpdateUserMetadataInput, value: unknown) => {
		if (typeof value !== 'string') return
		const v = value.trim()
		if (!v) return
		out[key] = v as never
	}

	const setNumber = (key: keyof UpdateUserMetadataInput, value: unknown) => {
		const n = typeof value === 'number' ? value : Number(value)
		if (!Number.isFinite(n)) return
		if (n === 0) return
		out[key] = n as never
	}

	const toBitMask = (value: unknown): number | undefined => {
		if (Array.isArray(value)) {
			const mask = (value as Array<number | string>).reduce((acc: number, v) => {
				const n = typeof v === 'number' ? v : Number(v)
				return Number.isFinite(n) ? (acc | n) : acc
			}, 0)
			return mask === 0 ? undefined : mask
		}

		if (typeof value === 'number') return value === 0 ? undefined : value
		const n = Number(value)
		return Number.isFinite(n) && n !== 0 ? n : undefined
	}

	// Если значение undefined/пустое/0 — ключ вообще не включаем в payload
	setString('name', data.name)
	setString('gender', data.gender)

	// age уже хранится как число (среднее арифметическое) в стейте, но страхуемся
	setNumber('age', data.age)
	setNumber('height', data.height)
	setNumber('weight', data.weight)
	setNumber('train_frequency', data.train_frequency)
	setNumber('main_direction', data.main_direction)
	setNumber('secondary_direction', data.secondary_direction)

	const trainDaysMask = toBitMask(data.train_days)
	if (trainDaysMask !== undefined) out.train_days = trainDaysMask

	const goalsMask = toBitMask(data.train_goals)
	if (goalsMask !== undefined) out.train_goals = goalsMask

	return out
}

export const surveyApi = {
	/**
	 * Submit survey data - обновляет метаданные пользователя
	 */
	async submitSurvey(
		userId: number,
		data: SurveyData
	): Promise<ApiResult<UpdateUserResponse>> {
	
		const apiData = surveyDataToApiFormat(data)
	

		return apiClient.patch(`/user/update/${userId}`, apiData)
	},

	/**
	 * Get user metadata
	 */
	async getUserMetadata(userId: number): Promise<ApiResult<UpdateUserMetadataInput>> {
		return apiClient.get(`/user/${userId}`)
	},
}
