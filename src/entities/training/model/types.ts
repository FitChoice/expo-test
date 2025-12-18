// entities/training/model/types.ts

export type ExerciseType = 'ai' | 'timer'
export type ExerciseSide = 'left' | 'right' | 'both'
export type WorkoutCategory = 'strength' | 'cardio' | 'flexibility' | 'mobility'
export type TrainingStatus =
	| 'idle'
	| 'info'
	| 'onboarding'
	| 'running'
	| 'finished'
	| 'report'
	| 'analytics'

export const equipment = {
	1: '/src/assets/images/equipment/1.png',
	2: '/src/assets/images/equipment/2.png',
	3: '/src/assets/images/equipment/3.png',
	4: '/src/assets/images/equipment/4.png',
	5: '/src/assets/images/equipment/5.png',
	6: '/src/assets/images/equipment/6.png',
	7: '/src/assets/images/equipment/7.png',
	8: '/src/assets/images/equipment/8.png',
	9: '/src/assets/images/equipment/9.png',
	10: '/src/assets/images/equipment/10.png',
	11: '/src/assets/images/equipment/11.png',
}

export interface Activity {
	duration: number
	experience: number
	id: number
	progress: number[]
	type: string
}

export interface ActivitiesResponseItem {
	activities: Activity[]
	date: string
	id: number
	period_id: number
	user_id: number
}

export type ExerciseDetails = {
	duration: number
	error_codes: number[]
	id: number
	is_ai: boolean
	is_horizontal: boolean
	is_mirror: boolean
	layout: string
	name: string
	progress: number
	reps: number
	rest_after_exercise: number
	rest_between_sets: number
	sets: number
	video_practice: string
	video_practice_second: string
	video_theory: string
	working_side: string
	working_side_second: string
}

export type ActivitiesResponse = ActivitiesResponseItem[]

export interface Exercise {
	id: number
	is_ai: boolean
	name: string
	progress: number
	reps: number
	sets: number
}

export interface ExerciseInfoResponse {
	duration: number
	error_codes: number[]
	id: number
	is_ai: boolean
	is_horizontal: boolean
	is_mirror: boolean
	layout: string
	name: string
	progress: number
	reps: number
	rest_after_exercise: number
	rest_between_sets: number
	sets: number
	video_practice: string
	video_practice_second: string
	video_theory: string
	working_side: string
	working_side_second: string
}

export interface Training {
	description: string
	difficulty: number
	exercises: Exercise[]
	experience: number
	id: number
	inventory: number[]
	title: string
	trainingType: string
}

export interface Report {
	report_active_time: number
	report_cals: number
	report_duration: number
	report_technique_quality: number
}

/**
 * API payloads (domain-level request DTOs)
 * Keep here to avoid shared/ui or widgets depending on features/api layer.
 */
export interface CompleteTrainingInput {
	report_active_time: number
	report_cals: number
	report_duration: number
	report_technique_quality: number
	time: string // ISO
	training_id: number
}

export interface ExecuteExerciseInput {
	id: number
	quality: number
	recorded_errors: number[]
	reps: number
	training_id: number
}

/**
 * Прогресс выполнения упражнения
 */
export interface ExerciseProgressData {
	training_id: number
	index: number
	reps: number
}

/**
 * Состояние сессии тренировки (для resume)
 */
export interface SavedWorkoutState {
	trainingId: string
	currentExerciseIndex: number
	currentSet: number
	currentReps: number
	currentSide: ExerciseSide | null
	elapsedTime: number
	completedExercises: number[]
	pausedAt: string
}

/**
 * Лог ошибки техники выполнения
 */
export interface ErrorLog {
	id: string
	exerciseId: string
	exerciseName: string
	timestamp: number
	set: number
	rep: number
	type: ErrorType
	description: string
	severity: 1 | 2 | 3
}

export type ErrorType =
	| 'insufficient_depth'
	| 'body_not_aligned'
	| 'asymmetric_movement'
	| 'excessive_range'
	| 'timing_issue'
	| 'posture_error'

/**
 * Расширенный отчет с деталями (хранится локально)
 */
export interface ExtendedReport {
	trainingId: string
	completed_at: string
	total_reps: number
	exercises: ExerciseReport[]
	errors: ErrorLog[]
}

/**
 * Отчет по отдельному упражнению
 */
export interface ExerciseReport {
	exerciseId: string
	exerciseName: string
	thumbnailUrl: string
	completedSets: number
	totalReps: number
	formQuality: number
	errors: ErrorLog[]
}

/**
 * Данные landmark'ов для pose detection
 */
export interface PoseLandmark {
	x: number
	y: number
	z: number
	visibility: number
}

/**
 * Данные детального set'а (хранится локально)
 */
export interface SetData {
	exerciseIndex: number
	setNumber: number
	reps: number
	formQuality: number
	elapsedTime: number
	errors: ErrorLog[]
}
