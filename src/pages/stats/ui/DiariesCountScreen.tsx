import React from 'react'
import { Text, View, FlatList } from 'react-native'
import { router } from 'expo-router'

import {
	StatsDetailPageLayout
} from '@/shared/ui/StatsDetailPageLayout/StatsDetailPageLayout'
import { useDiariesQuery } from '@/features/stats'
import { ActivityCard } from '@/shared/ui'
import { formatDateDots } from '@/shared/lib/formatters'

export const DiariesCountScreen = () => {
	const { data: diaries, isLoading } = useDiariesQuery()

	return (
		<StatsDetailPageLayout isLoading={isLoading} title={'Записи в дневнике'}>
			<FlatList
				data={diaries}
				keyExtractor={(item) => item.id.toString()}
				renderItem={({ item }) => (
					<ActivityCard
						label={'Запись'}
						date={formatDateDots(item.date)}
						onPress={() =>
							router.push({
								pathname: '/diary/completed',
								params: {
									id: String(item.id),
									date: formatDateDots(item.date),
								},
							})
						}
					/>
				)}
				contentContainerStyle={{
					padding: 16,
					gap: 12,
				}}
				ListEmptyComponent={
					<View className="flex-1 items-center justify-center pt-10">
						<Text className="text-t2 text-white opacity-50">
							Записей пока нет
						</Text>
					</View>
				}
			/>
		</StatsDetailPageLayout>
	)
}
