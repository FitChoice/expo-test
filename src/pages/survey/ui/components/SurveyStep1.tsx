import React from 'react'
import { View, Text } from 'react-native'
import { Input } from '@/shared/ui'
import { sharedStyles } from '@/shared/ui/styles/shared-styles'

interface SurveyStep1Props {
	name: string
	onNameChange: (name: string) => void
}

/**
 * Шаг 1: Ввод имени пользователя
 */
export const SurveyStep1: React.FC<SurveyStep1Props> = ({ name, onNameChange }) => {
	return (
		<>
			<Text style={sharedStyles.title}>Как к вам обращаться?</Text>
			<View className="bg-transparent">
				<Input
					label=""
					placeholder="Ваше имя"
					value={name}
					onChangeText={onNameChange}
					autoFocus
					variant="text"
					size="default"
				/>
			</View>
		</>
	)
}
