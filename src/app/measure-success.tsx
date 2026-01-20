import React from 'react'
import { View, Text } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaContainer, Button } from '@/shared/ui'

export default function MeasureSuccessScreen() {
	const router = useRouter()

	return (
		<View className="flex-1 bg-black">
			<SafeAreaContainer className="flex-1 items-center justify-center px-4">
				<View className="items-center gap-6">
					<Text className="text-center font-rimma text-3xl text-white">
						ДАННЫЕ ВНЕСЕНЫ
					</Text>
					<Text className="text-center text-body-regular text-light-text-200">
						Ваши замеры успешно сохранены в системе
					</Text>
					<Button
						variant="primary"
						size="l"
						fullWidth
						onPress={() => router.replace('/stats')}
					>
						Вернуться к статистике
					</Button>
				</View>
			</SafeAreaContainer>
		</View>
	)
}
