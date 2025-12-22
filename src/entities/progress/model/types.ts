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

export type TempCapturedPhoto = {
	side: ProgressSide
	tempUri: string
	width: number
	height: number
	size?: number
}

