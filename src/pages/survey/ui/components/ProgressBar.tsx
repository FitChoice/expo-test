import React from 'react'
import { View } from 'react-native'

interface ProgressBarProps {
	currentStep: number
	totalSteps: number
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep }) => {
    const getProgressWidth = () => {
        const progressSteps = [28, 56, 84, 112, 140, 168, 196, 224, 252, 280, 308, 336, 364]
        return progressSteps[currentStep - 1] || 28
    }

    return (
        <View className="mt-4 px-5">
            <View className="h-1 w-[364px] rounded-sm bg-[rgba(255,255,255,0.2)]">
                <View
                    className="bg-brand-purple h-1 rounded-sm"
                    style={{ width: getProgressWidth() }}
                />
            </View>
        </View>
    )
}
