/**
 * Training API - работа с тренировками
 */

import { apiClient } from '@/shared/api/client'
import type { Training, Report, ReportData, ExerciseProgressData } from '../model/types'

/**
 * API response для тренировки
 */
interface TrainingResponse {
	trainingId: string
	title: string
	description: string
	difficulty: string
	experience: string
	inventory: string[]
	exercises: {
		name: string
		duration: number
		progress: number
		sets: number
		reps: number
		isAi: boolean
		videoUrl: string
	}[]
}

/**
 * API response для отчета
 */
interface ReportAPIResponse {
	report_duration: number
	report_active_time: number
	report_cals: number
	report_technique_quality: number
}

/**
 * Training API methods
 */
export const trainingApi = {
	/**
	 * Получить данные тренировки по ID
	 */
	async getTraining(trainingId: string): Promise<Training> {
		const result = await apiClient.get<TrainingResponse>(`/trainings/train/${trainingId}`)

		if (!result.success || !result.data) {
			const errorMessage = !result.success ? result.error : 'No data received'
			throw new Error(errorMessage || 'Failed to fetch training')
		}

		// Transform API response to app format
		return transformTrainingData(result.data)
	},

	/**
	 * Обновить прогресс выполнения упражнения
	 */
	async updateExerciseProgress(data: ExerciseProgressData): Promise<{ status: string }> {
		const result = await apiClient.post<ExerciseProgressData, { status: string }>(
			'/trainings/exercise',
			data
		)

		if (!result.success || !result.data) {
			const errorMessage = !result.success ? result.error : 'No data received'
			throw new Error(errorMessage || 'Failed to update exercise progress')
		}

		return result.data
	},

	/**
	 * Создать отчет о тренировке
	 */
	async createReport(reportData: ReportData): Promise<{ status: string }> {
		const result = await apiClient.post<ReportData, { status: string }>(
			'/trainings/report',
			reportData
		)

		if (!result.success || !result.data) {
			const errorMessage = !result.success ? result.error : 'No data received'
			throw new Error(errorMessage || 'Failed to create report')
		}

		return result.data
	},

	/**
	 * Получить отчет о тренировке
	 */
	async getReport(trainingId: string): Promise<Report> {
		const result = await apiClient.get<ReportAPIResponse>(
			`/trainings/report/${trainingId}`
		)

		if (!result.success || !result.data) {
			const errorMessage = !result.success ? result.error : 'No data received'
			throw new Error(errorMessage || 'Failed to fetch report')
		}

		// Transform API response to app format
		return {
			completedAt: new Date().toISOString(),
			title: '',
			category: 'strength',
			experienceGained: 0,
			...result.data,
		}
	},
}

/**
 * Transform API training data to app format
 */
function transformTrainingData(api: TrainingResponse): Training {
	return {
		trainingId: api.trainingId,
		title: api.title,
		description: api.description,
		category: inferCategory(api.exercises),
		experiencePoints: parseInt(api.experience) || 0,

		inventory: api.inventory.map((name, idx) => ({
			id: `eq_${idx}`,
			name,
			imageUrl: getEquipmentImage(name),
			isRequired: true,
		})),

		exercises: api.exercises.map((ex, idx) => ({
			id: `${api.trainingId}_ex_${idx}`,
			name: ex.name,
			type: ex.isAi ? ('ai' as const) : ('timer' as const),
			sets: ex.sets,
			reps: ex.reps || null,
			duration: ex.duration || null,
			restTime: inferRestTime(ex),
			videoUrl: ex.videoUrl,
			thumbnailUrl: generateThumbnailUrl(ex.videoUrl),
			progress: ex.progress,
			side: inferSide(ex.name),
		})),
	}
}

/**
 * Infer workout category from exercises
 */
function inferCategory(exercises: TrainingResponse['exercises']): Training['category'] {
	const keywords = {
		strength: ['отжимания', 'приседания', 'подтягивания', 'жим'],
		cardio: ['бег', 'прыжки', 'кардио', 'скакалка'],
		flexibility: ['растяжка', 'стретчинг', 'гибкость'],
	}

	for (const [category, words] of Object.entries(keywords)) {
		const hasCategory = exercises.some((ex) =>
			words.some((word) => ex.name.toLowerCase().includes(word))
		)
		if (hasCategory) return category as Training['category']
	}

	return 'mobility'
}

/**
 * Infer rest time based on exercise
 */
function inferRestTime(exercise: TrainingResponse['exercises'][0]): number {
	if (!exercise.isAi) return 0
	if (exercise.sets === 1) return 0

	const heavyExercises = ['отжимания', 'приседания', 'подтягивания']
	const isHeavy = heavyExercises.some((name) =>
		exercise.name.toLowerCase().includes(name)
	)

	return isHeavy ? 90 : 60
}

/**
 * Infer if exercise has sides (left/right)
 */
function inferSide(exerciseName: string): Training['exercises'][0]['side'] {
	const oneSidedKeywords = ['одной', 'правой', 'левой', 'сторон']
	const hasOneSided = oneSidedKeywords.some((kw) =>
		exerciseName.toLowerCase().includes(kw)
	)

	return hasOneSided ? 'left' : 'both'
}

/**
 * Generate thumbnail URL from video URL
 */
function generateThumbnailUrl(videoUrl: string): string {
	return videoUrl.replace(/\.mp4$/, '_thumb.jpg')
}

/**
 * Get equipment image by name
 * Returns placeholder URL - actual equipment images to be implemented
 */
function getEquipmentImage(name: string): string {
	const normalized = name.toLowerCase().trim()

	// Mapping equipment names to placeholder identifiers
	const equipmentMap: Record<string, string> = {
		коврик: 'mat',
		гантели: 'dumbbells',
		резинка: 'band',
		скакалка: 'rope',
		фитбол: 'fitball',
		турник: 'pullup_bar',
	}

	for (const [key, identifier] of Object.entries(equipmentMap)) {
		if (normalized.includes(key)) {
			return `equipment/${identifier}`
		}
	}

	return 'equipment/default'
}
