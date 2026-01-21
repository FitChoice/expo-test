import { apiClient } from '@/shared/api'
import type { ApiResult } from '@/shared/api/types'
import type {
	BodyStatsInput,
	BodyStatsResponse,
	CalendarParams,
	CalendarResponse,
	DayDetailsParams,
	DayDetailsResponse,
	DiariesParams,
	DiariesResponse,
	MainStatsParams,
	MainStatsResponse,
	TrainingsParams,
	TrainingsResponse,
	ChartParams,
	ChartResponse,
} from './types'

const buildQueryString = (params: Record<string, string | number | undefined>) => {
	const searchParams = new URLSearchParams()

	Object.entries(params).forEach(([key, value]) => {
		if (value === undefined || value === null) return
		searchParams.append(key, String(value))
	})

	const query = searchParams.toString()
	return query ? `?${query}` : ''
}

export const statsApi = {
	/**
	 * Создать запись замеров тела пользователя
	 * POST /api/v1/stats/body/{userId}
	 */
	async createBodyStats(
		userId: string | number,
		input: BodyStatsInput
	): Promise<ApiResult<BodyStatsResponse>> {
		const endpoint = `/stats/body/${encodeURIComponent(String(userId))}`
		return apiClient.post<BodyStatsInput, BodyStatsResponse>(endpoint, input)
	},

	/**
	 * Получить календарь по дням с заполненностью дневника и тренировок
	 * GET /api/v1/stats/calendar
	 */
	async getCalendar({
		userId,
		page = 1,
		limit = 30,
	}: CalendarParams): Promise<ApiResult<CalendarResponse>> {
		const query = buildQueryString({
			user_id: userId,
			page,
			limit,
		})
		return apiClient.get<CalendarResponse>(`/stats/calendar${query}`)
	},

	/**
	 * Получить страницы завершенных дневников пользователя
	 * GET /api/v1/stats/diaries
	 */
	async getDiaries({
		userId,
		page = 1,
		limit = 10,
	}: DiariesParams): Promise<ApiResult<DiariesResponse>> {
		const query = buildQueryString({
			user_id: userId,
			page,
			limit,
		})
		return apiClient.get<DiariesResponse>(`/stats/diaries${query}`)
	},

	/**
	 * Получить страницы завершенных тренировок/разминок
	 * GET /api/v1/stats/trainings
	 */
	async getTrainings({
		userId,
		kind = 't',
		page = 1,
		limit = 10,
	}: TrainingsParams): Promise<ApiResult<TrainingsResponse>> {
		const query = buildQueryString({
			user_id: userId,
			kind,
			page,
			limit,
		})
		return apiClient.get<TrainingsResponse>(`/stats/trainings${query}`)
	},

	/**
	 * Получить детали конкретного дня по schedule_id
	 * GET /api/v1/stats/day
	 */
	async getDayDetails({ id }: DayDetailsParams): Promise<ApiResult<DayDetailsResponse>> {
		return apiClient.get<DayDetailsResponse>(`/stats/calendar/day/?id=${id}`)
	},

	/**
	 * Получить основные показатели пользователя (ккал, streak, кол-во тренировок)
	 * GET /api/v1/stats/main/{userId}
	 */
	async getMainStats({
		userId,
		date,
	}: MainStatsParams): Promise<ApiResult<MainStatsResponse>> {
		const query = buildQueryString({ date })
		const endpoint = `/stats/main/${encodeURIComponent(String(userId))}${query}`
		return apiClient.get<MainStatsResponse>(endpoint)
	},

	/**
	 * Получить данные для графиков различных типов статистики
	 * GET /api/v1/stats/chart/{userId}/{kind}
	 */
	async getChart({
		userId,
		kind,
		date,
		period,
	}: ChartParams): Promise<ApiResult<ChartResponse>> {
		const query = buildQueryString({ date, period })
		const endpoint = `/stats/chart/${encodeURIComponent(String(userId))}/${encodeURIComponent(
			kind
		)}${query}`
		return apiClient.get<ChartResponse>(endpoint)
	},
}
