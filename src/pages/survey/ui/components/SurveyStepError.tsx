import React from 'react'
import { View, Text } from 'react-native'
import { sharedStyles } from '@/shared/ui/styles/shared-styles'
import { Button } from '@/shared/ui'

interface SurveyStepErrorProps {
	error: string
	onRetry: () => void
	onBack: () => void
}

/**
 * Экран ошибки отправки данных опроса
 */
export const SurveyStepError: React.FC<SurveyStepErrorProps> = ({
	error,
	onRetry,
	onBack,
}) => {
	return (
		<View className="flex-1 items-center justify-center gap-16 bg-transparent px-4">
			<View className="items-center gap-2 bg-transparent">
				<Text style={sharedStyles.title}>Ошибка</Text>
				<Text className="font-inter text-center text-base font-normal leading-[19.2px] text-white">
					{error}
				</Text>
			</View>
			<View className="w-full gap-2">
				<Button variant="primary" size="l" fullWidth onPress={onRetry}>
					Повторить попытку
				</Button>
				<Button variant="tertiary" size="l" fullWidth onPress={onBack}>
					Назад
				</Button>
			</View>
		</View>
	)
}
