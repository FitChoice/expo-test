import React, { useEffect, useMemo, useState } from 'react'
import { View, Text, Image, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import Feather from '@expo/vector-icons/Feather'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import Fontisto from '@expo/vector-icons/Fontisto'
import EvilIcons from '@expo/vector-icons/EvilIcons'
import { addMonths, differenceInCalendarDays, parseISO, startOfMonth } from 'date-fns';

import { Icon, Loader } from '@/shared/ui'
import { useChartQuery, useMainStatsQuery } from '@/features/stats'
import type { MainStatsResponse } from '@/features/stats'
import { getRatingOption } from '@/shared/constants'

import girlSample from '../../../../assets/images/girl_sample.png'
import girlMeasure from '../../../../assets/images/girl-measure.png'
import boyMeasure from '../../../../assets/images/boy-measure.png'
import boySample from '../../../../assets/images/boy_sample.png'
import Barbell from '@/assets/images/barbell.svg'
import Morning from '@/assets/images/morning_ex.svg'
import Diary from '@/shared/ui/Icon/assets/diary.svg'
import {
	CHART_BAR_HEIGHT_STEP,
	getBodyMetricLabel,
	getBodyMetricUnit,
	getCurrentMonthKey,
	getMonthPrepositional,
	calculateAverage,
	getMetricLabel,
	transformBodyChartData,
	transformChartData,
	type BodyChartDisplayPoint,
	type BodyMetric,
	type ChartDisplayPoint,
	type WellbeingMetric,
} from '../lib'
import { BodyMetricSelectorModal } from './BodyMetricSelectorModal'
import { MetricSelectorModal } from './MetricSelectorModal'
import { getUserId } from '@/shared/lib'
import { useProfileQuery } from '@/features/user'

type OverallStatConfig = {
	icon: React.ReactNode
	label: string
	key: keyof MainStatsResponse
	formatter?: (value: number) => string
}

const OVERALL_STATS_CONFIG: OverallStatConfig[] = [
	{
		icon: <Barbell color="#aaec4d" fill="#aaec4d" />,
		label: 'Тренировок',
		key: 'trainings_count',
	},
	{
		icon: <Morning color="#aaec4d" fill="#aaec4d" />,
		label: 'Энергии',
		key: 'quality_growth',
	},
	{
		icon: <Diary color="#aaec4d" fill="#aaec4d" />,
		label: 'Записей дневника',
		key: 'diaries_count',
	},
	{
		icon: <MaterialCommunityIcons name="clock" size={24} color="#aaec4d" />,
		label: 'Время тренировки',
		key: 'trainings_time',
		formatter: (minutes) => {
			const hours = Math.floor(minutes / 60)
			const mins = minutes % 60
			if (hours <= 0 && mins <= 0) return '0м'
			if (hours <= 0) return `${mins}м`
			return `${hours}ч ${mins}м`
		},
	},
	{
		icon: <Fontisto name="fire" size={24} color="#aaec4d" />,
		label: 'Калорий сожжено',
		key: 'cals',
	},
]

const WEEK_BAR_WIDTH = 40
const MONTH_BAR_WIDTH = 20
const BODY_BAR_WIDTH = 22
const BODY_BAR_MAX_HEIGHT = 72

interface ChartBarProps {
	point: ChartDisplayPoint
	isSelected: boolean
	onPress: () => void
	barWidth: number
}

const ChartBar = ({ point, isSelected, onPress, barWidth }: ChartBarProps) => {
	const { label, Icon: MoodIcon, color, height, value } = point
	const isEmpty = value === 0

	if (isEmpty) {
		return (
			<View style={{ width: barWidth }} className="items-center gap-2">
				<View style={{ height: 24, width: 24, opacity: 0 }} />
				<View style={{ height: CHART_BAR_HEIGHT_STEP, width: barWidth, opacity: 0 }} />
				<Text className="uppercase text-light-text-200">{label}</Text>
			</View>
		)
	}

	return (
		<TouchableOpacity
			onPress={onPress}
			activeOpacity={0.7}
			style={{ width: barWidth }}
			className="items-center gap-2"
		>
			<MoodIcon width={24} height={24} />
			<View
				style={{
					height,
					width: barWidth,
					borderWidth: isSelected ? 2 : 0,
					borderColor: isSelected ? '#C5F680' : 'transparent',
				}}
				className="overflow-hidden rounded-2xl bg-[#3f3f3f]"
			>
				<View style={{ height: 8, backgroundColor: color, width: '100%' }} />
			</View>
			<Text className="uppercase text-light-text-200">{label}</Text>
		</TouchableOpacity>
	)
}

interface BodyChartBarProps {
	point: BodyChartDisplayPoint
	isSelected: boolean
	onPress: () => void
}

const BodyChartBar = ({ point, isSelected, onPress }: BodyChartBarProps) => {
	const { label, height, value } = point
	const isEmpty = value === 0

	if (isEmpty) {
		return (
			<View style={{ width: BODY_BAR_WIDTH }} className="items-center gap-1">
				<View style={{ height: BODY_BAR_MAX_HEIGHT, width: BODY_BAR_WIDTH, opacity: 0 }} />
				<Text className="text-light-text-200">{label}</Text>
			</View>
		)
	}

	return (
		<TouchableOpacity
			onPress={onPress}
			activeOpacity={0.7}
			style={{ width: BODY_BAR_WIDTH }}
			className="items-center gap-1"
		>
			<View
				style={{
					height,
					width: BODY_BAR_WIDTH,
					backgroundColor: isSelected ? '#C5F680' : '#3F3F46',
				}}
				className="rounded-2xl"
			/>
			<Text className="text-light-text-200">{label}</Text>
		</TouchableOpacity>
	)
}

export function DayStatistic() {
	const { data: mainStats, isLoading: isStatsLoading, error: statsError } = useMainStatsQuery()
	const [selectedMetric, setSelectedMetric] = useState<WellbeingMetric>('mood')
	const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week')
	const [isMetricModalVisible, setIsMetricModalVisible] = useState(false)
	const [selectedBarKey, setSelectedBarKey] = useState<string | null>(null)
	const [selectedBodyMetric, setSelectedBodyMetric] = useState<BodyMetric>('weight')
	const [isBodyMetricModalVisible, setIsBodyMetricModalVisible] = useState(false)
	const [selectedBodyBarKey, setSelectedBodyBarKey] = useState<string | null>(null)


	// Local UI state
	const [userId, setUserId] = useState<number | null>(null)

	// Get userId on mount
	useEffect(() => {
		const fetchUserId = async () => {
			const id = await getUserId()
			setUserId(id)
		}
		fetchUserId()
	}, [])

	// Fetch profile data
	const { data: userProfile, isLoading: userProfileLoading } = useProfileQuery(userId)


	const {
		data: chartData,
		isLoading: isChartLoading,
		error: chartError,
	} = useChartQuery({
		kind: selectedMetric,
		period: selectedPeriod,
	})

	console.log('chartData')
	console.log(chartData)

	const {
		data: bodyChartData,
		isLoading: isBodyChartLoading,
		error: bodyChartError,
	} = useChartQuery({
		kind: selectedBodyMetric,
		period: 'year',
	})

	console.log('bodyChartData')
	console.log(bodyChartData)

	const overallStats = useMemo(
		() =>
			OVERALL_STATS_CONFIG.map(({ formatter, key, ...rest }) => {
				const value = mainStats ? mainStats[key] : undefined
				const formattedValue =
					value === undefined || value === null
						? '—'
						: formatter
							? formatter(value as number)
							: String(value)

				return { ...rest, value: formattedValue, key }
			}),
		[mainStats]
	)

	const displayPoints = useMemo(() => {
		if (!chartData?.stats) return []
		return transformChartData(chartData.stats, selectedPeriod)
	}, [chartData?.stats, selectedPeriod])

	const averageRating = useMemo(() => {
		if (!chartData?.stats) return 3
		return calculateAverage(chartData.stats)
	}, [chartData?.stats])

	const bottomDisplayData = useMemo(() => {
		if (selectedBarKey) {
			const selectedPoint = displayPoints.find((point) => point.key === selectedBarKey)
			if (selectedPoint && selectedPoint.value > 0) {
				return {
					Icon: selectedPoint.Icon,
					label: `${selectedPoint.label}: ${selectedPoint.value}`,
				}
			}
		}

		return {
			Icon: getRatingOption(averageRating).Icon,
			label: `В среднем: ${averageRating}`,
		}
	}, [selectedBarKey, displayPoints, averageRating])

	const barWidth = selectedPeriod === 'week' ? WEEK_BAR_WIDTH : MONTH_BAR_WIDTH
	const { Icon: BottomIcon, label: bottomLabel } = bottomDisplayData

	const bodyDisplayPoints = useMemo(() => {
		if (!bodyChartData?.stats) return []
		return transformBodyChartData(bodyChartData.stats)
	}, [bodyChartData?.stats])


	const bodyBottomDisplayData = useMemo(() => {
		const unit = getBodyMetricUnit(selectedBodyMetric)

		if (selectedBodyBarKey) {
			const selectedPoint = bodyDisplayPoints.find((point) => point.key === selectedBodyBarKey)
			if (selectedPoint && selectedPoint.value > 0) {
				const monthName = getMonthPrepositional(selectedPoint.key)
				return {
					value: `${selectedPoint.value} ${unit}`,
					label: `В ${monthName}`,
				}
			}
		}

		return {
			value: '—',
			label: 'Нет данных',
		}
	}, [selectedBodyBarKey, bodyDisplayPoints, selectedBodyMetric])

	useEffect(() => {
		setSelectedBarKey(null)
	}, [selectedMetric, selectedPeriod])

	useEffect(() => {
		if (bodyChartData?.stats) {
			const currentKey = getCurrentMonthKey(bodyChartData.stats)
			setSelectedBodyBarKey(currentKey)
		}
	}, [bodyChartData?.stats, selectedBodyMetric])


	const daysUntilNewMeasure = useMemo(() => {
		if (!bodyChartData?.stats || !bodyChartData?.stats.length) return 0

		const lastMeasureDateValue = bodyChartData.stats[0]?.date
		if (!lastMeasureDateValue) return 0
		const lastMeasureDate = parseISO(lastMeasureDateValue)
		const nextMonthStart = startOfMonth(addMonths(lastMeasureDate, 1))

		const result = differenceInCalendarDays(nextMonthStart, lastMeasureDate)
		return result as number

	}, [bodyChartData?.stats])



	if (userProfileLoading || !userProfile) {
		return <Loader />
	}


	return (
		<>
			{/* Weekly summary */}
			<View className="mb-6 gap-3">
				<Text className="text-t.1 text-white">На этой неделе</Text>
				<View className="flex-row gap-3">
					<View className="flex-1 overflow-hidden rounded-3xl">
						<LinearGradient
							colors={['#A172FF', '#2b233c']}
							start={{ x: -0.5, y: 0 }}
							end={{ x: 0.6, y: 0.6 }}
							style={{ flex: 1, padding: 16 }}
						>
							<View className="mt-3 items-start gap-3">
								<View className="flex-row items-center gap-5">
									<FontAwesome6 name="bolt" size={14} color="#a172ff" />
									<Text className="text-h2 text-white">
										{mainStats?.streak ?? '—'}
									</Text>
								</View>
								<Text className="text-caption-regular text-light-text-500">
									Тренировок подряд
								</Text>
							</View>
						</LinearGradient>
					</View>

					<View className="flex-1 overflow-hidden rounded-3xl">
						<LinearGradient
							colors={['#C5F680', '#2d3326']}
							start={{ x: 3, y: -1 }}
							end={{ x: 0.5, y: 1  }}
							style={{ flex: 1, padding: 16 }}
						>
							<View className="mt-3 items-start gap-3">
								<View className="flex-row items-center gap-5">
									<Feather name="arrow-up" size={24} color="#aaec4d" />
									<Text className="text-h2 text-brand-green-500">
										{mainStats?.quality_growth ? `${mainStats.quality_growth}%` : '—'}
									</Text>
								</View>
								<Text className="text-caption-regular text-light-text-500">
									Чистота техники
								</Text>
							</View>
						</LinearGradient>
					</View>
				</View>
			</View>

			{/* All time stats */}
			<View className="mb-6">
				<Text className="text-t.1 text-white mb-2">За всё время</Text>

				<View className="flex-row flex-wrap gap-3">
					{isStatsLoading ? (
						<View className="mt-2 w-full items-center justify-center rounded-2xl bg-[#1e1e1e] py-6">
							<ActivityIndicator color="#aaec4d" />
							<Text className="text-body-medium text-light-text-300 mt-2">
								Загружаем статистику...
							</Text>
						</View>
					) : statsError ? (
						<View className="w-full rounded-2xl bg-[#1e1e1e] p-4">
							<Text className="text-body-medium text-feedback-negative-900">
								{statsError.message}
							</Text>
						</View>
					) : (
						overallStats.map((stat, idx) => (
							<View
								key={stat.label}
								className={`rounded-2xl bg-[#1e1e1e] px-2 py-4 ${
									idx === 2 ? 'basis-full' : 'basis-[48%]'
								}`}
							>
								<View className="mb-2 flex-row items-center justify-between">
									<View className="flex-row">
										<Text> {stat.icon} </Text>
										<Text className="text-h2 text-light-text-100">{stat.value}</Text>
									</View>
									{
										stat.key === 'trainings_count' || stat.key === 'quality_growth' || stat.key === 'diaries_count' ? (
											<TouchableOpacity onPress={() => router.push(`/${stat.key}`)}>
												<View className="items-center justify-center rounded-2xl bg-[#F4F4F4]/20 p-2">
													<Feather name="arrow-right" size={24} color="white" />
												</View>
											</TouchableOpacity>
										) : null
									}

								</View>

								<Text className="text-caption-regular text-light-text-500">
									{stat.label}
								</Text>
							</View>
						))
					)}
				</View>
			</View>

			{/* Photo progress */}
			<View className="bg-[#1b1b1b] mb-10 rounded-3xl ">
				<View className="flex-row">
					<View className="h-48 flex-1 justify-between pt-6 pl-4 pb-2">
						<Text className="text-t1.1 text-white">Фото-прогресс</Text>
						<TouchableOpacity
							className="h-20 w-20 items-center justify-center rounded-full bg-brand-purple-500"
							activeOpacity={0.9}
							onPress={() => router.push('/photo-progress')}
						>
							<Icon name="chevrons-right" size={28} color="#FFFFFF" />
						</TouchableOpacity>
					</View>

					<Image source={userProfile.gender === 'male' ?	boySample :  girlSample} className="h-50 w-50" resizeMode="contain" />
				</View>
			</View>

			{/* Mood chart */}
			<View className="bg-[#1b1b1b] mb-6 p-4 rounded-[5%]">
				<View className="mb-4 flex-row items-center justify-between">
					<Text className="text-t1.1 text-white">Общее состояние</Text>
					<TouchableOpacity
						activeOpacity={0.8}
						onPress={() =>
							setSelectedPeriod((prev) => (prev === 'week' ? 'month' : 'week'))
						}
					>
						<Text className="text-t3 text-light-text-500">
							{selectedPeriod === 'week' ? 'За эту неделю' : 'За этот месяц'}
						</Text>
					</TouchableOpacity>
				</View>

				<TouchableOpacity
					className="w-40 flex-row items-center justify-center rounded-2xl bg-fill-800 py-2"
					activeOpacity={0.9}
					onPress={() => setIsMetricModalVisible(true)}
				>
					<Text className="text-t3 text-light-text-200">
						{getMetricLabel(selectedMetric)}
					</Text>
					<EvilIcons name="chevron-right" size={24} color="white" />
				</TouchableOpacity>

				{isChartLoading ? (
					<View className="mt-6 items-center justify-center">
						<ActivityIndicator color="#aaec4d" />
					</View>
				) : chartError ? (
					<View className="mt-6 rounded-2xl bg-[#1e1e1e] p-4">
						<Text className="text-body-medium text-feedback-negative-900">
							{chartError.message}
						</Text>
					</View>
				) : selectedPeriod === 'month' ? (
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						contentContainerStyle={{ gap: 8, paddingVertical: 8, alignItems: 'flex-end' }}
					>
						{displayPoints.map((point) => (
							<ChartBar
								key={point.key}
								point={point}
								isSelected={selectedBarKey === point.key}
								onPress={() =>
									setSelectedBarKey((prev) => (prev === point.key ? null : point.key))
								}
								barWidth={barWidth}
							/>
						))}
					</ScrollView>
				) : (
					<View className="flex-row items-end justify-between gap-2">
						{displayPoints.map((point) => (
							<ChartBar
								key={point.key}
								point={point}
								isSelected={selectedBarKey === point.key}
								onPress={() =>
									setSelectedBarKey((prev) => (prev === point.key ? null : point.key))
								}
								barWidth={barWidth}
							/>
						))}
					</View>
				)}

				<View className="mt-4 h-20 flex-row items-center gap-4 rounded-full bg-[#3f3f3f] px-4">
					<BottomIcon width={40} height={40} />
					<Text className="text-body-regular text-light-text-200">
						{bottomLabel}
					</Text>
				</View>
			</View>

			{/* Body section */}
			<View className="bg-[#1b1b1b] mb-6  rounded-[5%]">
				<View className="p-4">
					<View className="mb-4 flex-row items-center justify-between">
						<Text className="text-t1.1 text-white">Тело</Text>
						<Text className="text-t3 text-light-text-500">За этот год</Text>
					</View>

					<TouchableOpacity
						className="mb-10 w-40 flex-row items-center justify-center rounded-2xl bg-fill-800 py-2"
						activeOpacity={0.9}
						onPress={() => setIsBodyMetricModalVisible(true)}
					>
						<Text className="text-t3 text-light-text-200">
							{getBodyMetricLabel(selectedBodyMetric)}
						</Text>
						<EvilIcons name="chevron-right" size={24} color="white" />
					</TouchableOpacity>

					{isBodyChartLoading ? (
						<View className="items-center justify-center py-8">
							<ActivityIndicator color="#aaec4d" />
						</View>
					) : bodyChartError ? (
						<View className="rounded-2xl bg-[#1e1e1e] p-4">
							<Text className="text-body-medium text-feedback-negative-900">
								{bodyChartError.message}
							</Text>
						</View>
					) : (
						<View className="flex-row items-end justify-between gap-2">
							{bodyDisplayPoints.map((point, idx) => (
								<BodyChartBar
									key={point.key + idx}
									point={point}
									isSelected={selectedBodyBarKey === point.key}
									onPress={() => setSelectedBodyBarKey(point.key)}
								/>
							))}
						</View>
					)}
				</View>

				<View className="p-1">
					<View className="mt-4 flex-row items-center justify-between gap-4 rounded-[20px] bg-black px-4 py-5">
						<Text className="text-t1 text-light-text-100">
							{bodyBottomDisplayData.value}
						</Text>
						<Text className="text-body-regular text-light-text-200">
							{bodyBottomDisplayData.label}
						</Text>
					</View>
				</View>
			</View>

			{/* CTA */}
			<View className="overflow-hidden rounded-3xl bg-[#1b1b1b]">
				<View className="flex-row items-center gap-2 px-5">
					<View className="h-48 flex-1 justify-between py-2">
						{
							daysUntilNewMeasure == 0 ?
								<>
							<Text className="text-t1.1 text-white">Внести изменения за этот месяц</Text>
							<TouchableOpacity
							className="h-20 w-20 items-center justify-center rounded-full bg-brand-purple-500"
							activeOpacity={0.9}
						onPress={() => router.push('/measure-statistic')}
					>
						<Icon name="chevrons-right" size={28} color="#FFFFFF" />
					</TouchableOpacity>
								</> : <>
									<Text className="text-t1.1 text-white">До внесения следующих данных</Text>
									<View className="flex-row gap-2 align-center" >
										<Text className="text-center font-rimma text-3xl text-white">{daysUntilNewMeasure}</Text>
										<Text className="text-t1.1 text-white">дней</Text>
									</View>

								</>
						}
					</View>

					<Image source={userProfile.gender === 'male' ?	boyMeasure :  girlMeasure } className="h-48 w-44" resizeMode="contain" />
				</View>
			</View>

			<MetricSelectorModal
				visible={isMetricModalVisible}
				selectedMetric={selectedMetric}
				onSelect={setSelectedMetric}
				onClose={() => setIsMetricModalVisible(false)}
			/>

			<BodyMetricSelectorModal
				visible={isBodyMetricModalVisible}
				selectedMetric={selectedBodyMetric}
				onSelect={setSelectedBodyMetric}
				onClose={() => setIsBodyMetricModalVisible(false)}
			/>
		</>
	)
}
