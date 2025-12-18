import React from 'react'
import { View, Text } from 'react-native'
import { Input } from '@/shared/ui'

interface NameStepProps {
	name: string
	onNameChange: (name: string) => void
}

export const NameStep: React.FC<NameStepProps> = ({ name, onNameChange }) => {
	return (
		<>
			<Text className="mb-8 w-full text-left text-[32px] font-bold text-white">
				Как к вам обращаться?
			</Text>
			<View className="mb-6 w-full">
				<Input
					label=""
					placeholder="Ваше имя"
					value={name}
					onChangeText={onNameChange}
					variant="text"
					size="default"
				/>
			</View>
		</>
	)
}
