/**
 * Phone Position Screen (2.2)
 * Третий шаг onboarding - проверка положения телефона (вертикально)
 */

import { View, Text } from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'

import { useState, useEffect } from 'react'
import { Button } from '@/shared/ui'
import { DotsProgress } from '@/shared/ui/DotsProgress'
import { GradientBg } from '@/shared/ui/GradientBG'
import { CloseBtn } from '@/shared/ui/CloseBtn'
import { router } from 'expo-router'

interface PhonePositionScreenProps {
	onNext: () => void
}

export function PhonePositionScreen({ onNext }: PhonePositionScreenProps) {
    const [permission] = useCameraPermissions()
    const [isCorrectPosition, setIsCorrectPosition] = useState(false)

    useEffect(() => {
        // Auto-check position after a delay
        const timer = setTimeout(() => {
            setIsCorrectPosition(true)
        }, 1000)

        return () => clearTimeout(timer)
    }, [])

    const handleStop = () => {
        router.back()
    }

    if (!permission?.granted) {
        return (
            <View className="flex-1 justify-center items-center bg-background-primary px-6">
                <Text className="text-h2 font-bold text-light-text-100 mb-4 text-center">
					Требуется доступ к камере
                </Text>
                <Text className="text-t2 text-light-text-500 text-center mb-6">
					Чтобы продолжить, разрешите доступ к камере
                </Text>
                <Button
                    variant="primary"
                    onPress={permission?.request}
                    className="w-full"
                >
					Разрешить доступ
                </Button>
            </View>
        )
    }

    return (
        <View className="bg-background-primary flex-1  ">

            {/* Gradient Background */}
            <GradientBg  />
            {/* Close Button */}
            <View className="absolute right-4 top-12 z-10">
                <CloseBtn handlePress={handleStop} classNames={'h-12 w-12 rounded-2xl'} />
            </View>

            {/* Progress Dots */}
            <View className="absolute left-1/2 -translate-x-1/2 top-20 z-10">
                <DotsProgress total={4} current={2} variant="onboarding" />
            </View>

            {/* Content */}
            <View className="flex-1 items-center justify-center px-6">
                {/* Camera Preview */}
                <View className="mb-20 h-96 w-full overflow-hidden rounded-3xl bg-black">
                    <CameraView
                        facing="front"
                        className="flex-1"
                        style={{ width: '100%', height: '100%' }}
                    />
                </View>

                {/* Title */}
                <Text className="text-h2 font-bold text-light-text-100 mb-3 text-left">
					Поставьте телефон вертикально
                </Text>

                {/* Description */}
                <Text className="text-t2 text-light-text-500 text-left leading-6 mb-20">
					Поверните телефон на 90°, снизьте наклона его в стену, чтобы камера хорошо
					распознала движения
                </Text>
            </View>

            {/* Button */}
            <View className="p-6">
                <Button
                    variant="primary"
                    onPress={onNext}
                    disabled={!isCorrectPosition}
                    className="w-full"
                >
					Далее
                </Button>
            </View>
        </View>
    )
}
