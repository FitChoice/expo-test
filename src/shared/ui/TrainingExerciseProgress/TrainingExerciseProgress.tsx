import React, { useEffect, useRef } from 'react'
import { Animated, Easing, View, type ViewProps } from 'react-native'

export interface TrainingExerciseProgressProps extends ViewProps {
	/** Общее количество упражнений в тренировке */
	totalExercises: number
	/** Индекс текущего упражнения (0-based) */
	currentExerciseIndex: number
	/** Прогресс внутри текущего упражнения (0-1) */
	progressRatio: number
	/** Вертикальная ориентация */
	isVertical?: boolean
}

/**
 * TrainingExerciseProgress - индикатор прогресса всей тренировки.
 * Каждый сегмент соответствует одному упражнению.
 * Текущий сегмент заполняется инкрементально.
 */
export function TrainingExerciseProgress({
	totalExercises,
	currentExerciseIndex,
	progressRatio,
	isVertical,
	className = '',
	...props
}: TrainingExerciseProgressProps) {
	const animatedProgress = useRef(new Animated.Value(0)).current

	useEffect(() => {
		Animated.timing(animatedProgress, {
			toValue: progressRatio,
			duration: 300,
			easing: Easing.out(Easing.ease),
			useNativeDriver: false, // width не поддерживает native driver
		}).start()
	}, [progressRatio, animatedProgress])

	const animatedWidth = animatedProgress.interpolate({
		inputRange: [0, 1],
		outputRange: ['0%', '100%'],
	})

	return (
		<View
			{...props}
			className={`flex-row items-center gap-1 ${isVertical ? 'w-full' : 'w-1/2'} ${className}`}
		>
			{Array.from({ length: totalExercises }).map((_, index) => {
				const isCompleted = index < currentExerciseIndex
				const isCurrent = index === currentExerciseIndex

				if (isCurrent) {
					return (
						<View
							key={index}
							className="h-1.5 flex-1 rounded-full overflow-hidden bg-white/30"
						>
							<Animated.View
								className="absolute left-0 top-0 bottom-0 rounded-full bg-brand-green-500"
								style={{ width: animatedWidth }}
							/>
						</View>
					)
				}

				return (
					<View
						key={index}
						className={`h-1.5 flex-1 rounded-full ${
							isCompleted ? 'bg-brand-green-500' : 'bg-white/30'
						}`}
					/>
				)
			})}
		</View>
	)
}
