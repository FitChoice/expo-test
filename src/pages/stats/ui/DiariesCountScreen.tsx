import React from 'react'
import { Text, View, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import Feather from '@expo/vector-icons/Feather'
import { BackgroundLayoutSafeArea } from '@/shared/ui/BackgroundLayout/BackgroundLayoutSafeArea'
import {
	StatsDetailPageLayout
} from '@/shared/ui/StatsDetailPageLayout/StatsDetailPageLayout'

export const DiariesCountScreen = () => {

	return (
		<StatsDetailPageLayout isLoading={false} title={'Записи в дневнике'}>
			<View className="flex-1 items-center justify-center">
				<Text className="text-body-medium text-white/50">Здесь будет статистика по записям в дневнике</Text>
			</View>
		</StatsDetailPageLayout>
	)
}

