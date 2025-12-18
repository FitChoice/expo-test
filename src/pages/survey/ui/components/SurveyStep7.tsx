import React, { useCallback } from 'react'
import { View, Text } from 'react-native'
import { GlowButton } from '@/shared/ui'
import type { DayOfWeek } from '@/entities/survey'
import { sharedStyles } from '@/shared/ui/styles/shared-styles'

interface SurveyStep7Props {
	selectedDays: DayOfWeek[]
	onDaysChange: (days: DayOfWeek[]) => void
	maxDays?: number
}

/**
 * Шаг 7: Выбор дней недели для тренировок
 */
export const SurveyStep7: React.FC<SurveyStep7Props> = ({
	selectedDays,
	onDaysChange,
	maxDays = 3,
}) => {
	const handleDayToggle = useCallback(
		(day: DayOfWeek) => {
			const isSelected = selectedDays.includes(day)
			const updated = isSelected
				? selectedDays.filter((d) => d !== day)
				: selectedDays.length < maxDays
					? [...selectedDays, day]
					: selectedDays

			onDaysChange(updated)
		},
		[selectedDays, maxDays, onDaysChange]
	)

	const renderDayButton = (day: DayOfWeek, label: string, isLastSingle = false) => (
		<GlowButton
			isNeedCheckbox={true}
			key={day}
			isSelected={selectedDays.includes(day)}
			onPress={() => handleDayToggle(day)}
			style={isLastSingle ? { flex: 1, height: 84 } : { flex: 1, height: 84 }}
			contentStyle={{
				flex: 1,
				justifyContent: 'center',
				alignItems: 'flex-start',
				paddingLeft: 16,
			}}
		>
			<Text className="text-t3 text-white">{label}</Text>
		</GlowButton>
	)

	return (
		<>
			<View className="gap-4 bg-transparent">
				<Text style={sharedStyles.title}>В какие дни вы хотели бы заниматься?</Text>
				<Text className="font-inter text-left text-base font-normal leading-[19.2px] text-white">
					Выберите {maxDays} дня
				</Text>
			</View>
			<View className="gap-2 bg-transparent">
				{/* Понедельник - Вторник */}
				<View className="flex-row gap-2">
					{renderDayButton('monday', 'Понедельник')}
					{renderDayButton('tuesday', 'Вторник')}
				</View>
				{/* Среда - Четверг */}
				<View className="flex-row gap-2">
					{renderDayButton('wednesday', 'Среда')}
					{renderDayButton('thursday', 'Четверг')}
				</View>
				{/* Пятница - Суббота */}
				<View className="flex-row gap-2">
					{renderDayButton('friday', 'Пятница')}
					{renderDayButton('saturday', 'Суббота')}
				</View>
				{/* Воскресенье */}
				<View className="flex-row gap-2">
					{renderDayButton('sunday', 'Воскресенье', true)}
					<View style={{ flex: 1 }} />
				</View>
			</View>
		</>
	)
}
