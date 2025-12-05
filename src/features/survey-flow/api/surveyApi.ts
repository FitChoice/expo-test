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
    // train_days может быть уже числом (если пришло из useSurveyFlow) или массивом
    const trainingDaysMasks = data.train_days as unknown as number[] | number
    let trainDaysMask: number | undefined

    if (Array.isArray(trainingDaysMasks)) {
        trainDaysMask =
			trainingDaysMasks.reduce((mask, dayMask) => {
			    return mask | dayMask
			}, 0) || undefined
    } else if (typeof trainingDaysMasks === 'number') {
        trainDaysMask = trainingDaysMasks || undefined
    }

    // Конвертируем массив битовых масок целей в одно число (битовую маску)
    // train_goals может быть уже числом (если пришло из useSurveyFlow) или массивом
    const goalsMasks = data.train_goals as unknown as number[] | number
    let goalsMask: number | undefined

    if (Array.isArray(goalsMasks)) {
        goalsMask =
			goalsMasks.reduce((mask, goalMask) => {
			    return mask | goalMask
			}, 0) || undefined
    } else if (typeof goalsMasks === 'number') {
        goalsMask = goalsMasks || undefined
    }

    // age уже хранится как число (среднее арифметическое) в стейте

    return {
        name: data.name || undefined,
        gender: data.gender || undefined,
        age: (data.age as unknown as number) || undefined,
        height: data.height || undefined,
        weight: data.weight || undefined,
        train_days: trainDaysMask,
        train_frequency: data.train_frequency || undefined,
        train_goals: goalsMask,
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

        // Проверяем goals - может быть массивом или числом
        const goalsMasks = data.train_goals as unknown as number[] | number
        const hasGoals = Array.isArray(goalsMasks)
            ? goalsMasks.length > 0
            : typeof goalsMasks === 'number' && goalsMasks > 0

        if (!hasGoals) {
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

        const apiData = surveyDataToApiFormat(data)
        console.log('API data:', apiData)

        return apiClient.patch(`/user/update/${userId}`, apiData)
    },

    /**
	 * Get user metadata
	 */
    async getUserMetadata(userId: number): Promise<ApiResult<UpdateUserMetadataInput>> {
        return apiClient.get(`/user/${userId}`)
    },
}
