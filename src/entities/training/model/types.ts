// entities/training/model/types.ts

export type ExerciseType = 'ai' | 'timer'
export type ExerciseSide = 'left' | 'right' | 'both'
export type WorkoutCategory = 'strength' | 'cardio' | 'flexibility' | 'mobility'
export type TrainingStatus = 'idle' | 'onboarding' | 'running' | 'paused' | 'finished'



export interface Activity {
	duration: number;
	experience: number;
	id: number;
	progress: number[];
	type: string;
  }
  
export interface ActivitiesResponseItem {
	activities: Activity[];
	date: string;
	id: number;
	period_id: number;
	user_id: number;
  }
  
export type ActivitiesResponse = ActivitiesResponseItem[];


/**
 * Основная структура тренировки
 */
export interface Training {
	trainingId: string
	title: string
	description: string
	category: WorkoutCategory
	experiencePoints: number
	inventory: Equipment[]
	exercises: Exercise[]
}

/**
 * Инвентарь для тренировки
 */
export interface Equipment {
	id: string
	name: string
	imageUrl: string
	isRequired?: boolean
}

/**
 * Упражнение в тренировке
 */
export interface Exercise {
	id: string
	name: string
	type: ExerciseType
	sets: number
	reps: number | null
	duration: number | null
	restTime: number
	videoUrl: string
	thumbnailUrl: string
	progress: number
	side?: ExerciseSide
}

/**
 * Отчет о выполненной тренировке
 */
export interface Report {
	reportId?: string
	completedAt: string
	title: string
	category: WorkoutCategory
	experienceGained: number
	report_duration: number
	report_active_time: number
	report_cals: number
	report_technique_quality: number | null
}

/**
 * Данные для создания отчета (без generated полей)
 */
export interface ReportData {
	training_id: number
	report_duration: number
	report_active_time: number
	report_cals: number
	report_technique_quality: number
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
