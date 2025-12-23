import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native'
import { PurpleGradient } from '@/shared/ui/GradientBG/PurpleGradient'
import Entypo from '@expo/vector-icons/Entypo'
import React from 'react'
import { router } from 'expo-router'

export  function StatsDetailPageLayout({children, isLoading, title}: {children: React.ReactNode, isLoading: boolean, title: string}) {
	return (
		<View className="flex-1 bg-black">
			<View className="h-32 overflow-hidden rounded-b-3xl ">
				<PurpleGradient />
				<View className="relative flex-row items-center justify-center px-4 pb-6 pt-12">
					<TouchableOpacity
						onPress={() => router.back()}
						className="absolute left-4 z-10 items-center justify-center rounded-2xl bg-white/10 p-4"
					>
						<Entypo name="chevron-small-left" size={24} color="white" />
					</TouchableOpacity>

					<View className="items-center">
						<Text className="text-t1 text-white">{title}</Text>
						<Text className="text-t3 text-light-text-500">За всё время</Text>
					</View>
				</View>
			</View>
			{isLoading ? (
				<View className="flex-1 items-center justify-center">
					<ActivityIndicator color="white" />
				</View> ) :  children  }
		</View>
	)
}