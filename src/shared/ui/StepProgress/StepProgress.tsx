/**
 * StepProgress - индикатор прогресса шагов
 * Показывает активный шаг в виде яркого зеленого круга и последующие шаги в виде белых полупрозрачных прямоугольников
 */

import { View, type ViewProps } from 'react-native'

export interface StepProgressProps extends ViewProps {
	/** Текущий шаг (начинается с 0) */
	current: number
	/** Общее количество шагов */
	total: number
}

export function StepProgress({
	current,
	total,
	className,
	...props
}: StepProgressProps) {
	return (
		<View {...props} className={`flex-row items-center gap-1 w-full ${className || ''}`}>
			{Array.from({ length: total }).map((_, index) => {
				const isActive = index === current

				if (isActive) {
					// Активный шаг - яркий зеленый круг с эффектом свечения
					return (
						<View key={index} className="flex-1 items-center">
							<View
								className="w-3 h-3 rounded-full bg-brand-green-500"
								style={{
									shadowColor: '#4ADE80',
									shadowOffset: { width: 0, height: 0 },
									shadowOpacity: 0.8,
									shadowRadius: 4,
									elevation: 4,
								}}
							/>
						</View>
					)
				}

				// Неактивные шаги - белые полупрозрачные прямоугольники с закругленными краями
				return (
					<View
						key={index}
						className="h-1.5 flex-1 rounded-full bg-white/30"
					/>
				)
			})}
		</View>
	)
}

