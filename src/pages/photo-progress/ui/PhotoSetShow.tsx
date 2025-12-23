import React, { useMemo } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import { Image, Text, TouchableOpacity, View } from 'react-native'
import { sideTitle } from '@/shared/constants/labels'
import { Loader } from '@/shared/ui'
import { BackgroundLayoutSafeArea } from '@/shared/ui/BackgroundLayout/BackgroundLayoutSafeArea'
import Entypo from '@expo/vector-icons/Entypo'
import { useProgressSeriesQuery } from '@/entities/progress'

type ScreenParams = {
	dateId?: string
}

export const PhotoSetShow = () => {
	const { dateId } = useLocalSearchParams<ScreenParams>()
	const resolvedDateId = Array.isArray(dateId) ? dateId[0] : dateId
	const { data, isLoading } = useProgressSeriesQuery()

	const currentSeries = useMemo(
		() => data?.find((series) => series.dateId === resolvedDateId),
		[data, resolvedDateId],
	)

	if (isLoading) {
		return (
			<BackgroundLayoutSafeArea needBg={false}>
				<View className="flex-1 items-center justify-center">
					<Loader />
				</View>
			</BackgroundLayoutSafeArea>
		)
	}

	if (!resolvedDateId || !currentSeries) {
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
			<TouchableOpacity
				onPress={() => router.back()}
				className="absolute left-4 z-10 top-14 items-center justify-center rounded-2xl bg-white/10 p-4"
				testID="photo-set-show-back"
				accessibilityRole="button"
			>
				<Entypo name="chevron-left" size={24} color="white" />
			</TouchableOpacity>

			<View className="mb-10">
				<Text className="text-center text-t1.1 text-light-text-100">{resolvedDateId}</Text>
			</View>

			<View className="flex-1 flex-row flex-wrap gap-3">
				{currentSeries.photos.map((item, idx) => (
					<View
						key={`${item.side}-${item.id}`}
						className="h-[260px] w-[48%]"
						style={{ marginBottom: idx === 0 || idx === 1 ? 20 : 0 }}
					>
						<View className="mb-2 rounded-3xl bg-[#454545]/70 px-4 py-2">
							<Text className="text-t4 text-light-text-100">{sideTitle[item.side]}</Text>
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