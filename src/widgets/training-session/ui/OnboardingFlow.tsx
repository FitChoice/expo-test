/**
 * OnboardingFlow widget
 * Управляет onboarding процессом перед началом тренировки
 * Включает проверку звука, разрешений камеры, положения телефона и калибровку гироскопа
 */

import { useEffect, useState } from 'react'
import { useTrainingStore } from '@/entities/training'
import { View } from 'react-native'
import { trainingApi } from '@/features/training/api'
import { Loader } from '@/shared/ui'
import {
    SoundCheckScreen
} from '@/widgets/training-session/ui/onboarding/SoundCheckScreen'
import {
    CameraPermissionScreen
} from '@/widgets/training-session/ui/onboarding/CameraPermissionScreen'
import {
    RotatePhoneScreen
} from '@/widgets/training-session/ui/onboarding/RotatePhoneScreen'
import {
    PhonePositionScreen
} from '@/widgets/training-session/ui/onboarding/PhonePositionScreen'
import {
    GyroscopeLevelScreen
} from '@/widgets/training-session/ui/onboarding/GyroscopeLevelScreen'

type OnboardingStep = 'sound' | 'camera' | 'position' | 'gyroscope' | 'rotate'

export function OnboardingFlow() {
	
    const [isLoading, setIsLoading] = useState(true)
    const [currentStep, setCurrentStep] = useState<OnboardingStep>('sound')
    const resume = useTrainingStore((state) => state.resume)
    const training = useTrainingStore((state) => state.training)
    const currentExerciseDetail = useTrainingStore((state) => state.currentExerciseDetail)
    const currentExerciseId = useTrainingStore((state) => state.currentExerciseId)
    const setExerciseDetail = useTrainingStore((state) => state.setExerciseDetail)

    useEffect(() => {
			
	 trainingApi.getExerciseInfo(String(training!.id), currentExerciseId!)
		 .then((result) => {
			 console.log('result', result)
			 if (result.success) {
			
				 setExerciseDetail(result.data)
				 setIsLoading(false)
			 } else {
				 throw new Error(result.error)
			 }
		 })
		 .catch((error) => {console.error(error)})
		 .finally(() => {	 setIsLoading(false)})
    }, [])
    // Проверяем первое упражнение на isVertical

    const handleNextStep = () => {
        switch (currentStep) {
        case 'sound':
            setCurrentStep('camera')
            break
        case 'camera': {
            if (currentExerciseDetail?.is_horizontal) {
                setCurrentStep('rotate')
            } else {
                setCurrentStep('position')
            }
            break
        }
        case 'rotate':
            setCurrentStep('gyroscope')
            break
        case 'position':
            setCurrentStep('gyroscope')
            break
        case 'gyroscope':
            // Onboarding complete, transition to exercise preparation
            resume() // This will change status from 'onboarding' to 'running'
            break
        }
    }
		
    if (isLoading) {
        return <Loader  />
    }
    return (
        <View className="w-full flex-1">
            {currentStep === 'sound' && <SoundCheckScreen onNext={handleNextStep} />}
            {currentStep === 'camera' && <CameraPermissionScreen onNext={handleNextStep} />}
            {currentStep === 'rotate' && <RotatePhoneScreen onNext={handleNextStep} />}
            {currentStep === 'position' && <PhonePositionScreen onNext={handleNextStep} />}
            {currentStep === 'gyroscope' && (
                <GyroscopeLevelScreen
                    onNext={handleNextStep}
                    isVertical={!currentExerciseDetail?.is_horizontal}
                />
            )}
        </View>
    )
}
