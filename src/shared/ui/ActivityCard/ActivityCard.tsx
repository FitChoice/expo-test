import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'

interface ActivityCardProps {
	label: string
	date: string
	minutes?: string
	onPress?: () => void
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
	label,
	date,
	minutes,
	onPress,
}) => {
	return (
		<TouchableOpacity
			activeOpacity={0.7}
			onPress={onPress}
			className="flex-row items-center justify-between rounded-[32px] bg-fill-900 p-5"
		>
			<View className="flex-1 gap-4">
				<Text className="text-t1 font-rimma-bold text-white">
					{label}
				</Text>
				<View className="flex-row gap-2">
					{/* Date Chip */}
					<View className="flex-row items-center rounded-full bg-fill-700/50 px-4 py-2">
						<Text className="text-t3 font-inter text-white">
							{date}
						</Text>
					</View>

					{/* Minutes Chip (Optional) */}
					{minutes && (
						<View className="flex-row items-center gap-2 rounded-full bg-fill-700/50 px-4 py-2">
							<MaterialCommunityIcons name="timer-outline" size={16} color="white" />
							<Text className="text-t3 font-inter text-white">
								{minutes}
							</Text>
						</View>
					)}
				</View>
			</View>

			{/* Arrow Button */}
			<View className="h-14 w-14 items-center justify-center rounded-2xl bg-fill-700">
				<Feather name="arrow-right" size={24} color="white" />
			</View>
		</TouchableOpacity>
	)
}

