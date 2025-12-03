import { type Exercise } from '@/features/training/api/trainingApi'
import { type ViewProps } from 'react-native'

export interface ExerciseInfoCardProps extends ViewProps {
	exercise: Exercise
}
