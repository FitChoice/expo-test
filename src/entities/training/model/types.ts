// entities/training/model/types.ts

export type ExerciseType = 'ai' | 'timer'
export type ExerciseSide = 'left' | 'right' | 'both'
export type WorkoutCategory = 'strength' | 'cardio' | 'flexibility' | 'mobility'
export type TrainingStatus = 'idle' | 'onboarding' | 'running' | 'finished'| 'report' | 'analytics'


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


export interface Exercise {
	id: number;
	name: string;
	rest_time: number;
	duration: number;
	progress: number;
	sets: number;
	reps: number;
	isAi: boolean;
	videoUrl: string;
	isVertical: boolean; ////TEMPORARY FIELD
	side: 'both' | 'single'
}
  
export interface Training {
	id: number;
	trainingType: string;
	title: string;
	description: string;
	difficulty: number;
	experience: number;
	inventory: number[];
	exercises: Exercise[];
}
  


export interface Report {

		report_active_time: number,
		report_cals: number,
		report_duration: number,
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
