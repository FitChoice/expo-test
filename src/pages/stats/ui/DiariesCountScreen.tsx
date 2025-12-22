import React from 'react'
import { Text, View, FlatList } from 'react-native'
import { router } from 'expo-router'
import {
	StatsDetailPageLayout
} from '@/shared/ui/StatsDetailPageLayout/StatsDetailPageLayout'
import { useQuery } from '@tanstack/react-query'
import { getUserId } from '@/shared/lib'
import { statsApi } from '@/features/stats'
import { ActivityCard } from '@/shared/ui'

export const DiariesCountScreen = () => {


	const { data: userId } = useQuery({
		queryKey: ['userId'],
		queryFn: getUserId,
	})

	const { data: diaries, isLoading } = useQuery({
		queryKey: ['diaries', userId],
		queryFn: async () => {
			if (!userId) return []
			const result = await statsApi.getDiaries({ userId, limit: 100 })
			if (result.success) {
				return result.data.diaries
			}
			return []
		},
		enabled: !!userId,
	})

	const formatDate = (dateString: string) => {
		const date = new Date(dateString)
		const day = String(date.getDate()).padStart(2, '0')
		const month = String(date.getMonth() + 1).padStart(2, '0')
		const year = date.getFullYear()
		return `${day}.${month}.${year}`
	}

	return (
		<StatsDetailPageLayout isLoading={isLoading} title={'Записи в дневнике'}>
			<FlatList
				data={diaries}
				keyExtractor={(item) => item.id.toString()}
				renderItem={({ item }) => (
					<ActivityCard
						label={'Запись'}
						date={formatDate(item.date)}
					//	minutes={`${item.duration} minutes`}
						onPress={() =>
							router.push({
								pathname: '/diary/completed',
								params: {
									id: String(item.id),
									date: formatDate(item.date),
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