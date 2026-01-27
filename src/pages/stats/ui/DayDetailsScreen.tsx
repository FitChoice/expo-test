import React, { useMemo } from 'react'
import {
	ActivityIndicator,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import { router, useLocalSearchParams, useRouter } from 'expo-router'

import MorningExercise from '@/assets/images/morning_ex.svg'
import Stretching from '@/assets/images/stretching.svg'
import Barbell from '@/assets/images/barbell.svg'
import Diary from '@/assets/images/diary_green.svg'
import { useDayDetailsQuery } from '@/features/stats'
import type { DayTraining } from '@/features/stats'
import { StatsDetailPageLayout, TrainingTags } from '@/shared/ui'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { formatDateDots } from '@/shared/lib'




type DayTask = {
	id: string
	title: string
	duration?: number
	xp?: number
	date: string
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


	return (
		<View className="mb-3 rounded-3xl bg-[#1E1E1E] p-4 gap-3">

			<View className="flex-row  items-center justify-between " >

				<View className="flex-row  gap-5" >
				<View >
					<Icon width={26} height={26} color={'#a6f16d'} fill={'#a6f16d'} />
				</View>

				<View>
					<Text className="text-t2-bold text-white">{task.title}</Text>
				</View>
				</View>


				{
					task.completed ? 	<TouchableOpacity
						onPress={() => {
							if (task.title.includes('дневник')) {
								router.push({
									pathname: '/diary/completed',
									params: {
										id: String(task.id),
										date: task.date,

									},
								})
								return
							}
							router.push({
									pathname: '/stats-day/report',
									params: {
										trainingId: task.id,
										name: task.title,
										date: formatDateDots(task.date),
										xr: task.xp,

									}
								}
							)
						}}
						className="h-12 w-12 bg-[#3f3f3f] items-center justify-center rounded-2xl"
					>
						<Feather name="arrow-right" size={18} color="#ffffff" />
					</TouchableOpacity> : null
				}

			</View>

			{
				!task.title.includes('дневник') &&
				<TrainingTags
					icon1={<MaterialIcons name="timer" size={16} color="white" />}
					title1={ `${task?.duration || ''} минут` }
					icon2={
						<MaterialCommunityIcons
							name="bow-arrow"
							size={16}
							color="white"
						/>
					}
					title2={`${task?.xp || ''} опыта`}
				/>
			}


		</View>
	)
}

export const DayDetailsScreen = () => {
	const router = useRouter()
	const params = useLocalSearchParams<{
		id?: string
		date?: string
	}>()

	const scheduleId = params.id
	const fallbackDate = params.date

	const { data: details, isLoading, error } = useDayDetailsQuery(scheduleId)


	const titleDate = formatDateTitle(details?.date ?? fallbackDate)

	const tasks = useMemo<DayTask[]>(() => {
		if (!details) return []

		const trainingTasks: DayTask[] = details.trainings.map((training) => ({
			id: `${training.id}`,
			title: training.title || 'Тренировка',
			duration: training.duration,
			xp: 20,
			icon: getTaskIcon(training),
			completed: training.is_complete,
			date: details.date,
		}))

		const diaryTask: DayTask | null = details.diary
			? {
					id: `${details.diary.id}`,
					title: 'Запись в дневнике',
					duration: 10,
					xp: 10,
					icon: Diary,
					completed: details.diary.filled,
				date: details.date,
				}
			: null

		return diaryTask ? [...trainingTasks, diaryTask] : trainingTasks
	}, [details])

	return (
		<StatsDetailPageLayout isLoading={isLoading} title={titleDate} needSubtitle={false}>

			<ScrollView
				className="flex-1"
				contentContainerStyle={{ padding: 20 }}
				showsVerticalScrollIndicator={false}
			>
				{isLoading ? (
					<View className="mt-8 items-center">
						<ActivityIndicator />
						<Text className="text-body-medium text-light-text-300 mt-3">
							Загружаем данные дня...
						</Text>
					</View>
				) : error ? (
					<View className="mt-8 rounded-3xl bg-[#1f1f1f] p-5">
						<Text className="text-body-medium text-center text-feedback-negative-900">
							{error instanceof Error ? error.message : 'Не удалось загрузить данные'}
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
		</StatsDetailPageLayout>
	)
}
