/**
 * Exercise Countdown Screen (3.0)
 * Показывает обратный отсчет перед началом упражнения
 * Отображает видео тренера и информацию о подходе
 */

import { View, Text } from 'react-native'
import { VideoView, useVideoPlayer } from 'expo-video'

import {  StepProgress } from '@/shared/ui'
import { LargeNumberDisplay } from '@/shared/ui/LargeNumberDisplay'

import type { Exercise } from '@/entities/training/model/types'

import {
	ExerciseWithCounterWrapper,
	useCountdown
} from '@/shared/ui/ExerciseWithCounterWrapper/ExerciseWithCounterWrapper'


interface ExerciseCountdownScreenProps {
	exercise: Exercise
	currentSet: number
	onComplete: () => void
}

export function CountdownDisplay() {
	const countdown = useCountdown()
	const minutes = Math.floor(countdown / 60)
	const seconds = countdown % 60
	return (
		<View className="mb-6 items-center">
			<LargeNumberDisplay
				value={`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}
				size="large"
			/>
		</View>
	)
}

export function ExerciseCountdownScreen({
	exercise,
	currentSet,
	onComplete,
}: ExerciseCountdownScreenProps) {
//	const [countdown, setCountdown] = useState(5)
	const player = useVideoPlayer(exercise.videoUrl || '', (player) => {
		player.loop = true
		player.play()
	})

	const height = 500

	return (
	<ExerciseWithCounterWrapper 
		onComplete={onComplete} 
		countdownInitial={exercise.duration}
	>
		<>
			{/* Video */}

			<View style={{ height }} >
				{exercise.videoUrl ? (
					<VideoView
						player={player}
						style={{ flex: 1 }}
						contentFit="cover"
						nativeControls={false}
					/>
				) : (
					<View className="bg-brand-dark-300 flex-1" />
				)}
			</View>

			{/* Step Progress */}
			<View className="w-full px-4 py-4">
				<StepProgress current={0} total={5} />
			</View>

			{/* Exercise Info */}
			<View className="absolute bottom-0 left-0 right-0 p-6">
				{/* Exercise Name */}
				<Text className="text-t1 text-light-text-200 text-center">{exercise.name}</Text>

				{/* Countdown */}
				<CountdownDisplay />

				{/* Set Info */}
				<View className="flex-row px-1 gap-2">
					<View className="flex-1 basis-0 items-center bg-fill-800 rounded-3xl p-2 ">
						<Text className="text-[64px] leading-[72px] text-light-text-200">
							{currentSet}
							<Text className="text-[32px] leading-[36px] color-[#949494] "> / {exercise.sets}</Text>
						</Text>
						<Text className="text-t2 color-[#949494] mb-1">подход</Text>
					</View>
					<View className="flex-1 basis-0 items-center bg-fill-800 rounded-3xl p-2">
						<Text className="text-[64px] leading-[72px] text-light-text-200">
							{exercise.reps || exercise.duration}
						</Text>
						<Text className="text-t2 color-[#949494] mb-1">повторения</Text>
					</View>
				</View>
			</View>
		</>
	</ExerciseWithCounterWrapper>
	)
}
