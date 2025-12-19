import React from 'react'
import { Text, View, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import Entypo from '@expo/vector-icons/Entypo';
import { PurpleGradient } from '@/shared/ui/GradientBG/PurpleGradient'


export const TrainingsCountScreen = () => {
	const router = useRouter()

	return (
		<View className='flex-1 bg-black'>
			<View className='h-32 overflow-hidden rounded-b-3xl'>
			<PurpleGradient />
			<View className="relative flex-row items-center justify-center pt-12 pb-6 px-4">
				<TouchableOpacity
					onPress={() => router.back()}
					className="absolute left-4 z-10 items-center justify-center rounded-2xl bg-white/10 p-4"
				>
					<Entypo name="chevron-small-left" size={24} color="white" />
				</TouchableOpacity>

				<View className="items-center">
					<Text className="text-t1 text-white">Тренировки</Text>
					<Text className="text-t3 text-light-text-500">За всё время</Text>
				</View>
			</View>

			</View>

			<View className="flex-1 items-center justify-center">
				<Text className="text-body-medium text-white/50">Здесь будет статистика по тренировкам</Text>
			</View>


		</View>
	)
}

