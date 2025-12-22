import React from 'react'
import { Text, View,  FlatList } from 'react-native'

import { useQuery } from '@tanstack/react-query'

import { statsApi } from '@/features/stats/api/statsApi'
import { getUserId } from '@/shared/lib/auth'
import { ActivityCard } from '@/shared/ui/ActivityCard'

import {
	StatsDetailPageLayout
} from '@/shared/ui/StatsDetailPageLayout/StatsDetailPageLayout'

export const TrainingsCountScreen = () => {

	const { data: userId } = useQuery({
		queryKey: ['userId'],
		queryFn: getUserId,
	})

	const { data: trainings, isLoading } = useQuery({
		queryKey: ['trainings', userId],
		queryFn: async () => {
			if (!userId) return []
			const result = await statsApi.getTrainings({ userId, kind: 't', limit: 100 })
			if (result.success) {
				return result.data.trainings
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
		<StatsDetailPageLayout isLoading={isLoading} title={'Тренировки'}>
				<FlatList
					data={trainings}
					keyExtractor={(item) => item.id.toString()}
					renderItem={({ item }) => (
						<ActivityCard
							label={item.title}
							date={formatDate(item.date)}
							minutes={`${item.duration} minutes`}
							onPress={() => {}}
						/>
					)}
					contentContainerStyle={{
						padding: 16,
						gap: 12,
					}}
					ListEmptyComponent={
						<View className="flex-1 items-center justify-center pt-10">
							<Text className="text-t2 text-white opacity-50">
								Тренировок пока нет
							</Text>
						</View>
					}
				/>
		</StatsDetailPageLayout>
	)
}

