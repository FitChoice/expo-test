import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import type { AgeGroup } from '@/entities/survey'

interface AgeStepProps {
	ageGroup: AgeGroup | null
	onAgeGroupChange: (ageGroup: AgeGroup) => void
}

export const AgeStep: React.FC<AgeStepProps> = ({ ageGroup, onAgeGroupChange }) => {
	return (
		<>
			<Text className="mb-8 w-full text-left text-[32px] font-bold text-white">
				ваш возраст
			</Text>
			<View className="w-full gap-3">
				<View className="flex-row justify-between gap-3">
					<TouchableOpacity
						className={`flex-1 items-center rounded-xl px-6 py-4 ${
							ageGroup === 'under_18' ? 'bg-brand-purple' : 'bg-[rgba(255,255,255,0.1)]'
						}`}
						onPress={() => onAgeGroupChange('under_18')}
					>
						<Text className="text-base font-semibold text-white">до 18</Text>
					</TouchableOpacity>
					<TouchableOpacity
						className={`flex-1 items-center rounded-xl px-6 py-4 ${
							ageGroup === '18_24' ? 'bg-brand-purple' : 'bg-[rgba(255,255,255,0.1)]'
						}`}
						onPress={() => onAgeGroupChange('18_24')}
					>
						<Text className="text-base font-semibold text-white">18 - 24</Text>
					</TouchableOpacity>
				</View>
				<View className="flex-row justify-between gap-3">
					<TouchableOpacity
						className={`flex-1 items-center rounded-xl px-6 py-4 ${
							ageGroup === '25_34' ? 'bg-brand-purple' : 'bg-[rgba(255,255,255,0.1)]'
						}`}
						onPress={() => onAgeGroupChange('25_34')}
					>
						<Text className="text-base font-semibold text-white">25 - 34</Text>
					</TouchableOpacity>
					<TouchableOpacity
						className={`flex-1 items-center rounded-xl px-6 py-4 ${
							ageGroup === '35_44' ? 'bg-brand-purple' : 'bg-[rgba(255,255,255,0.1)]'
						}`}
						onPress={() => onAgeGroupChange('35_44')}
					>
						<Text className="text-base font-semibold text-white">35 - 44</Text>
					</TouchableOpacity>
				</View>
				<View className="flex-row justify-between gap-3">
					<TouchableOpacity
						className={`flex-1 items-center rounded-xl px-6 py-4 ${
							ageGroup === '45_54' ? 'bg-brand-purple' : 'bg-[rgba(255,255,255,0.1)]'
						}`}
						onPress={() => onAgeGroupChange('45_54')}
					>
						<Text className="text-base font-semibold text-white">45 - 54</Text>
					</TouchableOpacity>
					<TouchableOpacity
						className={`flex-1 items-center rounded-xl px-6 py-4 ${
							ageGroup === '55_64' ? 'bg-brand-purple' : 'bg-[rgba(255,255,255,0.1)]'
						}`}
						onPress={() => onAgeGroupChange('55_64')}
					>
						<Text className="text-base font-semibold text-white">55 - 64</Text>
					</TouchableOpacity>
				</View>
				<View className="flex-row justify-between gap-3">
					<TouchableOpacity
						className={`flex-1 items-center rounded-xl px-6 py-4 ${
							ageGroup === '65_plus' ? 'bg-brand-purple' : 'bg-[rgba(255,255,255,0.1)]'
						}`}
						onPress={() => onAgeGroupChange('65_plus')}
					>
						<Text className="text-base font-semibold text-white">65+</Text>
					</TouchableOpacity>
				</View>
			</View>
		</>
	)
}
