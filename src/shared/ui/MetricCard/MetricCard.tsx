import React from 'react'
import { View, Text } from 'react-native'

interface MetricCardProps {
	icon: React.ReactElement
	displayNumber: number
	title: string
	description: string
}

export const MetricCard: React.FC<MetricCardProps> = ({
	icon,
	displayNumber,
	title,
	description,
}) => {
	return (
		<View className="h-full flex-1 rounded-3xl bg-white/20 p-2">
			{/* Icon in top right corner */}
			<View className="items-end justify-end">
				<View className="h-12 w-12 items-center justify-center rounded-full bg-brand-green-500/30">
					<View className="items-center justify-center">{icon}</View>
				</View>
			</View>

			{/* Content */}
			<View className="flex-1 items-center justify-center px-6 py-8">
				{/* Number and Title */}
				<View className="items-center justify-center">
					<Text className="font-rimma text-[50px] leading-[72px] text-light-text-100">
						{displayNumber}
					</Text>
					<Text className="mt-1 text-t2 text-light-text-100">{title}</Text>
				</View>

				{/* Description */}
				<Text className="mt-4 text-center text-t4 text-light-text-200">
					{description}
				</Text>
			</View>
		</View>
	)
}
