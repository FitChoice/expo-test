/**
 * OnboardingFlow widget
 * Управляет onboarding процессом перед началом тренировки
 * Включает проверку звука, разрешений камеры, положения телефона и калибровку гироскопа
 */

import { useState } from 'react'
import { useTrainingStore } from '@/entities/training'
import { View } from 'react-native'
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

    const [currentStep, setCurrentStep] = useState<OnboardingStep>('sound')
    const resume = useTrainingStore((state) => state.resume)
    const currentExerciseDetail = useTrainingStore((state) => state.currentExerciseDetail)

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
