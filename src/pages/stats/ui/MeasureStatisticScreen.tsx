import {
	Keyboard,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	StyleSheet,
	Text,
	TouchableWithoutFeedback,
	View,
} from 'react-native'
import { useRef, useState } from 'react'
import { useRouter } from 'expo-router'

import { GradientHeader } from '@/shared/ui/GradientBG'
import { CloseBtn } from '@/shared/ui/CloseBtn'
import { SafeAreaContainer, Input, Button } from '@/shared/ui'
import { useCreateBodyStatsMutation } from '@/features/stats'
import type { BodyStatsInput } from '@/features/stats/api/types'
import { showToast } from '@/shared/lib'

type MeasurementKey = keyof Omit<BodyStatsInput, 'user_id' | 'date'>

interface MeasurementField {
	key: MeasurementKey
	label: string
	unit: string
}

const MEASUREMENT_FIELDS: MeasurementField[] = [
	{ key: 'weight', label: 'Вес', unit: 'кг' },
	{ key: 'chest_circumference', label: 'Обхват груди', unit: 'см' },
	{ key: 'waist_circumference', label: 'Обхват талии', unit: 'см' },
	{ key: 'hip_circumference', label: 'Обхват бедер', unit: 'см' },
	{ key: 'forearm_circumference', label: 'Объем предплечья', unit: 'см' },
	{ key: 'neck_circumference', label: 'Обхват шеи', unit: 'см' },
	{ key: 'thigh_circumference', label: 'Обхват бедра', unit: 'см' },
	{ key: 'shin_circumference', label: 'Обхват голени', unit: 'см' },
]

export const MeasureStatisticScreen = () => {
	const router = useRouter()
	const scrollViewRef = useRef<ScrollView>(null)
	const inputPositions = useRef<Record<string, number>>({})

	const [measurements, setMeasurements] = useState<Record<string, string>>({})
	const mutation = useCreateBodyStatsMutation()

	const currentDate = new Date().toLocaleDateString('ru-RU', {
		month: 'long',
	})

	const updateMeasurement = (key: string, value: string) => {
		// Только цифры и одна точка для десятичных
		const sanitized = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')
		setMeasurements((prev) => ({ ...prev, [key]: sanitized }))
	}

	const hasAnyValue = Object.values(measurements).some((v) => v.trim() !== '')

	const scrollToInput = (key: string) => {
		// Небольшая задержка, чтобы клавиатура успела начать открываться
		setTimeout(() => {
			const yOffset = inputPositions.current[key]
			if (yOffset !== undefined && scrollViewRef.current) {
				// Скроллим так, чтобы инпут был в самом верху (учитываем отступ сверху)
				scrollViewRef.current.scrollTo({ y: Math.max(0, yOffset - 10), animated: true })
			}
		}, 100)
	}

	const handleSave = () => {
		const payload = {
			weight: parseFloat(measurements.weight) || 0,
			chest_circumference: parseFloat(measurements.chest_circumference) || 0,
			waist_circumference: parseFloat(measurements.waist_circumference) || 0,
			hip_circumference: parseFloat(measurements.hip_circumference) || 0,
			forearm_circumference: parseFloat(measurements.forearm_circumference) || 0,
			neck_circumference: parseFloat(measurements.neck_circumference) || 0,
			shin_circumference: parseFloat(measurements.shin_circumference) || 0,
			thigh_circumference: parseFloat(measurements.thigh_circumference) || 0,
		}

		//console.log('Measurements to save:', payload)

		mutation.mutate(payload, {
			onSuccess: () => {
				showToast.success(`Данные за ${currentDate} внесены`)
			},
			onSettled: () => {
			setTimeout(() => {
				router.push('/stats')
			}, 2000)
			},
		})
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
						className="absolute left-0 right-0 top-0 z-0 rounded-b-[25px]"
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
								{MEASUREMENT_FIELDS.map((field) => (
									<View
										key={field.key}
										className="mb-4 px-4"
										onLayout={(event) => {
											inputPositions.current[field.key] = event.nativeEvent.layout.y
										}}
									>
										<Input
											label={field.label}
											placeholder={field.unit}
											value={measurements[field.key] || ''}
											onChangeText={(text) => updateMeasurement(field.key, text)}
											onFocus={() => scrollToInput(field.key)}
											keyboardType="numeric"
										/>
									</View>
								))}
							</View>
						</ScrollView>

						{/* Save Button */}
						{hasAnyValue && (
							<View className="px-4 pb-4 pt-2">
								<Button
									variant="primary"
									size="l"
									fullWidth
									onPress={handleSave}
									disabled={mutation.isPending}
								>
									{mutation.isPending ? 'Сохранение...' : 'Сохранить'}
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
