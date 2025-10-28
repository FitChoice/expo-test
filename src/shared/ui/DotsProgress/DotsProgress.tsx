/**
 * DotsProgress - индикатор прогресса в виде точек
 * Используется для отображения прогресса подходов или упражнений
 */

import { View, type ViewProps } from 'react-native'

export interface DotsProgressProps extends ViewProps {
	/** Текущее значение */
	current: number
	/** Общее количество */
	total: number
	/** Размер точек */
	size?: 'small' | 'medium'
}

export function DotsProgress({
	current,
	total,
	size = 'medium',
	className,
	...props
}: DotsProgressProps) {
	const dotSizes = {
		small: 'w-1.5 h-1.5',
		medium: 'w-2 h-2',
	}

	const dotSize = dotSizes[size]

	return (
		<View {...props} className={`flex-row items-center gap-2 ${className || ''}`}>
			{Array.from({ length: total }).map((_, index) => {
				const isCompleted = index < current
				const isCurrent = index === current

				return (
					<View
						key={index}
						className={` ${dotSize} rounded-full ${isCompleted ? 'bg-brand-green-500' : ''} ${isCurrent ? 'bg-brand-purple-500' : ''} ${!isCompleted && !isCurrent ? 'bg-brand-dark-300' : ''} `}
					/>
				)
			})}
		</View>
	)
}
