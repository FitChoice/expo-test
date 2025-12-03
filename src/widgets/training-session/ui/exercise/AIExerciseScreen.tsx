/**
 * AI Exercise Execution Screen (5.0, 5.1, 5.2)
 * Основной экран выполнения упражнения с AI-анализом
 * Включает pose detection, rep counting, form analysis
 */

import { View, Text, Pressable } from 'react-native'
import { useIsFocused } from '@react-navigation/native'
import { CameraView } from 'expo-camera'
import { useState, useEffect, useCallback, useRef } from 'react'
import { Button, Icon } from '@/shared/ui'
import { LargeNumberDisplay } from '@/shared/ui/LargeNumberDisplay'
import { useTrainingStore } from '@/entities/training'
import Svg, { Path, Circle } from 'react-native-svg'

interface AIExerciseScreenProps {
	onComplete: () => void
	onPause: () => void
	onStop: () => void
}

export function AIExerciseScreen({ onComplete, onPause, onStop }: AIExerciseScreenProps) {
    const training = useTrainingStore((state) => state.training)
    const currentExerciseIndex = useTrainingStore((state) => state.currentExerciseIndex)
    const currentReps = useTrainingStore((state) => state.currentReps)

    const [elapsedTime, setElapsedTime] = useState(0)
    const [isTrainerVisible, setIsTrainerVisible] = useState(true)
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const isFocused = useIsFocused()

    const currentExercise = training?.exercises[currentExerciseIndex]
    const targetReps = currentExercise?.reps || 0
    const progress = targetReps > 0 ? currentReps / targetReps : 0

    // Timer
    useEffect(() => {
        timerRef.current = setInterval(() => {
            setElapsedTime((prev) => prev + 1)
        }, 1000)

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current)
            }
        }
    }, [])

    // Auto-complete when target reps reached
    useEffect(() => {
        if (currentReps >= targetReps && targetReps > 0) {
            // Wait 2 seconds before auto-completing
            const timeout = setTimeout(() => {
                onComplete()
            }, 2000)

            return () => clearTimeout(timeout)
        }
        return undefined
    }, [currentReps, targetReps, onComplete])

    // Mock rep detection (TODO: Replace with actual pose detection)
    const handleFrameProcessing = useCallback(() => {
        // This would be called from pose detection
        // For now, it's just a placeholder
        return undefined
    }, [])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    if (!currentExercise) return null

    return (
        <View className="bg-background-primary flex-1">
            {/* Camera View */}
            <View className="flex-1">
                {isFocused ? (
                    <CameraView
                        style={{ flex: 1 }}
                        facing="front"
                        onCameraReady={handleFrameProcessing}
                    >
                        {/* Pose Skeleton Overlay */}
                        <View className="absolute inset-0 items-center justify-center">
                            <Svg width="200" height="400" viewBox="0 0 200 400">
                                {/* Simplified skeleton overlay */}
                                <Circle
                                    cx="100"
                                    cy="40"
                                    r="30"
                                    fill="none"
                                    stroke="#C5F680"
                                    strokeWidth="3"
                                    opacity="0.7"
                                />
                                <Path d="M100 70 L100 200" stroke="#C5F680" strokeWidth="3" opacity="0.7" />
                                <Path
                                    d="M100 100 L50 150 M100 100 L150 150"
                                    stroke="#C5F680"
                                    strokeWidth="3"
                                    opacity="0.7"
                                />
                                <Path
                                    d="M100 200 L70 350 M100 200 L130 350"
                                    stroke="#C5F680"
                                    strokeWidth="3"
                                    opacity="0.7"
                                />
                            </Svg>
                        </View>
                    </CameraView>
                ) : (
                    <View className="flex-1 bg-black" />
                )}
            </View>

            {/* Control Buttons - Top */}
            <View className="absolute left-4 right-4 top-12 flex-row justify-between">
                <Button
                    variant="ghost"
                    onPress={onPause}
                    className="h-12 w-12 rounded-2xl bg-black/30"
                >
                    <Icon name="pause" size={24} color="#FFFFFF" />
                </Button>
                <Button
                    variant="ghost"
                    onPress={onStop}
                    className="h-12 w-12 rounded-2xl bg-black/30"
                >
                    <Icon name="close" size={24} color="#FFFFFF" />
                </Button>
            </View>

            {/* Progress Bar - Left */}
            <View className="absolute bottom-32 left-4 top-32">
                <View className="bg-brand-dark-300 h-full w-2 overflow-hidden rounded-full">
                    <View
                        className="w-full rounded-full bg-brand-green-500"
                        style={{ height: `${progress * 100}%`, position: 'absolute', bottom: 0 }}
                    />
                </View>
            </View>

            {/* Trainer Preview - Bottom Right */}
            {isTrainerVisible && currentExercise.videoUrl && (
                <Pressable
                    onPress={() => setIsTrainerVisible(false)}
                    className="absolute bottom-32 right-4 h-32 w-24 overflow-hidden rounded-2xl bg-black/50"
                >
                    {/* TODO: Add Video component for trainer preview */}
                    <View className="flex-1 items-center justify-center">
                        <Text className="text-caption-regular text-white">Trainer</Text>
                    </View>
                </Pressable>
            )}

            {/* Bottom Info Panel */}
            <View className="bg-brand-dark-400/95 absolute bottom-0 left-0 right-0 p-6">
                {/* Exercise Name */}
                <Text className="text-body-medium text-text-primary mb-4 text-center">
                    {currentExercise.name}
                </Text>

                {/* Timer */}
                <View className="mb-6 items-center">
                    <LargeNumberDisplay value={formatTime(elapsedTime)} size="xlarge" />
                </View>

                {/* Rep Counter */}
                <View className="items-center">
                    <Text
                        className="text-h1-medium mb-1 text-brand-green-500"
                        style={{ fontSize: 64 }}
                    >
                        {currentReps}
                    </Text>
                    <Text className="text-body-regular text-text-secondary">
						/ {targetReps} повторений
                    </Text>
                </View>
            </View>
        </View>
    )
}
