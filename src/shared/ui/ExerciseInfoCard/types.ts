import { type Exercise } from '@/entities/training'
import { type ViewProps } from 'react-native'

export interface ExerciseInfoCardProps extends ViewProps {
	exercise: Exercise
}
