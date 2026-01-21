import type { DayOfWeek, Goal } from '../model/types'

// Битовая маска дней недели: 1=Пн, 2=Вт, 4=Ср, 8=Чт, 16=Пт, 32=Сб, 64=Вс
export const DAY_MASKS: Record<DayOfWeek, number> = {
	monday: 1,
	tuesday: 2,
	wednesday: 4,
	thursday: 8,
	friday: 16,
	saturday: 32,
	sunday: 64,
}

const MASK_TO_DAY: Record<number, DayOfWeek> = {
	1: 'monday',
	2: 'tuesday',
	4: 'wednesday',
	8: 'thursday',
	16: 'friday',
	32: 'saturday',
	64: 'sunday',
}

// Битовая маска целей: 1=Осанка, 2=Боль, 4=Гибкость, 8=Укрепление, 16=Сброс веса, 32=Стресс, 64=Энергия, 128=Самочувствие
export const GOAL_MASKS: Record<Goal, number> = {
	posture: 1,
	pain_relief: 2,
	flexibility: 4,
	strength: 8,
	weight_loss: 16,
	stress_relief: 32,
	energy: 64,
	wellness: 128,
}

const MASK_TO_GOAL: Record<number, Goal> = {
	1: 'posture',
	2: 'pain_relief',
	4: 'flexibility',
	8: 'strength',
	16: 'weight_loss',
	32: 'stress_relief',
	64: 'energy',
	128: 'wellness',
}

export const daysToMasks = (days: DayOfWeek[]): number[] => {
	return days.map((day) => DAY_MASKS[day])
}

export const masksToDays = (masks: number[]): DayOfWeek[] => {
	return masks.map((mask) => MASK_TO_DAY[mask]).filter(Boolean)
}

export const goalsToMasks = (goals: Goal[]): number[] => {
	return goals.map((goal) => GOAL_MASKS[goal])
}

export const masksToGoals = (masks: number[]): Goal[] => {
	return masks.map((mask) => MASK_TO_GOAL[mask]).filter(Boolean)
}

export const dayBitmaskToMasks = (bitmask: number): number[] => {
	return Object.values(DAY_MASKS).filter((mask) => (bitmask & mask) === mask)
}

export const goalBitmaskToMasks = (bitmask: number): number[] => {
	return Object.values(GOAL_MASKS).filter((mask) => (bitmask & mask) === mask)
}

export const masksToNumber = (masks: number[]): number => {
	return masks.reduce((acc, mask) => acc | mask, 0)
}
