/**
 * Toast - dumb component for displaying notifications
 * Managed by react-native-toast-message
 */

import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import Octicons from '@expo/vector-icons/Octicons'
import type { ToastProps } from './types'
import { Icon } from '@/shared/ui'
import Emo1 from '@/assets/images/moods/emo1.svg'
import Emo3 from '@/assets/images/moods/emo3.svg'
import Emo5 from '@/assets/images/moods/emo5.svg'

export const Toast: React.FC<ToastProps> = ({
	message,
	description,
	variant = 'success',
	iconName,
}) => {
	const iconColor =
		variant === 'success' ? '#81BD12' : variant === 'error' ? '#CA3114' : '#1A3FBA'

	return (
		<View className="items-center gap-2 rounded-2xl bg-fill-800 py-4 ">

<View className="flex-row align-center gap-4 justify-center px-5 w-full">
	<View className="p-4  rounded-2xl bg-fill-700">
		{iconName ? (
			<Icon name={iconName} size={14} color={iconColor} />
		) : (
			<Octicons name="dot-fill" size={14} color={iconColor} />
		)}
	</View>
	<View className="flex-column flex-1">
		<Text className="text-t2-bold text-light-text-100">{message}</Text>
		{description && <Text className="text-t3 text-light-text-500">{description}</Text>}
	</View>

</View>
			{
				iconName === 'headset' && <View className="flex-row gap-1">
				<TouchableOpacity className="rounded-2xl bg-fill-700 w-1/3 items-center justify-center py-2">
					<Emo1 />
				</TouchableOpacity>
					<TouchableOpacity className="rounded-2xl bg-fill-700  w-1/3 items-center justify-center py-2">
						<Emo3 />
					</TouchableOpacity>
					<TouchableOpacity className="rounded-2xl bg-fill-700 w-1/3 items-center justify-center py-2">
						<Emo5 />
					</TouchableOpacity>
				</View>
			}

		</View>
	)
}
