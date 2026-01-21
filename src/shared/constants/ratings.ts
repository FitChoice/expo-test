import type { ComponentType } from 'react'

import Emo1 from '@/assets/images/moods/emo1.svg'
import Emo2 from '@/assets/images/moods/emo2.svg'
import Emo3 from '@/assets/images/moods/emo3.svg'
import Emo4 from '@/assets/images/moods/emo4.svg'
import Emo5 from '@/assets/images/moods/emo5.svg'

export interface RatingOption {
	id: number
	Icon: ComponentType<{ width?: number; height?: number; color?: string }>
	color: string
}

export const RATING_OPTIONS: RatingOption[] = [
	{ id: 1, Icon: Emo1, color: '#FF4B6E' },
	{ id: 2, Icon: Emo2, color: '#FF69B4' },
	{ id: 3, Icon: Emo3, color: '#FFB800' },
	{ id: 4, Icon: Emo4, color: '#6B7280' },
	{ id: 5, Icon: Emo5, color: '#10B981' },
]

export const getRatingOption = (id: number): RatingOption => {
	return RATING_OPTIONS.find((option) => option.id === id) ?? RATING_OPTIONS[2]
}
