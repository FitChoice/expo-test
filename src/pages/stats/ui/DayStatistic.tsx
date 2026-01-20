import React, { useMemo } from 'react'
import { View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import Feather from '@expo/vector-icons/Feather'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import Fontisto from '@expo/vector-icons/Fontisto'
import EvilIcons from '@expo/vector-icons/EvilIcons'

import { Icon } from '@/shared/ui'
import { useMainStatsQuery } from '@/features/stats'
import type { MainStatsResponse } from '@/features/stats'

import Emo1 from '@/assets/images/moods/emo1.svg'
import Emo2 from '@/assets/images/moods/emo2.svg'
import Emo3 from '@/assets/images/moods/emo3.svg'
import Emo4 from '@/assets/images/moods/emo4.svg'
import Emo5 from '@/assets/images/moods/emo5.svg'
import girlSample from '../../../../assets/images/girl_sample.png'
import girlMeasure from '../../../../assets/images/girl-measure.png'
import Barbell from '@/assets/images/barbell.svg'
import Morning from '@/assets/images/morning_ex.svg'
import Diary from '@/shared/ui/Icon/assets/diary.svg'

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

const moodPoints = [
	{ day: 'пн', Icon: Emo3, color: '#FFB800', height: 180 },
	{ day: 'вт', Icon: Emo2, color: '#FF69B4', height: 110 },
	{ day: 'ср', Icon: Emo5, color: '#10B981', height: 140 },
	{ day: 'чт', Icon: Emo1, color: '#FF4B6E', height: 100 },
	{ day: 'пт', Icon: Emo3, color: '#FFB800', height: 220 },
	{ day: 'сб', Icon: Emo4, color: '#6B7280', height: 180 },
	{ day: 'вс', Icon: Emo5, color: '#10B981', height: 150 },
]

const bodyWeightPoints = [
	{ month: 'ян', value: 26 },
	{ month: 'фв', value: 34 },
	{ month: 'мр', value: 40 },
	{ month: 'ап', value: 54 },
	{ month: 'мй', value: 68 },
	{ month: 'ин', value: 72 },
	{ month: 'ил', value: 65 },
	{ month: 'ав', value: 54 },
	{ month: 'сн', value: 42 },
	{ month: 'ок', value: 30 },
	{ month: 'нб', value: 24 },
	{ month: 'дк', value: 16 },
]

export function DayStatistic() {
	const { data: mainStats, isLoading: isStatsLoading, error: statsError } = useMainStatsQuery()

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

					<Image source={girlSample} className="h-50 w-50" resizeMode="contain" />
				</View>
			</View>

			{/* Mood chart */}
			<View className="bg-[#1b1b1b] mb-6 p-4 rounded-[5%]">
				<View className="mb-4 flex-row items-center justify-between">
					<Text className="text-t1.1 text-white">Общее состояние</Text>
					<Text className="text-t3 text-light-text-500">За эту неделю</Text>
				</View>

				<TouchableOpacity
					className="w-40 flex-row items-center justify-center rounded-2xl bg-fill-800 py-2"
					activeOpacity={0.9}
				>
					<Text className="text-t3 text-light-text-200">Настроение</Text>
					<EvilIcons name="chevron-right" size={24} color="white" />
				</TouchableOpacity>

				<View className="flex-row items-end justify-between gap-2">
					{moodPoints.map(({ day, Icon: MoodIcon, color, height }) => (
						<View key={day} className="items-center gap-2">
							<MoodIcon width={24} height={24} />
							<View
								style={{ height, width: 40 }}
								className="overflow-hidden rounded-2xl bg-[#3f3f3f]"
							>
								<View style={{ height: 8, backgroundColor: color, width: '100%' }} />
							</View>
							<Text className="uppercase text-light-text-200">{day}</Text>
						</View>
					))}
				</View>

				<View className="mt-4 h-20 flex-row items-center gap-4 rounded-full bg-[#3f3f3f] px-4">
					<Emo3 />
					<Text className="text-body-regular text-light-text-200">В среднем</Text>
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
						className="mb-10 w-20 flex-row items-center justify-center rounded-2xl bg-fill-800 py-2"
						activeOpacity={0.9}
					>
						<Text className="text-t3 text-light-text-200"> Вес</Text>
						<EvilIcons name="chevron-right" size={24} color="white" />
					</TouchableOpacity>

					<View className="flex-row items-end justify-between gap-2">
						{bodyWeightPoints.map(({ value, month }) => (
							<View key={month} className="items-center gap-1">
								<View
									style={{
										height: value,
										width: 22,
										backgroundColor: month === 'ян' ? '#C5F680' : '#3F3F46',
									}}
									className="rounded-2xl"
								/>
								<Text className="text-light-text-200">{month}</Text>
							</View>
						))}
					</View>
				</View>

				<View className="p-1" >
					<View className=" mt-4 flex-row items-center justify-between gap-4 rounded-[20px] bg-black px-4 py-5">
						<Text className="text-t1 text-light-text-100">
							{mainStats ? '52 кг' : '—'}
						</Text>
						<Text className="text-body-regular text-light-text-200">В ноябре</Text>
					</View>
				</View>
			</View>

			{/* CTA */}
			<View className="overflow-hidden rounded-3xl bg-[#1b1b1b]">
				<View className="flex-row items-center gap-2 px-5">
					<View className="h-48 flex-1 justify-between py-2">
						<Text className="text-t1.1 text-white">Внести изменения за этот месяц</Text>
						<TouchableOpacity
							className="h-20 w-20 items-center justify-center rounded-full bg-brand-purple-500"
							activeOpacity={0.9}
							onPress={() => router.push('/measure-statistic')}
						>
							<Icon name="chevrons-right" size={28} color="#FFFFFF" />
						</TouchableOpacity>
					</View>

					<Image source={girlMeasure} className="h-48 w-44" resizeMode="contain" />
				</View>
			</View>
		</>
	)
}
