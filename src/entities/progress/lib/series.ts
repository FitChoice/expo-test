import { lightFormat, parse } from 'date-fns'

import type { ProgressPhoto, ProgressSeries, ProgressSide } from '@/entities/progress/model/types'

export const PROGRESS_SIDE_ORDER: ProgressSide[] = ['front', 'left', 'right', 'back']

export const formatDateId = (value: Date) => lightFormat(value, 'dd.MM.yyyy')

const parseDateId = (value: string) => parse(value, 'dd.MM.yyyy', new Date())

const getDateIdFromIso = (isoDate: string) => formatDateId(new Date(isoDate))

export const groupPhotosByDate = (photos: ProgressPhoto[]): ProgressSeries[] => {
	const grouped = new Map<string, ProgressPhoto[]>()

	for (const photo of photos) {
		const dateId = getDateIdFromIso(photo.createdAt)
		const current = grouped.get(dateId) ?? []
		current.push(photo)
		grouped.set(dateId, current)
	}

	return Array.from(grouped.entries())
		.sort(([a], [b]) => Number(parseDateId(b)) - Number(parseDateId(a)))
		.map(([dateId, items]) => ({
			dateId,
			photos: PROGRESS_SIDE_ORDER.map((side) => items.find((item) => item.side === side)).filter(
				Boolean
			) as ProgressPhoto[],
		}))
}


