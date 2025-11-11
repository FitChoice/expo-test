import React from 'react'
import { View, Text } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Icon } from '../Icon'
import { IconName } from '../Icon/types'

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
					className="h-26 w-26 items-center justify-center"
					style={{ padding: 8, borderRadius: 8 }}
				>
					<Icon name={icon} size={30}  color="#FFFFFF"  />
				</LinearGradient>
			<Text className="flex-1 font-inter text-t2 font-normal leading-[19.2px] text-light-text-100">
				{text}
			</Text>
		</View>
	)
}

