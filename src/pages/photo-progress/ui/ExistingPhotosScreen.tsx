import { useMemo, useRef, useState } from 'react'
import {
	Image,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import type { ProgressSeries } from '@/entities/progress/model/types'
import { sharedStyles } from '@/shared/ui/styles/shared-styles'
import { router } from 'expo-router'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'
import { useProgressSeriesQuery, useResetProgressMutation } from '@/entities/progress'
import { Button } from '@/shared/ui'
import { PhotoProgressLabels } from '@/shared/constants/labels'
import { MonthChanges } from '@/pages/photo-progress/ui/MonthChanges'

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
	const [now] = useState(() => Date.now())
	const { mutateAsync: resetProgress, isPending: isResetting } = useResetProgressMutation()
	const { refetch } = useProgressSeriesQuery()
	const scrollRef = useRef<ScrollView>(null)


	const latestPhotoTimestamp = useMemo(
		() =>
			Math.max(
				...data.flatMap((series) => series.photos.map((item) => new Date(item.createdAt).getTime())),
				0
			),
		[data]
	)

	const daysSinceLast = latestPhotoTimestamp ? Math.floor((now - latestPhotoTimestamp) / MS_IN_DAY) : 0
	const daysUntilNext = Math.max(0, DAYS_INTERVAL - daysSinceLast)


	const getBottomLabel = () => {
		return data.length == 1 ? PhotoProgressLabels.SinglePhoto : daysUntilNext > 0 ? PhotoProgressLabels.MoreThanOnePhoto : PhotoProgressLabels.LoadMore
	}
	return (
		<View className="flex-1 justify-between py-6">
			<View className="gap-8">

				{data.length > 1 ? <MonthChanges photos={data}/> : null}

				<View className="flex-row  gap-4 px-1">

					{

						daysUntilNext > 0	? <View className=" justify-between rounded-3xl bg-[#1a1a1a] px-3 py-5">
						<Text style={sharedStyles.titleCenter}>
					{daysUntilNext}
						</Text>
						<Text className="text-center text-caption-regular leading-4 text-light-text-500 mt-3">
					{`${getDayWord(daysUntilNext)} до`}
					{'\n'}следующего{'\n'} фото
				</Text>
			</View> : 		<View className="rounded-3xl  bg-[#1a1a1a] px-3 py-5">
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
					}

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

					<ScrollView
						ref={scrollRef}
						horizontal
						showsHorizontalScrollIndicator={false}
						contentContainerStyle={styles.calendarDays}
					>
					<View className="gap-3 flex-row">
						{data.map((series) => {
							return (
								<View
									key={`${series.dateId}-${series.batchId}`}
									nativeID={series.dateId}
									testID={series.dateId}
								>
									<TouchableOpacity
										accessibilityRole="button"
										activeOpacity={0.8}
										onPress={() =>
											router.push({
												pathname: '/photo-progress/[dateId]',
												params: { dateId: series.dateId, batchId: series.batchId },
											})
										}
									>
										<View className="w-[124px] flex-row flex-wrap gap-2">
											{series.photos.map((photo) => (
												<View
													key={`${series.dateId}-${photo.id}`}
													className="h-14 w-14 overflow-hidden rounded-lg bg-[#c7c7c7]"
												>
													<Image
														source={{ uri: photo.uri }}
														className="h-full w-full"
														resizeMode="cover"
													/>
												</View>
											))}
										</View>
									</TouchableOpacity>
								</View>
							)
						})}
					</View>
					</ScrollView>
				</View>

				{data.length == 1 ? 		<View className="items-center gap-3 px-8">
						<Text style={sharedStyles.titleCenter}>
							Отличное начало!
						</Text>
						<Text className="text-center text-t2 text-light-text-200">
							{PhotoProgressLabels.SinglePhotoMotivation}
						</Text>
					</View> : null
				}
			</View>

			 <View className="gap-3">
				<Button
					variant="secondary"
					size="s"
					fullWidth
					disabled={isResetting}
					onPress={async () => {
						await resetProgress()
						await refetch()
					}}
				>
					{isResetting ? 'Удаляем...' : 'Удалить все фото'}
				</Button>
			</View>
			<View className="gap-3 px-2">
				<View className="rounded-[18px] bg-[#444444] px-6 py-4">
					<Text className="text-center text-body-medium text-light-text-100">
						{	getBottomLabel()}
					</Text>
				</View>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	calendarDays: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		gap: 16,
		paddingHorizontal: 10,
	}
})