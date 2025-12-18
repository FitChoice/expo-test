import React from 'react'
import { View, Text } from 'react-native'
import type { TrainingTagsProps } from './types'

/**
 * TrainingTags - компонент для отображения двух тегов с иконками
 * Используется для отображения мета-информации о тренировке (время, опыт и т.д.)
 */
export const TrainingTags: React.FC<TrainingTagsProps> = ({
	icon1,
	title1,
	icon2,
	title2,
	className,
	...props
}) => {
	return (
		<View className={`flex-row gap-2 ${className || ''}`} {...props}>
			<View
				className={`rounded-full bg-gray-500/50 px-3 py-1 ${icon1 ? 'flex-row items-center' : ''}`}
			>
				{icon1 && icon1}
				<Text className={`text-t4 text-white ${icon1 ? 'ml-1' : ''}`}>{title1}</Text>
			</View>
			<View
				className={`rounded-lg bg-gray-500/50 px-3 py-1 ${icon2 ? 'flex-row items-center' : ''}`}
			>
				{icon2 && icon2}
				<Text className={`text-t4 text-white ${icon2 ? 'ml-1' : ''}`}>{title2}</Text>
			</View>
		</View>
	)
}
