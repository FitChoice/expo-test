import React, { useMemo } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import { Image, Text, TouchableOpacity, View } from 'react-native'
import { sideTitle } from '@/shared/constants/labels'
import { Loader } from '@/shared/ui'
import { BackgroundLayoutSafeArea } from '@/shared/ui/BackgroundLayout/BackgroundLayoutSafeArea'
import Entypo from '@expo/vector-icons/Entypo'
import { useProgressSeriesQuery } from '@/entities/progress'
import { PROGRESS_SIDE_ORDER } from '@/entities/progress/lib/series'

type ScreenParams = {
	dateId?: string
	batchId?: string
}

export const PhotoSetShow = () => {
	const { dateId, batchId } = useLocalSearchParams<ScreenParams>()
	const resolvedDateId = Array.isArray(dateId) ? dateId[0] : dateId
	const resolvedBatchId = Array.isArray(batchId) ? batchId[0] : batchId
	const { data, isLoading } = useProgressSeriesQuery()

	const currentSeries = useMemo(() => {
		if (!resolvedDateId || !resolvedBatchId) return undefined
		const series = data?.find(
			(item) => item.dateId === resolvedDateId && item.batchId === resolvedBatchId,
		)
		if (!series) return undefined

		const orderedPhotos = PROGRESS_SIDE_ORDER.map((side) =>
			series.photos.find((item) => item.side === side),
		).filter(Boolean) as typeof series.photos

		return { ...series, photos: orderedPhotos }
	}, [data, resolvedBatchId, resolvedDateId])

	if (isLoading) {
		return (
			<BackgroundLayoutSafeArea needBg={false}>
				<View className="flex-1 items-center justify-center">
					<Loader />
				</View>
			</BackgroundLayoutSafeArea>
		)
	}

	if (!resolvedDateId || !resolvedBatchId || !currentSeries) {
		return (
			<BackgroundLayoutSafeArea needBg={false}>
				<View className="flex-1 items-center justify-center px-6">
					<TouchableOpacity
						onPress={() => router.back()}
						className="absolute left-4 top-10 z-10 items-center justify-center rounded-2xl bg-white/10 p-4"
					>
						<Entypo name="chevron-small-left" size={24} color="white" />
					</TouchableOpacity>
					<Text className="text-center text-t2 text-light-text-100">
						Не удалось найти выбранный набор фотографий
					</Text>
				</View>
			</BackgroundLayoutSafeArea>
		)
	}

	return (
		<BackgroundLayoutSafeArea needBg={false}>
<View className="flex-row items-center py-7" >
	<TouchableOpacity
		onPress={() => router.back()}
		className="items-center justify-center rounded-2xl bg-white/10 p-4 mr-7"
		testID="photo-set-show-back"
		accessibilityRole="button"
	>
		<Entypo name="chevron-left" size={24} color="white" />
	</TouchableOpacity>

	<View >
		<Text className="text-t1.1 text-light-text-100">
			{resolvedDateId}
		</Text>
	</View>
</View>

			<View className="flex-1 flex-row flex-wrap gap-3">
				{currentSeries.photos.map((item, idx) => (
					<View
						key={`${item.side}-${item.id}`}
						className="h-[260px] w-[48%]  "
						style={{ marginBottom: idx === 0 || idx === 1 ? 40 : 0 }}
					>
						<View className=" items-center justify-center">
							<Text className="text-t4 mb-2 rounded-3xl bg-[#454545]/70 px-4 py-2 text-light-text-100">{sideTitle[item.side]}</Text>
						</View>
						<View className="overflow-hidden rounded-2xl border border-[#2a2a2a]">
							<Image source={{ uri: item.uri }} className="h-full w-full" resizeMode="cover" />
						</View>
					</View>
				))}
			</View>
		</BackgroundLayoutSafeArea>
	)
}