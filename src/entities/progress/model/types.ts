export type ProgressSide = 'front' | 'back' | 'left' | 'right'

export type ProgressPhoto = {
	id: string
	side: ProgressSide
	uri: string
	createdAt: string
	width: number
	height: number
	size?: number
}

export type ProgressSeries = {
	dateId: string
	photos: ProgressPhoto[]
}

export type TempCapturedPhoto = {
	side: ProgressSide
	tempUri: string
	width: number
	height: number
	size?: number
}

