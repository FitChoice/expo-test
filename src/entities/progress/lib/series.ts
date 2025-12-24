import { lightFormat, parse } from 'date-fns'

import type {
	ProgressPhoto,
	ProgressSide,
	ProgressSeries,
} from '@/entities/progress/model/types'

export const PROGRESS_SIDE_ORDER: ProgressSide[] = ['front', 'left', 'right', 'back']

export const formatDateId = (value: Date) => lightFormat(value, 'dd.MM.yyyy')

const parseDateId = (value: string) => parse(value, 'dd.MM.yyyy', new Date())

const getDateIdFromIso = (isoDate: string) => formatDateId(new Date(isoDate))

const sortByCreatedAtDesc = (items: ProgressPhoto[]) =>
	[...items].sort(
		(a, b) => Number(new Date(b.createdAt)) - Number(new Date(a.createdAt)),
	)

type BatchInternal = {
	dateId: string
	batchId: string
	photos: ProgressPhoto[]
	createdAt: string
}

export const groupPhotosByBatches = (photos: ProgressPhoto[]): ProgressSeries[] => {
	const grouped = new Map<string, Map<string, ProgressPhoto[]>>()

	for (const photo of photos) {
		const dateId = getDateIdFromIso(photo.createdAt)
		const byDate = grouped.get(dateId) ?? new Map<string, ProgressPhoto[]>()
		const batchItems = byDate.get(photo.batchId) ?? []
		batchItems.push(photo)
		byDate.set(photo.batchId, batchItems)
		grouped.set(dateId, byDate)
	}

	const batches: BatchInternal[] = []

	for (const [dateId, batchesMap] of grouped.entries()) {
		for (const [batchId, items] of batchesMap.entries()) {
			const latestPerSide = new Map<ProgressSide, ProgressPhoto>()
			const orderedByTime = sortByCreatedAtDesc(items)
			for (const item of orderedByTime) {
				if (!latestPerSide.has(item.side)) {
					latestPerSide.set(item.side, item)
				}
			}
			const orderedBySide = PROGRESS_SIDE_ORDER.map((side) => latestPerSide.get(side)).filter(
				Boolean,
			) as ProgressPhoto[]
			const photosLimited = orderedBySide.slice(0, 4)
			const createdAt = photosLimited[0]?.createdAt ?? new Date().toISOString()
			batches.push({
				dateId,
				batchId,
				photos: photosLimited,
				createdAt,
			})
		}
	}

	return batches
		.sort(
			(a, b) =>
				Number(parseDateId(b.dateId)) - Number(parseDateId(a.dateId)) ||
				Number(new Date(b.createdAt)) - Number(new Date(a.createdAt)),
		)
		.map(({ createdAt: _createdAt, ...rest }) => rest)
}


