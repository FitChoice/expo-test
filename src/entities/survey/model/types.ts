// Типы ответов на вопросы опроса

export type Gender = 'male' | 'female'

export type DayOfWeek =
	| 'monday'
	| 'tuesday'
	| 'wednesday'
	| 'thursday'
	| 'friday'
	| 'saturday'
	| 'sunday'

export type Frequency = number

export type Goal =
	| 'posture' // Улучшить осанку
	| 'pain_relief' // Избавиться от боли
	| 'flexibility' // Развить гибкость
	| 'strength' // Укрепить мышцы
	| 'weight_loss' // Сбросить вес
	| 'stress_relief' // Снять стресс
	| 'energy' // Повысить энергию
	| 'wellness' // Общее оздоровление

export type Direction = number

export type AgeGroup =
	| 'under_18'
	| '18_24'
	| '25_34'
	| '35_44'
	| '45_54'
	| '55_64'
	| '65_plus'

// Полные данные опроса
export interface SurveyData {
	name: string
	gender: Gender | null
	train_days: DayOfWeek[] | number[] | number
	train_frequency: Frequency | null
	train_goals: Goal[] | number[] | number
	main_direction: Direction | null
	secondary_direction: Direction | null
	age: AgeGroup | number | null
	height: number | null
	weight: number | null
	bmi: number | null
	notif_main: boolean
}

// Результат ИМТ
export type BMICategory =
	| 'underweight_severe' // < 16.9
	| 'underweight_mild' // 17.0 - 18.4
	| 'normal' // 18.5 - 24.9
	| 'overweight' // 25.0 - 29.9
	| 'obese_1' // 30.0 - 34.9
	| 'obese_2' // 35.0 - 39.9
	| 'obese_3' // ≥ 40
