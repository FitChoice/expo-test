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
