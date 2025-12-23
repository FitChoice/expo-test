import { useEffect, useRef } from 'react'
import { Animated, Easing, View, type ViewProps } from 'react-native'

export interface StepProgressProps extends ViewProps {
	/** Текущий шаг (начинается с 0) */
	current: number
	/** Общее количество шагов */
	total: number
	isVertical?: boolean
	secondsForStepProgress?: number
}

export function StepProgress({
	total,
	current,
	secondsForStepProgress,
	isVertical,
	...props
}: StepProgressProps) {
	const progress = useRef(new Animated.Value(1)).current
	useEffect(() => {
		// Если не задано время — сразу показываем заполненный активный шаг
		if (!secondsForStepProgress || secondsForStepProgress <= 0) {
			progress.setValue(1)
			return
		}

		// Сбрасываем и запускаем анимацию заполнения для активного шага
		progress.setValue(0)
		Animated.timing(progress, {
			toValue: 1,
			duration: secondsForStepProgress * 1000,
			easing: Easing.linear,
			useNativeDriver: false, // анимируем width, поэтому только без native driver
		}).start()
	}, [current, progress, secondsForStepProgress])

	const animatedWidth = progress.interpolate({
		inputRange: [0, 1],
		outputRange: ['0%', '100%'],
	})

	return (
		<View
			{...props}
			className={`flex-row items-center gap-1 ${isVertical ? 'w-full' : 'w-1/2'}`}
		>
			{Array.from({ length: total }).map((_, index) => {
				const isActive = index === current

				if (isActive && secondsForStepProgress) {
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

				// Неактивные шаги - белые полупрозрачные прямоугольники с закругленными краями
				return (
					<View
						key={index}
						className={`h-1.5 flex-1 rounded-full ${
							isActive ? 'bg-brand-green-500' : 'bg-white/30'
						}`}
					/>
				)
			})}
		</View>
	)
}
