/**
 * Timer Exercise Screen (5.7, 5.8)
 * Упражнения на время (планка, статические упражнения)
 * Показывает таймер обратного отсчета без pose detection
 */

import { View, Text, useWindowDimensions, Platform } from 'react-native'
import { useEffect, useState, useCallback, useRef } from 'react'
import { type ExerciseInfoResponse } from '@/entities/training'
import { ExerciseWithCounterWrapper } from '@/widgets/training-session/ui/ExerciseWithCounterWrapper/ExerciseWithCounterWrapper'
import { VIDEO_SCREEN_HEIGHT as verticalCameraViewHeight } from '@/shared/constants/sizes'
import { PoseCamera } from '@/widgets/pose-camera'
import type * as posedetection from '@tensorflow-models/pose-detection'
import type * as ScreenOrientation from 'expo-screen-orientation'
import type { EngineTelemetry, PartialROMEvent } from '../../../../../poseflow-js'
import { useVideoPlayer, VideoView } from 'expo-video'
import { useVideoPlayerContext } from '@/shared/hooks/useVideoPlayerContext'

// =========================================================================
// DEBUG: Partial ROM Error Display
// Этот компонент показывает ошибку "неполная амплитуда" при детекции
// TODO: Удалить или заменить на полноценный UI после тестирования
// =========================================================================
const DEBUG_SHOW_PARTIAL_ROM = __DEV__ // Показывать только в dev-режиме

interface PartialRomDebugProps {
	partialRomCount: number
	lastPartialRom: PartialROMEvent | null
	isVisible: boolean
}

/**
 * Дебаг-компонент для отображения ошибки "неполная амплитуда"
 * Можно легко удалить после интеграции в основной UI
 */
function PartialRomDebugBadge({ partialRomCount, lastPartialRom, isVisible }: PartialRomDebugProps) {
	if (!isVisible || !DEBUG_SHOW_PARTIAL_ROM) return null

	return (
		<View
			style={{
				position: 'absolute',
				top: 60,
				left: 10,
				backgroundColor: 'rgba(255, 100, 100, 0.9)',
				paddingHorizontal: 12,
				paddingVertical: 8,
				borderRadius: 8,
				zIndex: 100,
			}}
		>
			<Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>
				⚠️ Неполная амплитуда
			</Text>
			<Text style={{ color: 'white', fontSize: 12 }}>
				Ошибок: {partialRomCount}
			</Text>
			{lastPartialRom && (
				<Text style={{ color: 'white', fontSize: 10, opacity: 0.8 }}>
					{lastPartialRom.phase_type === 'up' ? '↑ не до верха' : '↓ не до низа'}{' '}
					({Math.round(lastPartialRom.depth_achieved * 100)}%)
				</Text>
			)}
		</View>
	)
}

// =========================================================================
// STUB: Обработчик ошибки "неполная амплитуда"
// Заглушка для интеграции с основным функционалом приложения
// =========================================================================

/**
 * Заглушка для обработки ошибки неполной амплитуды
 * TODO: Реализовать полноценную обработку:
 * - Показать уведомление пользователю
 * - Записать в аналитику
 * - Добавить в отчет тренировки
 */
function handlePartialRomError(event: PartialROMEvent, exerciseId: string | number): void {
	// STUB: Логируем ошибку для отладки
	console.log(`[PartialROM] Ошибка неполной амплитуды:`, {
		exerciseId,
		phaseType: event.phase_type,
		depthAchieved: `${Math.round(event.depth_achieved * 100)}%`,
		deficit: event.deficit.toFixed(3),
	})

	// TODO: Здесь можно добавить:
	// - analyticsService.trackPartialRomError(exerciseId, event)
	// - notificationService.showWarning('Увеличьте амплитуду движения')
	// - trainingStore.addFormError({ type: 'partial_rom', ...event })
}

interface TimerExerciseScreenProps {
	isVertical?: boolean
	onComplete: () => void
	exercise: ExerciseInfoResponse
	model: posedetection.PoseDetector
	orientation: ScreenOrientation.Orientation
	practiceVideoUrl?: string
}

export function ExerciseExecutionScreen({
	isVertical,
	onComplete,
	exercise,
	model,
	orientation,
	practiceVideoUrl,
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

	// =========================================================================
	// Partial ROM Error Tracking (неполная амплитуда)
	// =========================================================================
	const [partialRomCount, setPartialRomCount] = useState(0)
	const [lastPartialRom, setLastPartialRom] = useState<PartialROMEvent | null>(null)
	const [showPartialRomBadge, setShowPartialRomBadge] = useState(false)
	const partialRomTimeoutRef = useRef<NodeJS.Timeout | null>(null)

	/**
	 * Обработка телеметрии с детекцией ошибок partial ROM
	 */
	const handleTelemetry = useCallback((newTelemetry: EngineTelemetry) => {
		setTelemetry(newTelemetry)

		// Проверяем наличие ошибки неполной амплитуды
		if (newTelemetry.partialRom) {
			// Увеличиваем счетчик ошибок
			setPartialRomCount((prev) => prev + 1)
			setLastPartialRom(newTelemetry.partialRom)

			// Показываем бейдж на 3 секунды
			setShowPartialRomBadge(true)
			if (partialRomTimeoutRef.current) {
				clearTimeout(partialRomTimeoutRef.current)
			}
			partialRomTimeoutRef.current = setTimeout(() => {
				setShowPartialRomBadge(false)
			}, 3000)

			// Вызываем заглушку для обработки ошибки
			handlePartialRomError(newTelemetry.partialRom, exercise.id)
		}
	}, [exercise.id])

	// Очистка таймера при размонтировании
	useEffect(() => {
		return () => {
			if (partialRomTimeoutRef.current) {
				clearTimeout(partialRomTimeoutRef.current)
			}
		}
	}, [])

	useEffect(() => {
		if (!player || !videoPlayerContext) return
		const unregister = videoPlayerContext.registerPlayer(player)
		return unregister
	}, [player, videoPlayerContext])

	const { height: windowHeight } = useWindowDimensions()

	const height = isVertical ? verticalCameraViewHeight : windowHeight

	useEffect(() => {
		if (telemetry?.reps == exercise.reps) {
			setTimeout(() => {
				onComplete()
			}, 2000)
		}
	}, [telemetry?.reps])

	return (
		<ExerciseWithCounterWrapper>
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
							orientation={orientation}
							onTelemetry={handleTelemetry}
							exerciseId={exercise.id}
						/>
						{/* DEBUG: Отображение ошибки неполной амплитуды */}
						<PartialRomDebugBadge
							partialRomCount={partialRomCount}
							lastPartialRom={lastPartialRom}
							isVisible={showPartialRomBadge}
						/>
					</View>

					{!isVertical && (
						<>
							<View className="absolute left-0 right-0 top-10 items-center justify-center px-4">
								{/*<VideoProgressBar player={player} className="mb-2" />*/}
								<Text className="text-center text-t1 text-light-text-200">
									{exercise.name}
								</Text>
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

				{/* Step Progress */}
				{/*{isVertical ? (*/}
				{/*    <View  */}
				{/*        className="justify-center items-center pt-10"*/}
				{/*    >*/}
				{/*        <View */}
				{/*            onLayout={(e) => setStepProgressHeight(e.nativeEvent.layout.height)}*/}
				{/*        >*/}
				{/*            <StepProgress current={0} total={5} />*/}
				{/*        </View>*/}
				{/*    </View>*/}
				{/*) : (*/}
				{/*    <View className="w-full px-4 py-4">*/}
				{/*        <StepProgress current={0} total={5} />*/}
				{/*    </View>*/}
				{/*)}*/}

				{/* Exercise Info */}
				<View className="p-6">
					{/* Exercise Name */}
					{isVertical ? (
						<Text className="text-center text-t1 text-light-text-200">
							{exercise.name}
						</Text>
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
		</ExerciseWithCounterWrapper>
	)
}
