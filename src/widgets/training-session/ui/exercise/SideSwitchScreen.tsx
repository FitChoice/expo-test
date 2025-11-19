/**
 * Side Switch Screen (5.4)
 * Показывается между подходами для односторонних упражнений
 * Уведомляет пользователя о необходимости сменить сторону
 */

import { View, Text } from 'react-native'
import { useEffect } from 'react'
import { Icon } from '@/shared/ui'
import type { ExerciseSide } from '@/entities/training/model/types'

interface SideSwitchScreenProps {
	nextSide: ExerciseSide
	onComplete: () => void
	duration?: number // seconds
}

const sideLabels: Record<ExerciseSide, string> = {
    left: 'Левая сторона',
    right: 'Правая сторона',
    both: 'Обе стороны',
}

export function SideSwitchScreen({
    nextSide,
    onComplete,
    duration = 3,
}: SideSwitchScreenProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete()
        }, duration * 1000)

        return () => clearTimeout(timer)
    }, [duration, onComplete])

    return (
        <View className="bg-background-primary flex-1 items-center justify-center px-6">
            {/* Icon */}
            <View className="mb-8">
                <Icon name="repeat" size={64} color="#C5F680" />
            </View>

            {/* Title */}
            <Text className="text-h2-medium text-text-primary mb-3 text-center">
				Смените сторону
            </Text>

            {/* Side Label */}
            <Text className="text-body-regular text-text-secondary text-center">
                {sideLabels[nextSide]}
            </Text>
        </View>
    )
}
