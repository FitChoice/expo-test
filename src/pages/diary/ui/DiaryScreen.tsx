import {
	View,
	Text,
	TouchableOpacity,
	ScrollView,
	StyleSheet,
	KeyboardAvoidingView,
	TouchableWithoutFeedback,
	Keyboard,
	Platform,
} from 'react-native'
import { GradientHeader } from '@/shared/ui/GradientBG'
import React, { useRef, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useQueryClient } from '@tanstack/react-query'
import { CloseBtn } from '@/shared/ui/CloseBtn'
import { SafeAreaContainer, Button, Input } from '@/shared/ui'
import { dairyApi } from '@/features/dairy/api'
import type { DiaryInput } from '@/features/dairy/api'
import { showToast } from '@/shared/lib'
import { RATING_OPTIONS } from '@/shared/constants'


const formatTimeInput = (value: string) => {
	const digits = value.replace(/\D/g, '').slice(0, 4)
	let hours = digits.slice(0, 2)
	let minutes = digits.slice(2, 4)

	if (hours.length === 2) {
		const hoursNum = Number(hours)
		if (!Number.isNaN(hoursNum) && hoursNum > 23) {
			hours = '23'
		}
	}

	if (minutes.length === 2) {
		const minutesNum = Number(minutes)
		if (!Number.isNaN(minutesNum) && minutesNum > 59) {
			minutes = '59'
		}
	}

	if (digits.length <= 2) {
		return hours
	}

	return `${hours}:${minutes}`
}

const normalizeTimeForSubmit = (value: string) => {
	const digits = value.replace(/\D/g, '').padEnd(4, '0').slice(0, 4)
	const hoursNum = Math.min(Number(digits.slice(0, 2)) || 0, 23)
	const minutesNum = Math.min(Number(digits.slice(2, 4)) || 0, 59)

	return `${String(hoursNum).padStart(2, '0')}:${String(minutesNum).padStart(2, '0')}`
}

interface QuestionSectionProps {
	title: string
	subtitle: string
	selectedValue: number | null
	onSelect: (value: number) => void
}

const QuestionSection = ({
	title,
	subtitle,
	selectedValue,
	onSelect,
}: QuestionSectionProps) => {
	return (
		<View
			className="mb-1 bg-bg-dark-500 p-4"
			style={{ overflow: 'hidden', borderRadius: 20 }}
		>
			<Text className="mb-1 text-t1.1 font-semibold text-white">{title}</Text>
			<Text className="mb-4 text-t3 text-gray-400">{subtitle}</Text>
			<View className="flex-row justify-between">
				{RATING_OPTIONS.map((option) => {
					const Icon = option.Icon
					const isSelected = selectedValue === option.id
					return (
						<TouchableOpacity key={option.id} onPress={() => onSelect(option.id)}>
							<View
								style={{
									borderRadius: 27,
									borderWidth: isSelected ? 1 : 0,
									borderColor: isSelected ? option.color : 'transparent',
									padding: 0,
								}}
							>
								<View
									style={{
										width: 54,
										height: 54,
										borderRadius: 27,
										borderWidth: 30,
										borderColor: '#3f3f3f',
										justifyContent: 'center',
										alignItems: 'center',
									}}
								>
									<Icon width={30} height={30} />
								</View>
							</View>
						</TouchableOpacity>
					)
				})}
			</View>
		</View>
	)
}

export const DiaryScreen = () => {
	const router = useRouter()
	const queryClient = useQueryClient()
	const { id: resolvedScheduleId } = useLocalSearchParams()
	const [mood, setMood] = useState<number | null>(null)
	const [wellBeing, setWellBeing] = useState<number | null>(null)
	const [energyLevel, setEnergyLevel] = useState<number | null>(null)
	const [sleepQuality, setSleepQuality] = useState<number | null>(null)
	const [sleepTime, setSleepTime] = useState('00:00')
	const [wakeTime, setWakeTime] = useState('07:00')
	const [notes, setNotes] = useState('')
	const scrollViewRef = useRef<ScrollView>(null)
	const inputPositions = useRef<Record<string, number>>({})

	const isFormValid =
		mood !== null && wellBeing !== null && energyLevel !== null && sleepQuality !== null

	const handleSave = async () => {
		const payload: DiaryInput = {
			schedule_id: Number(resolvedScheduleId),
			diary_energy_level: energyLevel ?? 0,
			diary_mood: mood ?? 0,
			diary_note: notes,
			diary_sleep_quality: sleepQuality ?? 0,
			diary_sleep_time: normalizeTimeForSubmit(sleepTime),
			diary_wake_time: normalizeTimeForSubmit(wakeTime),
			diary_wellbeing: wellBeing ?? 0,
		}

		try {
			await dairyApi.upsertDiary(payload).then(async (res) => {
		
				if (res.success) {
					showToast.success('Данные сохранены')
					await queryClient.invalidateQueries({ queryKey: ['trainingPlan'] })
				
					router.navigate('/home')
				} else {
					showToast.error(res.error || 'Ошибка сохранения')
				}
			})
		} catch (error) {
			showToast.error('Что-то пошло не так')
			console.error('Failed to save diary:', error)
		}
	}

	const currentDate = new Date().toLocaleDateString('ru-RU', {
		day: 'numeric',
		month: 'long',
		weekday: 'long',
	})

	const scrollToInput = (key: string) => {
		setTimeout(() => {
			const yOffset = inputPositions.current[key]
			if (yOffset !== undefined && scrollViewRef.current) {
				scrollViewRef.current.scrollTo({ y: Math.max(0, yOffset - 10), animated: true })
			}
		}, 100)
	}

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			style={{ flex: 1 }}
		>
			<TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
				<View className="flex-1 bg-black">
					{/* Header with gradient */}
					<View
						className="absolute left-0 right-0 top-0 z-0 rounded-b-[25%]"
						style={{ overflow: 'hidden' }}
					>
						<GradientHeader />
					</View>
					<SafeAreaContainer style={styles.contentContainer}>
						{/* Header Content */}
						<View className="z-10 px-4 pb-14 pt-8">
							<View className="mb-2 items-center">
								<Text className="text-center text-t2 text-gray-400">{currentDate}</Text>
							</View>
							<CloseBtn classNames={'rounded-2xl'} handlePress={() => router.back()} />

							<Text className="text-center font-rimma text-2xl text-white">НОВАЯ ЗАПИСЬ</Text>
						</View>

						{/* Scrollable Content */}
						<ScrollView
							ref={scrollViewRef}
							className="flex-1 bg-black pt-10"
							showsVerticalScrollIndicator={false}
							keyboardShouldPersistTaps="handled"
							keyboardDismissMode="on-drag"
						>
							<View className="pb-24">
								<QuestionSection
									title="Настроение"
									subtitle="Какое у вас общее настроение?"
									selectedValue={mood}
									onSelect={setMood}
								/>

								<QuestionSection
									title="Самочувствие"
									subtitle="Когда вы чувствуете себя физически?"
									selectedValue={wellBeing}
									onSelect={setWellBeing}
								/>

								<QuestionSection
									title="Уровень энергии"
									subtitle="Сколько у вас сил сегодня?"
									selectedValue={energyLevel}
									onSelect={setEnergyLevel}
								/>

								<QuestionSection
									title="Качество сна"
									subtitle="Как вы спали прошлой ночью?"
									selectedValue={sleepQuality}
									onSelect={setSleepQuality}
								/>

								{/* Sleep Time Section */}
								<View
									className="mb-6 bg-bg-dark-500 p-4"
									style={{ overflow: 'hidden', borderRadius: 14 }}
								>
									<Text className="mb-1 text-lg font-semibold text-white">Время сна</Text>
									<Text className="mb-4 text-sm text-gray-400">
										Во сколько легли и во сколько проснулись?
										Можете не отвечать на этот вопрос
									</Text>
									<View className="flex-row justify-between">
										<View
											className="mr-2 flex-1"
											onLayout={(event) => {
												inputPositions.current.sleepTime = event.nativeEvent.layout.y
											}}
										>
											<Text className="mb-2 text-sm text-gray-400">Засыпание</Text>
											<Input
												value={sleepTime}
												onChangeText={(value) => setSleepTime(formatTimeInput(value))}
												onFocus={() => scrollToInput('sleepTime')}
												keyboardType="number-pad"
												maxLength={5}
												placeholder="00:00"
											/>
										</View>
										<View
											className="ml-2 flex-1"
											onLayout={(event) => {
												inputPositions.current.wakeTime = event.nativeEvent.layout.y
											}}
										>
											<Text className="mb-2 text-sm text-gray-400">Пробуждение</Text>
											<Input
												value={wakeTime}
												onChangeText={(value) => setWakeTime(formatTimeInput(value))}
												onFocus={() => scrollToInput('wakeTime')}
												keyboardType="number-pad"
												maxLength={5}
												placeholder="07:00"
											/>
										</View>
									</View>
								</View>

								{/* Notes Section */}
								<View
									className="mb-6 bg-bg-dark-500 p-4"
									style={{ overflow: 'hidden', borderRadius: 14 }}
									onLayout={(event) => {
										inputPositions.current.notes = event.nativeEvent.layout.y
									}}
								>
									<Text className="mb-1 text-lg font-semibold text-white">Заметки</Text>
									<Text className="mb-4 text-sm text-gray-400">
										Может, хотите что-то добавить?
									</Text>
									<Input
										variant="textarea"
										value={notes}
										onChangeText={setNotes}
										onFocus={() => scrollToInput('notes')}
										placeholder="Сегодня я..."
										maxLength={500}
									/>
								</View>
							</View>
						</ScrollView>

						{isFormValid && (
							<View className="px-4 pb-4 pt-2">
								<Button variant="primary" size="l" fullWidth onPress={handleSave}>
									Сохранить
								</Button>
							</View>
						)}
					</SafeAreaContainer>
				</View>
			</TouchableWithoutFeedback>
		</KeyboardAvoidingView>
	)
}

const styles = StyleSheet.create({
	contentContainer: {
		flex: 1,
		paddingHorizontal: 14,
	},
})
