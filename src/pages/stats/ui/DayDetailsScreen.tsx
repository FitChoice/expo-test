import React, { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Feather from '@expo/vector-icons/Feather'
import { useLocalSearchParams, useRouter } from 'expo-router'

import MorningExercise from '@/assets/images/morning_ex.svg'
import Stretching from '@/assets/images/stretching.svg'
import Barbell from '@/assets/images/barbell.svg'
import Diary from '@/assets/images/diary.svg'
import { statsApi } from '@/features/stats/api/statsApi'
import type { DayDetailsResponse, DayTraining } from '@/features/stats/api/types'

const ACTIVE_BACKGROUND = '#3f3f3f'
const ICON_ACTIVE = '#a6f16d'
const ICON_INACTIVE = '#3f3f3f'

type DayTask = {
	id: string
	title: string
	duration?: number
	xp?: number
	icon: React.ComponentType<{
		width?: number
		height?: number
		color?: string
		fill?: string
	}>
	completed?: boolean
}

const formatDateTitle = (rawDate?: string) => {
	if (!rawDate) return ''
	const parsed = new Date(rawDate)
	if (Number.isNaN(parsed.getTime())) return rawDate

	const formatter = new Intl.DateTimeFormat('ru-RU', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	})

	return formatter.format(parsed)
}

const getTaskIcon = (training?: Pick<DayTraining, 'type'>) => {
	const type = training?.type?.toLowerCase()
	if (!type) return Barbell

	if (type === 'w' || type.includes('warm')) return MorningExercise
	if (type.includes('stretch')) return Stretching
	if (type.includes('diary')) return Diary

	return Barbell
}

const TaskCard = ({ task }: { task: DayTask }) => {
	const Icon = task.icon
	const iconColor = task.completed ? ICON_ACTIVE : ICON_INACTIVE

	return (
		<View className="mb-3 flex-row items-center rounded-3xl bg-[#1f1f1f] p-4">
			<View className="mr-4 h-12 w-12 items-center justify-center rounded-2xl bg-[#262626]">
				<Icon width={26} height={26} color={iconColor} fill={iconColor} />
			</View>

			<View className="flex-1">
				<Text className="text-body-semibold text-white">{task.title}</Text>

				<View className="mt-2 flex-row items-center gap-4">
					{task.duration ? (
						<View className="flex-row items-center gap-1">
							<Feather name="clock" size={14} color="#b0b0b0" />
							<Text className="text-light-text-300 text-t3">{task.duration} минут</Text>
						</View>
					) : null}

					{task.xp ? (
						<View className="flex-row items-center gap-1">
							<Feather name="star" size={14} color="#b0b0b0" />
							<Text className="text-light-text-300 text-t3">+{task.xp} опыта</Text>
						</View>
					) : null}
				</View>
			</View>

			<View
				className="h-10 w-10 items-center justify-center rounded-2xl"
				style={{ backgroundColor: ACTIVE_BACKGROUND }}
			>
				<Feather name="arrow-right" size={18} color="#ffffff" />
			</View>
		</View>
	)
}

export const DayDetailsScreen = () => {
	const router = useRouter()
	const params = useLocalSearchParams<{
		id?: string | string[]
		date?: string | string[]
	}>()
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [details, setDetails] = useState<DayDetailsResponse | null>(null)

	const scheduleId = Array.isArray(params.id) ? params.id[0] : params.id
	const fallbackDate = Array.isArray(params.date) ? params.date[0] : params.date

	useEffect(() => {
		let isMounted = true

		const fetchDetails = async () => {
			if (!scheduleId) {
				setError('Не удалось определить день')
				setIsLoading(false)
				return
			}

			setIsLoading(true)
			setError(null)

			const result = await statsApi.getDayDetails({ id: scheduleId })

			if (!isMounted) return

			if (!result.success) {
				setError(result.error ?? 'Не удалось загрузить детали дня')
				setIsLoading(false)
				return
			}

			setDetails(result.data)
			setIsLoading(false)
		}

		fetchDetails()

		return () => {
			isMounted = false
		}
	}, [scheduleId])

	const titleDate = formatDateTitle(details?.date ?? fallbackDate)

	const tasks = useMemo<DayTask[]>(() => {
		if (!details) return []

		const trainingTasks: DayTask[] = details.trainings.map((training) => ({
			id: `training-${training.id}`,
			title: training.title || 'Тренировка',
			duration: training.duration,
			xp: 20,
			icon: getTaskIcon(training),
			completed: true,
		}))

		const diaryTask: DayTask | null = details.diary
			? {
					id: `diary-${details.diary.id}`,
					title: 'Запись в дневнике',
					duration: 10,
					xp: 10,
					icon: Diary,
					completed: details.diary.filled,
				}
			: null

		return diaryTask ? [...trainingTasks, diaryTask] : trainingTasks
	}, [details])

	return (
		<View className="flex-1 bg-black">
			<LinearGradient
				colors={['#6a55c8', '#2b233c', '#0f0f0f']}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
				style={{
					paddingTop: 48,
					paddingHorizontal: 20,
					paddingBottom: 28,
					borderBottomLeftRadius: 26,
					borderBottomRightRadius: 26,
				}}
			>
				<TouchableOpacity
					onPress={() => router.back()}
					activeOpacity={0.8}
					className="mb-4 h-10 w-10 items-center justify-center rounded-full"
					style={{ backgroundColor: ACTIVE_BACKGROUND }}
				>
					<Feather name="arrow-left" size={20} color="#ffffff" />
				</TouchableOpacity>

				<Text className="text-h2 text-white">{titleDate}</Text>
				<Text className="text-body-medium text-light-text-300 mt-1">
					Активности за день
				</Text>
			</LinearGradient>

			<ScrollView
				className="flex-1"
				contentContainerStyle={{ padding: 20 }}
				showsVerticalScrollIndicator={false}
			>
				{isLoading ? (
					<View className="mt-8 items-center">
						<ActivityIndicator color={ICON_ACTIVE} />
						<Text className="text-body-medium text-light-text-300 mt-3">
							Загружаем данные дня...
						</Text>
					</View>
				) : error ? (
					<View className="mt-8 rounded-3xl bg-[#1f1f1f] p-5">
						<Text className="text-body-medium text-center text-feedback-negative-900">
							{error}
						</Text>
					</View>
				) : tasks.length === 0 ? (
					<View className="mt-8 rounded-3xl bg-[#1f1f1f] p-5">
						<Text className="text-body-medium text-center text-light-text-200">
							На этот день пока нет данных
						</Text>
					</View>
				) : (
					tasks.map((task) => <TaskCard key={task.id} task={task} />)
				)}
			</ScrollView>
		</View>
	)
}
