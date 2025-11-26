/**
 * OnboardingFlow widget
 * Управляет onboarding процессом перед началом тренировки
 * Включает проверку звука, разрешений камеры, положения телефона и калибровку гироскопа
 */

import { useState } from 'react'
import { SoundCheckScreen } from './onboarding/SoundCheckScreen'
import { CameraPermissionScreen } from './onboarding/CameraPermissionScreen'
import { PhonePositionScreen } from './onboarding/PhonePositionScreen'
import { GyroscopeLevelScreen } from './onboarding/GyroscopeLevelScreen'
import { RotatePhoneScreen } from './onboarding/RotatePhoneScreen'
import { useTrainingStore } from '@/entities/training'
import { View } from 'react-native'

type OnboardingStep = 'sound' | 'camera' | 'position' | 'gyroscope' | 'rotate'

export function OnboardingFlow() {
    const [currentStep, setCurrentStep] = useState<OnboardingStep>('sound')
    const resume = useTrainingStore((state) => state.resume)
    const training = useTrainingStore((state) => state.training)
    // Проверяем первое упражнение на isVertical
    const firstExercise = training?.exercises[0]

    const handleNextStep = () => {
        switch (currentStep) {
        case 'sound':
            setCurrentStep('camera')
            break
        case 'camera': {

            if (firstExercise && !firstExercise.isVertical) {
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
        <View className="flex-1 w-full">
            {currentStep === 'sound' && <SoundCheckScreen onNext={handleNextStep} />}
            {currentStep === 'camera' && <CameraPermissionScreen onNext={handleNextStep} />}
            {currentStep === 'rotate' && <RotatePhoneScreen onNext={handleNextStep} />}
            {currentStep === 'position' && <PhonePositionScreen onNext={handleNextStep} />}
            {currentStep === 'gyroscope' && <GyroscopeLevelScreen onNext={handleNextStep}  isVertical={firstExercise?.isVertical ?? false} />}
        </View>
    )
}
