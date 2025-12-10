import { apiClient } from '@/shared/api'
import type { ApiResult } from '@/shared/api'

export interface DiaryEntry {
	diary_energy_level: number
	diary_mood: number
	diary_note: string
	diary_sleep_quality: number
	diary_sleep_time: string
	diary_wake_time: string
	diary_wellbeing: number
}

export interface DiaryInput extends DiaryEntry {
	schedule_id: number
}

export const dairyApi = {
	/**
	 * Получить дневник тренировки по дню (schedule_id)
	 * GET /api/v1/trainings/diary/{dayId}
	 */
	async getDiary(dayId: number): Promise<ApiResult<DiaryEntry>> {
		return apiClient.get<DiaryEntry>(`/trainings/diary/${dayId}`)
	},

	/**
	 * Создать или обновить дневник тренировки и начислить XP
	 * POST /api/v1/trainings/diary
	 */
	async upsertDiary(payload: DiaryInput): Promise<ApiResult<DiaryEntry>> {
		return apiClient.post<DiaryInput, DiaryEntry>('/trainings/diary', payload)
	},
}

