/**
 * OnboardingFlow widget
 * Управляет onboarding процессом перед началом тренировки
 * Включает проверку звука, разрешений камеры, положения телефона и калибровку гироскопа
 */

import { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { SoundCheckScreen } from './onboarding/SoundCheckScreen'
import { CameraPermissionScreen } from './onboarding/CameraPermissionScreen'
import { PhonePositionScreen } from './onboarding/PhonePositionScreen'
import { GyroscopeLevelScreen } from './onboarding/GyroscopeLevelScreen'
import { useTrainingStore } from '@/entities/training'

type OnboardingStep = 'sound' | 'camera' | 'position' | 'gyroscope'

export function OnboardingFlow() {
	const [currentStep, setCurrentStep] = useState<OnboardingStep>('sound')
	const resume = useTrainingStore((state) => state.resume)

	const handleNextStep = () => {
		switch (currentStep) {
			case 'sound':
				setCurrentStep('camera')
				break
			case 'camera':
				setCurrentStep('position')
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
		<SafeAreaView className="flex-1 bg-black" edges={['bottom']}>
			{currentStep === 'sound' && <SoundCheckScreen onNext={handleNextStep} />}
			{currentStep === 'camera' && <CameraPermissionScreen onNext={handleNextStep} />}
			{currentStep === 'position' && <PhonePositionScreen onNext={handleNextStep} />}
			{currentStep === 'gyroscope' && <GyroscopeLevelScreen onNext={handleNextStep} />}
		</SafeAreaView>
	)
}
