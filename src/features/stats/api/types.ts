export interface BodyStatsInput {
	chest_circumference: number
	date: string
	forearm_circumference: number
	hip_circumference: number
	neck_circumference: number
	shin_circumference: number
	user_id: number
	waist_circumference: number
	weight: number
	thigh_circumference: number
}

export interface BodyStatsResponse {
	status: string
}

export interface CalendarItem {
	completedTraining: boolean
	date: string
	filledDiary: boolean
	id: number
}

export interface CalendarResponse {
	items: CalendarItem[]
	limit: number
	page: number
	total: number
}

export interface DiaryItem {
	date: string
	id: number
}

export interface DiariesResponse {
	diaries: DiaryItem[]
	limit: number
	page: number
}

export type TrainingKind = 't' | 'w'

export interface TrainingItem {
	date: string
	duration: number
	id: number
	title: string
	type: string
}

export interface TrainingsResponse {
	limit: number,
	page: number,
	trainings: [
	  {
		date: string,
		duration: number,
		id: number,
		title: string,
		type: string
	  }
	]
  }

export interface DayDiary {
	filled: boolean
	id: number
}

export interface DayTraining {
	duration: number
	id: number
	title: string
	type: string
}

export interface DayDetailsResponse {
	date: string
	diary: DayDiary
	id: number
	trainings: DayTraining[]
}

export interface MainStatsResponse {
	cals: number
	diaries_count: number
	quality_growth: number
	streak: number
	trainings_count: number
	trainings_time: number
	warmups_count: number
}

export interface CalendarParams {
	userId: string | number
	page?: number
	limit?: number
}

export interface DiariesParams {
	userId: string | number
	page?: number
	limit?: number
}

export interface TrainingsParams {
	userId: string | number
	kind?: TrainingKind
	page?: number
	limit?: number
}

export interface DayDetailsParams {
	id: string | number
}

export interface MainStatsParams {
	userId: string | number
	date?: string
}
