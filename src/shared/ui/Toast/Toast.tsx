/**
 * Toast - dumb component for displaying notifications
 * Managed by react-native-toast-message
 */

import React from 'react'
import { View, Text } from 'react-native'
import Octicons from '@expo/vector-icons/Octicons';
import type { ToastProps } from './types'
import { Icon } from '@/shared/ui'

export const Toast: React.FC<ToastProps> = ({ message, description, variant = 'success', ...restProp  }) => {

	//const iconColor = variant === 'success' ? '#81BD12' : variant === 'error' ? '#CA3114' : '#1A3FBA'

	console.log('restProp')
	console.log(restProp)

	return (
		<View className="flex-row items-center gap-5 rounded-2xl bg-fill-800 p-4 shadow-lg w-full ">

			<View className="p-4  rounded-2xl bg-fill-700" >
				{/*{ iconName ? <Icon name={iconName} size={14} color={iconColor} /> : <Octicons name="dot-fill" size={14} color={iconColor} /> }*/}
			</View>
			<View className="flex-column gap-5" >
				<Text className="flex-1 text-t2-bold text-light-text-100">{message}</Text>
				{description && <Text className=" text-t3 	text-light-text-500">{description}</Text>}
			</View>

		</View>
	)
}
