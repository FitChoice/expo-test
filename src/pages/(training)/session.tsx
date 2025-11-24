/**
 * Training Session Screen
 * Управляет всем flow тренировки: onboarding, упражнения, rest и т.д.
 * Использует state machine для управления переходами между состояниями
 */

import { Text } from 'react-native'
import { useTrainingStore } from '@/entities/training'
import TrainingReportScreen from './report'
import { usePoseCameraSetup } from '@/widgets/pose-camera'
import { Loader } from '@/shared/ui/Loader/Loader'
import { BackgroundLayoutNoSidePadding } from '@/shared/ui'
import {
    TrainingAnalytics
} from '@/widgets/training-session/ui/TrainingAnalytics'
import { TrainingInfo } from '@/widgets/training-session/ui/TrainingInfo'
import { ExerciseFlow, OnboardingFlow } from '@/widgets/training-session'
import { ExerciseSuccess } from '@/widgets/training-session/ui/ExerciseSuccess'

export default function TrainingSessionScreen() {
    const training = useTrainingStore((state) => state.training)
    const status = useTrainingStore((state) => state.status)
    const { tfReady, model, orientation, error } = usePoseCameraSetup()

    // If training data is not loaded or camera is not ready, show loading
    if (!training || !tfReady || !model || !orientation) {
        return (
            <>
                {error ? <Text>{error.message}</Text>  :
                    <Loader text="Загрузка тренировки..." />}
            </>
        )
    }

    const mainContent = () => {
        //   Render based on current status
        switch (status) {
        case 'info':
            return <TrainingInfo />
        case 'onboarding':
            return <BackgroundLayoutNoSidePadding>
                <OnboardingFlow />
            </BackgroundLayoutNoSidePadding>

        case 'finished':
            return <BackgroundLayoutNoSidePadding>
                <ExerciseSuccess  />
            </BackgroundLayoutNoSidePadding>

        case 'report':
            return <BackgroundLayoutNoSidePadding>
	        <TrainingReportScreen />
	    </BackgroundLayoutNoSidePadding>

        case 'analytics':
            return <BackgroundLayoutNoSidePadding>
	        <TrainingAnalytics />
	    </BackgroundLayoutNoSidePadding>

        default:
            return (<BackgroundLayoutNoSidePadding>
                <ExerciseFlow model={model} orientation={orientation} />
            </BackgroundLayoutNoSidePadding>)
        }

    }

    return mainContent()

}
