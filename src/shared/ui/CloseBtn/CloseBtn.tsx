import { type CloseBtnProps } from '@/shared/ui/CloseBtn/types'
import { TouchableOpacity } from 'react-native'
import React from 'react'
import { Icon } from '@/shared/ui'

export const CloseBtn = ({ handlePress, classNames }: CloseBtnProps) => {
	return (
		<TouchableOpacity
			onPress={handlePress}
			className={`absolute right-4 top-5 h-12 w-12 items-center justify-center bg-white/30 ${classNames}`}
		>
			<Icon name="close" size={20} color="white" />
		</TouchableOpacity>
	)
}
