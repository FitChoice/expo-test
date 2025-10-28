/**
 * Rest Screen (5.5)
 * Экран отдыха между подходами
 * Показывает обратный отсчет с возможностью пропустить
 */

import { View, Text } from 'react-native'
import { useState, useEffect } from 'react'
import { Button } from '@/shared/ui'
import { LargeNumberDisplay } from '@/shared/ui/LargeNumberDisplay'

interface RestScreenProps {
	onComplete: () => void
	duration?: number // seconds
}

export function RestScreen({ onComplete, duration = 60 }: RestScreenProps) {
	const [timeRemaining, setTimeRemaining] = useState(duration)

	useEffect(() => {
		if (timeRemaining <= 0) {
			onComplete()
			return
		}

		const timer = setInterval(() => {
			setTimeRemaining((prev) => prev - 1)
		}, 1000)

		return () => clearInterval(timer)
	}, [timeRemaining, onComplete])

	const handleSkip = () => {
		onComplete()
	}

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60)
		const secs = seconds % 60
		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
	}

	return (
		<View className="bg-background-primary flex-1 items-center justify-center px-6">
			{/* Timer */}
			<View className="mb-12">
				<LargeNumberDisplay value={formatTime(timeRemaining)} size="xlarge" />
			</View>

			{/* Label */}
			<Text className="text-body-medium text-text-secondary mb-12">Отдых</Text>

			{/* Skip Button */}
			<Button onPress={handleSkip} variant="secondary" className="w-full">
				Пропустить
			</Button>
		</View>
	)
}
