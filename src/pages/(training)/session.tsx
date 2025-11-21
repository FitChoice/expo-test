/**
 * Training Session Screen
 * Управляет всем flow тренировки: onboarding, упражнения, rest и т.д.
 * Использует state machine для управления переходами между состояниями
 */

import { View, ActivityIndicator, Text } from 'react-native'
import { useTrainingStore } from '@/entities/training'
import { OnboardingFlow, ExerciseFlow } from '@/widgets/training-session'
import TrainingReportScreen from './report'
import { TrainingInfo } from '@/widgets/training-session/ui/TrainingInfo'
import { usePoseCameraSetup } from '@/widgets/pose-camera'

export default function TrainingSessionScreen() {
    const training = useTrainingStore((state) => state.training)
    const status = useTrainingStore((state) => state.status)
    const { tfReady, model, orientation, error } = usePoseCameraSetup()

    // If training data is not loaded or camera is not ready, show loading
    if (!training || !tfReady || !model || !orientation) {
        return (
            <View className="bg-background-primary flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#9333EA" />
                {error && <Text className="mt-4 text-red-500">Error: {error.message}</Text>}
            </View>
        )
    }

    // Render based on current status
    switch (status) {
    case 'info':
        return  <TrainingInfo />
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
            <ExerciseFlow model={model} orientation={orientation} />
        )
    }
}
