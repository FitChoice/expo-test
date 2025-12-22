import * as FileSystem from 'expo-file-system/legacy'

import type {
	ProgressPhoto,
	ProgressSide,
	TempCapturedPhoto,
} from '@/entities/progress/model/types'

const META_FILENAME = 'index.json'
const BASE_DIR_NAME = 'progress'

const makeId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

const getUserBaseDir = (userId: string) =>
	`${FileSystem.documentDirectory}${BASE_DIR_NAME}/${userId}/`
const getSideDir = (userId: string, side: ProgressSide) =>
	`${getUserBaseDir(userId)}${side}/`
const getMetaPath = (userId: string) => `${getUserBaseDir(userId)}${META_FILENAME}`

const ensureDir = async (dir: string) => {
	const info = await FileSystem.getInfoAsync(dir)
	if (!info.exists) {
		await FileSystem.makeDirectoryAsync(dir, { intermediates: true })
	}
}

const readMeta = async (userId: string): Promise<ProgressPhoto[]> => {
	const path = getMetaPath(userId)
	const info = await FileSystem.getInfoAsync(path)
	if (!info.exists) return []

	try {
		const content = await FileSystem.readAsStringAsync(path)
		const parsed = JSON.parse(content) as ProgressPhoto[]
		return Array.isArray(parsed) ? parsed : []
	} catch {
		return []
	}
}

const writeMeta = async (userId: string, photos: ProgressPhoto[]) => {
	await ensureDir(getUserBaseDir(userId))
	await FileSystem.writeAsStringAsync(getMetaPath(userId), JSON.stringify(photos))
}

const buildTargetUri = (userId: string, side: ProgressSide, id: string, ext?: string) => {
	const extension = ext || '.jpg'
	return `${getSideDir(userId, side)}${id}${extension}`
}

export const listProgressPhotos = async (userId: string): Promise<ProgressPhoto[]> => {
	const meta = await readMeta(userId)
	const validated: ProgressPhoto[] = []

	for (const photo of meta) {
		const info = await FileSystem.getInfoAsync(photo.uri)
		if (info.exists) {
			validated.push(photo)
		}
	}

	// Если были битые ссылки — сохраняем обновленный список
	if (validated.length !== meta.length) {
		await writeMeta(userId, validated)
	}

	return validated
}

type SaveBatchParams = {
	userId: string
	items: TempCapturedPhoto[]
	replaceStrategy?: 'last-per-side' | 'append'
	saveToGallery?: (uri: string) => Promise<void> | void
}

export const saveProgressBatch = async ({
	userId,
	items,
	replaceStrategy = 'last-per-side',
	saveToGallery,
}: SaveBatchParams): Promise<ProgressPhoto[]> => {
	if (!items.length) return []

	const meta = await readMeta(userId)
	const bySide =
		replaceStrategy === 'last-per-side'
			? meta.filter((item) => !items.some((p) => p.side === item.side))
			: [...meta]

	const saved: ProgressPhoto[] = []

	for (const item of items) {
		await ensureDir(getSideDir(userId, item.side))

		const id = makeId()
		const extMatch = item.tempUri.match(/\.[a-zA-Z0-9]+$/)
		const targetUri = buildTargetUri(userId, item.side, id, extMatch?.[0])

		await FileSystem.moveAsync({ from: item.tempUri, to: targetUri })

		const photo: ProgressPhoto = {
			id,
			side: item.side,
			uri: targetUri,
			createdAt: new Date().toISOString(),
			width: item.width,
			height: item.height,
			size: item.size,
		}

		saved.push(photo)
		bySide.push(photo)

		if (saveToGallery) {
			await saveToGallery(targetUri)
		}
	}

	await writeMeta(userId, bySide)
	return saved
}

export const deleteProgressPhoto = async (userId: string, photoId: string) => {
	const meta = await readMeta(userId)
	const photo = meta.find((p) => p.id === photoId)
	if (!photo) return

	const updated = meta.filter((p) => p.id !== photoId)
	await writeMeta(userId, updated)

	const info = await FileSystem.getInfoAsync(photo.uri)
	if (info.exists) {
		await FileSystem.deleteAsync(photo.uri, { idempotent: true })
	}
}

export const resetProgressPhotos = async (userId: string) => {
	const baseDir = getUserBaseDir(userId)
	const info = await FileSystem.getInfoAsync(baseDir)

	if (info.exists) {
		await FileSystem.deleteAsync(baseDir, { idempotent: true })
	}
}

