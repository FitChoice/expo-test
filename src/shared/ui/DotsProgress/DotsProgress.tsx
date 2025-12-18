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
	/** Вариант отображения */
	variant?: 'default' | 'onboarding'
}

export function DotsProgress({
	current,
	total,
	size = 'medium',
	variant = 'default',
	className,
	...props
}: DotsProgressProps) {
	const dotSizes = {
		small: 'w-1.5 h-1.5',
		medium: 'w-2 h-2',
	}

	// Для onboarding используем больший размер
	const dotSize = variant === 'onboarding' ? 'w-3 h-3' : dotSizes[size]

	return (
		<View {...props} className={`flex-row items-center gap-2 ${className || ''}`}>
			{Array.from({ length: total }).map((_, index) => {
				const isCompleted = index < current
				const isCurrent = index === current

				// Разные цвета для variant
				let dotColor = ''
				if (variant === 'onboarding') {
					dotColor = isCurrent ? 'bg-fill-100' : 'bg-fill-700'
				} else {
					// default variant
					if (isCompleted) dotColor = 'bg-brand-green-500'
					else if (isCurrent) dotColor = 'bg-brand-purple-500'
					else dotColor = 'bg-brand-dark-300'
				}

				return <View key={index} className={`${dotSize} rounded-full ${dotColor}`} />
			})}
		</View>
	)
}
