/**
 * Training Session Screen
 * Управляет всем flow тренировки: onboarding, упражнения, rest и т.д.
 * Использует state machine для управления переходами между состояниями
 */

import { View, ActivityIndicator, Text } from 'react-native'
import { useTrainingStore } from '@/entities/training'
import { OnboardingFlow, ExerciseFlow } from '@/widgets/training-session'
import TrainingReportScreen from './report'


export default function TrainingSessionScreen() {
	const training = useTrainingStore((state) => state.training)
	const status = useTrainingStore((state) => state.status)


	// If training data is not loaded, show loading
	if (!training) {
		return (
			<View className="bg-background-primary flex-1 items-center justify-center">
				<ActivityIndicator size="large" color="#9333EA" />
			</View>
		)
	}


	// Render based on current status
	switch (status) {
		case 'onboarding':
			return <OnboardingFlow />

		case 'finished':

			return <View className="bg-background-primary flex-1 items-center justify-center" ><Text>finished</Text>
						</View>

			case 'report':
				return <TrainingReportScreen />

			case 'analytics':
					return <View className="bg-background-primary flex-1 items-center justify-center" >
						<Text>Analytics</Text>
						</View>

		default:
			return (
				<ExerciseFlow	/>
				)
	}
}
