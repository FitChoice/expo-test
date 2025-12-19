import React from 'react'
import { Text, View, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import Feather from '@expo/vector-icons/Feather'
import { BackgroundLayoutSafeArea } from '@/shared/ui/BackgroundLayout/BackgroundLayoutSafeArea'

export const DiariesCountScreen = () => {
	const router = useRouter()

	return (
		<BackgroundLayoutSafeArea>
			<View className="flex-row items-center gap-4 mb-6">
				<TouchableOpacity
					onPress={() => router.back()}
					className="h-10 w-10 items-center justify-center rounded-full bg-white/10"
				>
					<Feather name="arrow-left" size={20} color="white" />
				</TouchableOpacity>
				<Text className="text-h2 text-white">Записи дневника</Text>
			</View>

			<View className="flex-1 items-center justify-center">
				<Text className="text-body-medium text-white/50">Здесь будет статистика по записям в дневнике</Text>
			</View>
		</BackgroundLayoutSafeArea>
	)
}

