import type { StatKind } from '@/features/stats'

export type WellbeingMetric = Extract<
	StatKind,
	'mood' | 'wellbeing' | 'energy' | 'sleep_quality'
>

export interface MetricOption {
	key: WellbeingMetric
	label: string
}

export const WELLBEING_METRICS: MetricOption[] = [
	{ key: 'mood', label: 'Настроение' },
	{ key: 'wellbeing', label: 'Самочувствие' },
	{ key: 'energy', label: 'Уровень энергии' },
	{ key: 'sleep_quality', label: 'Качество сна' },
]

export const getMetricLabel = (key: WellbeingMetric): string => {
	return WELLBEING_METRICS.find((metric) => metric.key === key)?.label ?? key
}

export type BodyMetric = Extract<
	StatKind,
	| 'weight'
	| 'forearm_circumference'
	| 'neck_circumference'
	| 'chest_circumference'
	| 'waist_circumference'
	| 'hip_circumference'
	| 'thigh_circumference'
	| 'shin_circumference'
>

export interface BodyMetricOption {
	key: BodyMetric
	label: string
	unit: 'кг' | 'см'
}

export const BODY_METRICS: BodyMetricOption[] = [
	{ key: 'weight', label: 'Вес', unit: 'кг' },
	{ key: 'forearm_circumference', label: 'Объем предплечья', unit: 'см' },
	{ key: 'neck_circumference', label: 'Обхват шеи', unit: 'см' },
	{ key: 'chest_circumference', label: 'Обхват груди', unit: 'см' },
	{ key: 'waist_circumference', label: 'Обхват талии', unit: 'см' },
	{ key: 'hip_circumference', label: 'Обхват бедер', unit: 'см' },
	{ key: 'thigh_circumference', label: 'Обхват бедра', unit: 'см' },
	{ key: 'shin_circumference', label: 'Обхват голени', unit: 'см' },
]

export const getBodyMetricLabel = (key: BodyMetric): string => {
	return BODY_METRICS.find((metric) => metric.key === key)?.label ?? key
}

export const getBodyMetricUnit = (key: BodyMetric): string => {
	return BODY_METRICS.find((metric) => metric.key === key)?.unit ?? ''
}
