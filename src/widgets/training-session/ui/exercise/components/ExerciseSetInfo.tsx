import React from 'react'
import { View, Text } from 'react-native'

interface ExerciseSetInfoProps {
	currentSet: number
	totalSets: number
	reps?: number
	duration?: number
}

/**
 * Shared component for displaying set information and reps/duration
 */
export const ExerciseSetInfo = ({
	currentSet,
	totalSets,
	reps,
	duration,
}: ExerciseSetInfoProps) => {
	const labelStyle = 'mb-1 text-t2 color-[#949494]'
	const valueStyle = 'text-[64px] leading-[72px] text-light-text-200'

	return (
		<View className="flex-row gap-2 px-1">
			<View className="flex-1 basis-0 items-center rounded-3xl bg-fill-800 p-2">
				<Text className={valueStyle}>
					{currentSet}
					<Text className="text-[32px] leading-[36px] color-[#949494]"> / {totalSets}</Text>
				</Text>
				<Text className={labelStyle}>подход</Text>
			</View>
			<View className="flex-1 basis-0 items-center rounded-3xl bg-fill-800 p-2">
				<Text className={valueStyle}>{reps || duration}</Text>
				<Text className={labelStyle}>{duration ? 'секунд' : 'повторений'}</Text>
			</View>
		</View>
	)
}
