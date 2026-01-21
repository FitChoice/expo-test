import type { ComponentType } from 'react'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'

import type { ChartStat } from '@/features/stats'
import { getRatingOption } from '@/shared/constants'

export interface ChartDisplayPoint {
	key: string
	label: string
	Icon: ComponentType<{ width?: number; height?: number }>
	color: string
	height: number
	value: number
}

const HEIGHT_MULTIPLIER = 40

export const transformChartData = (
	stats: ChartStat[],
	period: 'week' | 'month'
): ChartDisplayPoint[] => {
	return stats.map((stat) => {
		const date = parseISO(stat.date)
		const rating = getRatingOption(stat.value)
		const label =
			period === 'week' ? format(date, 'EEEEEE', { locale: ru }) : format(date, 'd')

		return {
			key: stat.date,
			label,
			Icon: rating.Icon,
			color: rating.color,
			height: Math.max(stat.value * HEIGHT_MULTIPLIER, HEIGHT_MULTIPLIER),
			value: stat.value,
		}
	})
}

export const calculateAverage = (stats: ChartStat[]): number => {
	if (!stats.length) return 3
	const sum = stats.reduce((acc, item) => acc + item.value, 0)
	return Math.round(sum / stats.length)
}
