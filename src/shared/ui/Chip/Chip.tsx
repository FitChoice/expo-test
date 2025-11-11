import React from 'react'
import { View, Text } from 'react-native'
import { Icon } from '../Icon'
import type { ChipProps } from './types'

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export const Chip: React.FC<ChipProps> = ({ icon, text, variant = 'default' }) => {
	return (
		<View
			className={`flex-row items-center gap-2 rounded-full px-4 py-2 ${
				variant === 'default' 
					? 'bg-dark-surface-300/60' 
					: 'bg-brand-purple-500/20'
			}`}
		>
			{icon && (
				<MaterialCommunityIcons name={icon} size={20} color={'#FFFFFF'} />
			)}
			<Text className="font-inter text-sm font-medium text-white">
				{text}
			</Text>
		</View>
	)
}

