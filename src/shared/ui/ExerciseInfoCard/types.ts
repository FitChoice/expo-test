import { Exercise } from '@/features/training/api/trainingApi'
import { ViewProps } from 'react-native'

export interface ExerciseInfoCardProps extends ViewProps {
	exercise: Exercise
}

