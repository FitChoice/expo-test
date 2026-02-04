/**
 * Timer Exercise Screen (5.7, 5.8)
 * Упражнения на время (планка, статические упражнения)
 * Показывает таймер обратного отсчета без pose detection
 */

import { View, Text, useWindowDimensions, Platform } from 'react-native'
import { useCallback, useEffect, useState } from 'react'
import { type ExerciseInfoResponse, useTrainingStore } from '@/entities/training'
import { VIDEO_SCREEN_HEIGHT as verticalCameraViewHeight } from '@/shared/constants/sizes'
import { PoseCamera } from '@/widgets/pose-camera'
import type * as posedetection from '@tensorflow-models/pose-detection'
import type * as ScreenOrientation from 'expo-screen-orientation'
import type {
	EngineTelemetry,
	PartialROMEvent,
	TimingErrorEvent,
} from '../../../../../poseflow-js'
import { useVideoPlayer, VideoView } from 'expo-video'
import { useVideoPlayerContext } from '@/shared/hooks/useVideoPlayerContext'
import { TrainingExerciseProgress } from '@/shared/ui'
import { useSpeechFeedback } from '@/shared/lib'


// =========================================================================
// STUB: Обработчик ошибки "неполная амплитуда"
// Заглушка для интеграции с основным функционалом приложения
// =========================================================================

/**
 * Заглушка для обработки ошибки неполной амплитуды.
 * Место для интеграции аналитики/отчетов, если потребуется.
 */
function handlePartialRomError(event: PartialROMEvent, exerciseId: string | number): void {
	// STUB: Логируем ошибку для отладки
	console.warn(`[PartialROM] Ошибка неполной амплитуды:`, {
		exerciseId,
		phaseType: event.phase_type,
		depthAchieved: `${Math.round(event.depth_achieved * 100)}%`,
		deficit: event.deficit.toFixed(3),
	})
}

/**
 * Заглушка для обработки ошибки темпа (слишком быстро/медленно).
 * Место для интеграции аналитики/отчетов, если потребуется.
 */
function handleTimingError(event: TimingErrorEvent, exerciseId: string | number): void {
	// STUB: Логируем ошибку для отладки
	console.warn(`[TimingError] Ошибка темпа:`, {
		exerciseId,
		type: event.type,
		message: event.message,
		actualMs: event.actual_ms,
		expectedMs: event.expected_ms,
		deviationPct: event.deviation_pct,
	})
}

const ERROR_WORDS = {
	down_up: 'deeper',      // Не доприсел (Down->Up without reaching Bottom)
	up_down: 'higher',      // Не довстал (Up->Down without reaching Top)
	down_bottom: 'deeper',  // Неглубокий присед (Down->Bottom quality check)
	up_top: 'higher',       // Неполное выпрямление (Up->Top quality check)
} as const

// Слова для ошибок темпа
const TIMING_ERROR_WORDS = {
	too_fast: 'slower',     // Слишком быстро
	too_slow: 'faster',     // Слишком медленно
} as const


interface TimerExerciseScreenProps {
	isVertical?: boolean
	onComplete: () => void
	exercise: ExerciseInfoResponse
	model: posedetection.PoseDetector
	orientation: ScreenOrientation.Orientation
	practiceVideoUrl?: string
	currentExerciseIndex: number
	totalExercises: number
	exerciseProgressRatio: number
	currentSide?: 'left' | 'right'
}

export function ExerciseExecutionScreen({
	isVertical,
	onComplete,
	exercise,
	model,
	orientation,
	practiceVideoUrl,
	currentExerciseIndex,
	totalExercises,
	exerciseProgressRatio,
																					currentSide
}: TimerExerciseScreenProps) {
	const player = useVideoPlayer(
		practiceVideoUrl || exercise.video_practice || '',
		(player) => {
			player.loop = true
			player.play()
		}
	)
	const videoPlayerContext = useVideoPlayerContext()
	const [telemetry, setTelemetry] = useState<EngineTelemetry | null>(null)
	const { speak, stop } = useSpeechFeedback()

	/**
	 * Обработка телеметрии с детекцией ошибок partial ROM и timing errors
	 */
	const handleTelemetry = useCallback((newTelemetry: EngineTelemetry) => {
		setTelemetry(newTelemetry)

		// Проверяем наличие ошибки неполной амплитуды
		if (newTelemetry.partialRom) {
			const errorWord = ERROR_WORDS[newTelemetry.partialRom.phase_type]
			speak(errorWord)

			// Вызываем заглушку для обработки ошибки
			handlePartialRomError(newTelemetry.partialRom, exercise.id)
		}

		// Проверяем наличие ошибки темпа (слишком быстро/медленно)
		if (newTelemetry.timingError) {
			const errorWord = TIMING_ERROR_WORDS[newTelemetry.timingError.type]
			speak(errorWord)

			// Вызываем заглушку для обработки ошибки
			handleTimingError(newTelemetry.timingError, exercise.id)
		}

		// Логируем состояние body ready (для отладки)
		if (newTelemetry.bodyReady === false) {
			console.log('[Telemetry] Waiting for body to be fully visible...')
		}

		// Логируем отклонение позы (для отладки)
		if (newTelemetry.postureRejected) {
			console.log('[Telemetry] Posture rejected:', newTelemetry.detectedPosture)
		}
	}, [exercise.id, speak])

	useEffect(() => {
		return () => {
			stop()
		}
	}, [stop])


	useEffect(() => {
		if (!player || !videoPlayerContext) return
		const unregister = videoPlayerContext.registerPlayer(player)
		return unregister
	}, [player, videoPlayerContext])

	const { height: windowHeight } = useWindowDimensions()

	const height = isVertical ? verticalCameraViewHeight : windowHeight

	const setCurrentReps = useTrainingStore((state) => state.setCurrentReps)

	useEffect(() => {
		if (telemetry?.reps !== undefined) {
			setCurrentReps(telemetry.reps)
		}
	}, [telemetry?.reps, setCurrentReps])

	useEffect(() => {
		if (Number(telemetry?.reps) >= exercise.reps && exercise.reps > 0 ) {
			const timeout = setTimeout(() => {
				onComplete()
			}, 2000)
			return () => clearTimeout(timeout)
		}
		return undefined
	}, [telemetry?.reps, exercise.reps, onComplete])

	return (
		<View>
			{/* Camera View with Video Overlay */}
			<View
				style={{
					height: isVertical ? height : '100%',
					width: '100%',
					overflow: 'hidden',
					borderRadius: 8,

				}}
			>
				<View className="rounded-3xl">
					<PoseCamera
						model={model}
						currentSide={currentSide}
						orientation={orientation}
						onTelemetry={handleTelemetry}
						exerciseId={exercise.name}
					/>
				</View>

				{!isVertical && (
					<>

						<View className="absolute left-0 right-0 top-10 items-center justify-center px-4">
							<View className="mb-2" >
								<TrainingExerciseProgress
									totalExercises={totalExercises}
									currentExerciseIndex={currentExerciseIndex}
									progressRatio={exerciseProgressRatio}
									isVertical={isVertical}
								/>
							</View>
							<Text className="text-center text-t1 text-light-text-200">{exercise.name}</Text>
						</View>

						<View className="absolute bottom-20 left-0 right-0 z-10 px-12">
							<View className="flex-row px-1">
								<View className="flex-[0.5] basis-0 items-center rounded-3xl bg-fill-800 p-1">
									<Text
										className={`text-[64px] leading-[72px] ${
											telemetry?.reps === 0
												? 'text-light-text-200'
												: telemetry?.reps === exercise.reps
													? 'text-brand-green-500'
													: 'text-light-text-200'
										}`}
									>
										{telemetry?.reps}
										<Text
											className={`text-[32px] leading-[36px] ${
												telemetry?.reps === exercise.reps
													? 'text-brand-green-500'
													: 'color-[#949494]'
											}`}
										>
											{' '}
											/ {exercise.reps}
										</Text>
									</Text>
									<Text className="mb-1 text-t2 color-[#949494]">повторения</Text>
								</View>
								<View className="flex-[1] basis-0 items-center justify-center"></View>

								<View className="flex-[1.2] basis-0 items-end">
									{exercise.video_practice && player && (
										<View
											style={{
												width: '50%',
												height: '100%',
												overflow: 'hidden',
												backgroundColor: 'transparent',
												borderRadius: 8,
												shadowColor: '#000',
												shadowOffset: { width: 0, height: 2 },
												shadowOpacity: 0.25,
												shadowRadius: 3.84,
											}}
										>
											<VideoView
												player={player}
												style={{ width: '100%', height: '100%' }}
												contentFit="cover"
												nativeControls={false}
											/>
										</View>
									)}
								</View>
							</View>
						</View>
					</>
				)}

				{isVertical && (practiceVideoUrl || exercise.video_practice) && player && (
					<View
						style={{
							position: 'absolute',
							right: 10,
							bottom: Platform.OS === 'ios' ? 35 : 5,
							width: '30%',
							height: '30%',
							overflow: 'hidden',
							backgroundColor: 'transparent',
							borderRadius: 8,
							shadowColor: '#000',
							shadowOffset: { width: 0, height: 2 },
							shadowOpacity: 0.25,
							shadowRadius: 3.84,
						}}
					>
						<VideoView
							player={player}
							style={{ width: '100%', height: '100%' }}
							contentFit="cover"
							nativeControls={false}
						/>
					</View>
				)}
			</View>


			 {/*Step Progress */}
			{isVertical ? (
			    <View
			        className="justify-center items-center pt-10"
			    >
			        <View>
								<TrainingExerciseProgress
									totalExercises={totalExercises}
									currentExerciseIndex={currentExerciseIndex}
									progressRatio={exerciseProgressRatio}
									isVertical={isVertical}
								/>
			        </View>
			    </View>
			) : (
			    <View className="w-full px-4 py-4 items-center">

			    </View>
			)}

			{/* Exercise Info */}
			<View className="p-6">
				{/* Exercise Name */}
				{isVertical ? (
					<Text className="text-center text-t1 text-light-text-200">{exercise.name}</Text>
				) : (
					<></>
				)}

				{isVertical ? (
					<View className={'align-center justify-center'}>
						{/* Set Info */}
						<View className="flex-row px-1">
							<View className="flex-1 basis-0 items-center pt-10">
								<Text
									className={`text-[64px] leading-[72px] ${
										telemetry?.reps === 0
											? 'text-light-text-200'
											: telemetry?.reps === exercise.reps
												? 'text-brand-green-500'
												: 'text-light-text-200'
									}`}
								>
									{telemetry?.reps || 0}
									<Text
										className={`text-[32px] leading-[36px] ${
											telemetry?.reps === exercise.reps
												? 'text-brand-green-500'
												: 'color-[#949494]'
										}`}
									>
										{' '}
										/ {exercise.reps}
									</Text>
								</Text>
								<Text className="mb-1 text-t2 color-[#949494]">повторения</Text>
							</View>
						</View>
						{telemetry?.reps == exercise.reps && (
							<View className="mt-6 items-center">
								<Text className="text-h1 text-brand-green-500">Так держать!</Text>
							</View>
						)}
					</View>
				) : (
					<></>
				)}
			</View>
		</View>
	)
}
