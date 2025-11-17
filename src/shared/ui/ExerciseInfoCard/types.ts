import { ViewProps } from 'react-native'

export interface ExerciseInfoCardProps extends ViewProps {
	/** Название упражнения */
	name: string
	/** Количество подходов */
	sets: string
	/** Количество повторений */
	reps: string
	/** Показывать ли тег "AI-анализ" */
	isAi?: boolean
}

