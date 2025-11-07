/**
 * Training Session Screen
 * Управляет всем flow тренировки: onboarding, упражнения, rest и т.д.
 * Использует state machine для управления переходами между состояниями
 */

import { View, ActivityIndicator } from 'react-native'
import { useState } from 'react'
import { router } from 'expo-router'
import { useTrainingStore } from '@/entities/training'
import { OnboardingFlow, ExerciseFlow } from '@/widgets/training-session'
import { PauseModal, StopModal } from '@/widgets/training-session/ui/modals'

export default function TrainingSessionScreen() {
	const training = useTrainingStore((state) => state.training)
	const status = useTrainingStore((state) => state.status)
	const resume = useTrainingStore((state) => state.resume)
	const stop = useTrainingStore((state) => state.stop)

	const [showStopModal, setShowStopModal] = useState(false)

	const handlePauseResume = () => {
		resume()
	}

	const handlePauseStop = () => {
		stop()
		router.back()
	}

	const handleStopConfirm = () => {
		stop()
		router.back()
	}

	const handleStopCancel = () => {
		setShowStopModal(false)
	}

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
			
		case 'running':
			return (
				<>
					<ExerciseFlow />
					<StopModal
						visible={showStopModal}
						onConfirm={handleStopConfirm}
						onCancel={handleStopCancel}
					/>
				</>
			)

		case 'paused':
			return (
				<>
					<ExerciseFlow />
					<PauseModal
						visible={true}
						onResume={handlePauseResume}
						onStop={handlePauseStop}
					/>
				</>
			)

		case 'finished':
			// Navigate to report automatically handled in ExerciseFlow
			return <View className="bg-background-primary flex-1 items-center justify-center" />

		default:
			return (
				<View className="bg-background-primary flex-1 items-center justify-center">
					<ActivityIndicator size="large" color="#9333EA" />
				</View>
			)
	}
}
