import { useMemo, useRef } from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'
import type { ProgressSeries } from '@/entities/progress/model/types'
import { sharedStyles } from '@/shared/ui/styles/shared-styles'
import { PROGRESS_SIDE_ORDER } from '@/entities/progress/lib/series'
import { router } from 'expo-router'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'

type Props = {
	data: ProgressSeries[]
	onAddPress: () => void
}

const DAYS_INTERVAL = 30
const MS_IN_DAY = 1000 * 60 * 60 * 24

const getDayWord = (value: number) => {
	const mod10 = value % 10
	const mod100 = value % 100

	if (mod10 === 1 && mod100 !== 11) return 'день'
	if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'дня'
	return 'дней'
}

export const ExistingPhotosScreen = ({ data, onAddPress }: Props) => {
	const nowRef = useRef<number | null>(null)
	if (nowRef.current === null) {
		nowRef.current = Date.now()
	}

	const latestPhotoTimestamp = useMemo(
		() =>
			Math.max(
				...data.flatMap((series) => series.photos.map((item) => new Date(item.createdAt).getTime())),
				0
			),
		[data]
	)

	const daysSinceLast = latestPhotoTimestamp
		? Math.floor(((nowRef.current ?? Date.now()) - latestPhotoTimestamp) / MS_IN_DAY)
		: 0
	const daysUntilNext = Math.max(0, DAYS_INTERVAL - daysSinceLast)

	return (
		<View className="flex-1 justify-between py-6">
			<View className="gap-8">
				<View className="flex-row  gap-4 px-1">
					<View className=" justify-between rounded-3xl bg-[#1a1a1a] px-3 py-5">
						<Text style={sharedStyles.titleCenter}>
							{daysUntilNext}
						</Text>
						<Text className="text-center text-caption-regular leading-4 text-light-text-500 mt-3">
							{`${getDayWord(daysUntilNext)} до`}
							{'\n'}следующего{'\n'} фото
						</Text>
					</View>

					<View className="rounded-3xl  bg-[#1a1a1a] px-3 py-5">
					<TouchableOpacity
						className=" items-center"
						onPress={onAddPress}
						accessibilityRole="button"
						activeOpacity={0.8}
						testID="add-progress-photo"
					>
						<FontAwesome6 name="plus" size={24} color="#AAEC4D" />
						<Text className="text-center text-caption-regular leading-4 text-brand-green-900 mt-3">
							Добавить{'\n'} фото
						</Text>
					</TouchableOpacity>
					</View>
					<View className="gap-3">
						{data.map((series) => {
							const orderedSeries = PROGRESS_SIDE_ORDER.map((side) => ({
								side,
								photo: series.photos.find((item) => item.side === side),
							}))

							return (
								<View key={series.dateId} nativeID={series.dateId} testID={series.dateId}>
									<TouchableOpacity
										accessibilityRole="button"
										activeOpacity={0.8}
										onPress={() =>
											router.push({
												pathname: '/photo-progress/[dateId]',
												params: { dateId: series.dateId },
											})
										}
									>
										<View className="w-[124px] flex-row flex-wrap gap-2">
											{orderedSeries.map(({ side, photo }) => (
												<View
													key={`${series.dateId}-${side}`}
													className="h-14 w-14 overflow-hidden rounded-lg bg-[#c7c7c7]"
												>
													{photo ? (
														<Image
															source={{ uri: photo.uri }}
															className="h-full w-full"
															resizeMode="cover"
														/>
													) : (
														<View className="flex-1" />
													)}
												</View>
											))}
										</View>
									</TouchableOpacity>
								</View>
							)
						})}
					</View>
				</View>

				<View className="items-center gap-3 px-8">
					<Text style={sharedStyles.titleCenter}>
						Отличное начало!
					</Text>
					<Text className="text-center text-t2 text-light-text-200">
						Через месяц вы сможете добавить новое фото — и увидеть коллаж, который покажет,
						как изменилась ваша форма
					</Text>
				</View>
			</View>

			<View className="gap-3 px-2">
				<View className="rounded-[18px] bg-[#444444] px-6 py-4">
					<Text className="text-center text-body-medium text-light-text-100">
						Мы подскажем, когда будет время сделать следующее фото
					</Text>
				</View>
			</View>
		</View>
	)
}