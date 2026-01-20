import React from 'react'
import { Text, View, FlatList } from 'react-native'

import {
	StatsDetailPageLayout
} from '@/shared/ui/StatsDetailPageLayout/StatsDetailPageLayout'
import { useTrainingsQuery } from '@/features/stats'
import { ActivityCard } from '@/shared/ui'
import { formatDateDots } from '@/shared/lib/formatters'

export const TrainingsCountScreen = () => {
	const { data: trainings, isLoading } = useTrainingsQuery('t')

	return (
		<StatsDetailPageLayout isLoading={isLoading} title={'Тренировки'}>
			<FlatList
				data={trainings}
				keyExtractor={(item) => item.id.toString()}
				renderItem={({ item }) => (
					<ActivityCard
						label={item.title}
						date={formatDateDots(item.date)}
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
