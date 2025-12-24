import { useMemo, useState } from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'

import { type ProgressSeries, type ProgressSide } from '@/entities/progress'
import { PROGRESS_SIDE_ORDER } from '@/entities/progress/lib/series'
import { sideTitle } from '@/shared/constants/labels'

type Props = {
	photos: ProgressSeries[]
}

const SIDE_LABELS: Record<ProgressSide, string> = {
	front: sideTitle.front,
	back: sideTitle.back,
	left: sideTitle.left,
	right: sideTitle.right,
}

const SIDE_BUTTON_ORDER: ProgressSide[] = ['front', 'back', 'left', 'right']

const getLatestPhotoBySide = (series: ProgressSeries | undefined, side: ProgressSide) => {
	if (!series) return undefined
	return [...series.photos]
		.filter((item) => item.side === side)
		.sort((a, b) => Number(new Date(b.createdAt)) - Number(new Date(a.createdAt)))[0]
}

export const MonthChanges = ({ photos }: Props) => {
	const [selectedSide, setSelectedSide] = useState<ProgressSide>('front')

	const firstSeries = useMemo(() => photos[0], [photos])
	const lastSeries = useMemo(() => photos[photos.length - 1], [photos])

	const firstPhoto = useMemo(
		() => getLatestPhotoBySide(firstSeries, selectedSide),
		[firstSeries, selectedSide],
	)
	const lastPhoto = useMemo(
		() => getLatestPhotoBySide(lastSeries, selectedSide),
		[lastSeries, selectedSide],
	)

	const renderCard = (photo: typeof firstPhoto, dateLabel: string | undefined, isLeft = false) => (
		<View className="flex-1 items-center gap-4">
			<View
				className="w-full overflow-hidden rounded-[32px] bg-[#d9d9d9]"
				style={{ aspectRatio: 3 / 4 }}
			>
				{photo ? (
					<Image source={{ uri: photo.uri }} className="h-full w-full" resizeMode="cover" />
				) : null}
			</View>
			<View
				className={`rounded-full px-5 py-2 ${
					isLeft ? 'bg-[#C5F680]' : 'bg-[#3d3d3d]'
				} shadow-sm`}
			>
				<Text
					className={`text-center text-t3 ${
						isLeft ? 'text-[#121212]' : 'text-light-text-100'
					}`}
				>
					{dateLabel ?? '—'}
				</Text>
			</View>
		</View>
	)

	return (
		<View className="gap-6 rounded-3xl bg-[#121212] px-4 py-6">
			<Text className="text-t1.1 font-semibold text-light-text-100">Изменения за месяц</Text>

			<View className="flex-row flex-wrap gap-3">
				{SIDE_BUTTON_ORDER.map((side) => {
					const isActive = selectedSide === side
					return (
						<TouchableOpacity
							key={side}
							onPress={() => setSelectedSide(side)}
							activeOpacity={0.9}
							className={`rounded-3xl px-5 py-5 ${
								isActive ? 'bg-[#AAEC4D]' : 'bg-[#2f2f2f]'
							}`}
							accessibilityRole="button"
							accessibilityState={{ selected: isActive }}
						>
							<Text
								className={'text-t3 text-light-text-100'}
							>
								{SIDE_LABELS[side].split(' ')[1]}
							</Text>
						</TouchableOpacity>
					)
				})}
			</View>

			<View className="flex-row gap-4">
				{renderCard(firstPhoto, firstSeries?.dateId, true)}
				{renderCard(lastPhoto, lastSeries?.dateId, false)}
			</View>
		</View>
	)
}