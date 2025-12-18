import { type CloseBtnProps } from '@/shared/ui/CloseBtn/types'
import { TouchableOpacity } from 'react-native'
import Entypo from '@expo/vector-icons/Entypo'
import React from 'react'

export const CloseBtn = ({ handlePress, classNames }: CloseBtnProps) => {
	return (
		<TouchableOpacity
			onPress={handlePress}
			className={`absolute right-4 top-5 h-12 w-12 items-center justify-center bg-white/30 ${classNames}`}
		>
			<Entypo name="cross" size={24} color="white" />
		</TouchableOpacity>
	)
}
