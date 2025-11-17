import { ReactNode } from 'react'
import { ViewProps } from 'react-native'

export interface TrainingTagsProps extends ViewProps {
	/** Иконка для первого тега (опционально) */
	icon1?: ReactNode | null
	/** Текст для первого тега */
	title1: string
	/** Иконка для второго тега (опционально) */
	icon2?: ReactNode | null
	/** Текст для второго тега */
	title2: string
}

