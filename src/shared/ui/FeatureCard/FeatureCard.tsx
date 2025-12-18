import React from 'react'
import { View, Text } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Icon } from '../Icon'
import { type IconName } from '../Icon/types'

interface FeatureCardProps {
	icon: IconName
	text: string
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ icon, text }) => {
	return (
		<View className="flex-row items-center gap-4 bg-transparent">
			<LinearGradient
				colors={['#2B2B2B', '#C5F68066']}
				locations={[0, 1]}
				start={{ x: 0.5, y: 0 }}
				end={{ x: 0.5, y: 1 }}
				className="h-16 w-16 items-center justify-center"
				style={{ padding: 8, borderRadius: 8 }}
			>
				<Icon name={icon} size={30} color="#FFFFFF" />
			</LinearGradient>
			<Text className="text-t2 text-light-text-100">{text}</Text>
		</View>
	)
}
