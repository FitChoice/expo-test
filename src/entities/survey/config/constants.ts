import { SelectOption } from '@/shared/types'
import type {
	Gender as _Gender,
	DayOfWeek as _DayOfWeek,
	Frequency as _Frequency,
	Goal as _Goal,
	Direction as _Direction,
	AgeGroup as _AgeGroup,
} from '../model/types'

// Опции для выбора пола
export const GENDER_OPTIONS: SelectOption[] = [
	{ value: 'male', label: 'Мужчина' },
	{ value: 'female', label: 'Женщина' },
]

// Опции для дней недели
export const DAYS_OF_WEEK_OPTIONS: SelectOption[] = [
	{ value: 'monday', label: 'Понедельник' },
	{ value: 'tuesday', label: 'Вторник' },
	{ value: 'wednesday', label: 'Среда' },
	{ value: 'thursday', label: 'Четверг' },
	{ value: 'friday', label: 'Пятница' },
	{ value: 'saturday', label: 'Суббота' },
	{ value: 'sunday', label: 'Воскресенье' },
]

// Опции для частоты тренировок
export const FREQUENCY_OPTIONS: SelectOption[] = [
	{ value: 'never', label: 'Не тренируюсь' },
	{ value: 'sometimes', label: 'Иногда двигаюсь' },
	{ value: '2-3times', label: '2-3 раза в неделю' },
	{ value: 'almost_daily', label: 'Почти каждый день' },
]

// Опции для целей тренировок
export const GOAL_OPTIONS: SelectOption[] = [
	{ value: 'posture', label: 'Улучшить осанку' },
	{ value: 'pain_relief', label: 'Избавиться от боли' },
	{ value: 'flexibility', label: 'Развить гибкость' },
	{ value: 'strength', label: 'Укрепить мышцы' },
	{ value: 'weight_loss', label: 'Сбросить вес' },
	{ value: 'stress_relief', label: 'Снять стресс' },
	{ value: 'energy', label: 'Повысить энергию' },
	{ value: 'wellness', label: 'Общее оздоровление' },
]

// Опции для направлений тренировок
export const DIRECTION_OPTIONS: SelectOption[] = [
	{ value: 'strength', label: 'Силовые тренировки' },
	{ value: 'cardio', label: 'Кардио' },
	{ value: 'stretching', label: 'Растяжка' },
	{ value: 'back_health', label: 'Здоровая спина' },
]

// Опции для возрастных групп
export const AGE_GROUP_OPTIONS: SelectOption[] = [
	{ value: 'under_18', label: 'до 18' },
	{ value: '18_24', label: '18 - 24' },
	{ value: '25_34', label: '25 - 34' },
	{ value: '35_44', label: '35 - 44' },
	{ value: '45_54', label: '45 - 54' },
	{ value: '55_64', label: '55 - 64' },
	{ value: '65_plus', label: '65+' },
]
