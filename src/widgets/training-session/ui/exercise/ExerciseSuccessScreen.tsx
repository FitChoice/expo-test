/**
 * Exercise Success Screen (5.3)
 * Показывает мотивационное сообщение после завершения упражнения
 */

import { View, Text } from 'react-native'
import { useEffect, useState } from 'react'

interface ExerciseSuccessScreenProps {
	onComplete: () => void
	message?: string
}

const motivationalMessages = [
	'Так держать!',
	'Отлично!',
	'Прекрасно!',
	'Молодец!',
	'Великолепно!',
	'Продолжай!',
]

export function ExerciseSuccessScreen({
	onComplete,
	message,
}: ExerciseSuccessScreenProps) {
	const [displayMessage] = useState(
		() =>
			message ||
			motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]
	)

	useEffect(() => {
		// Auto-dismiss after 2 seconds
		const timer = setTimeout(() => {
			onComplete()
		}, 2000)

		return () => clearTimeout(timer)
	}, [onComplete])

	return (
		<View className="bg-background-primary flex-1 items-center justify-center">
			<Text
				className="text-h1-medium px-6 text-center text-brand-green-500"
				style={{ fontSize: 48 }}
			>
				{displayMessage}
			</Text>
		</View>
	)
}
