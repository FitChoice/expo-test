import React from 'react'
import { View, Text } from 'react-native'
import { GlowButton } from '@/shared/ui'
import type { AgeGroup } from '@/entities/survey'
import { sharedStyles } from '@/shared/ui/styles/shared-styles'

interface SurveyStep3Props {
	ageGroup: AgeGroup | null
	onAgeGroupChange: (ageGroup: AgeGroup) => void
}

/**
 * Шаг 3: Выбор возрастной группы
 */
export const SurveyStep3: React.FC<SurveyStep3Props> = ({
	ageGroup,
	onAgeGroupChange,
}) => {
	return (
		<>
			<Text style={sharedStyles.title}>ваш возраст</Text>
			<View className="gap-2 bg-transparent">
				<View className="flex-row gap-2">
					<GlowButton
						isSelected={ageGroup === 'under_18'}
						onPress={() => onAgeGroupChange('under_18')}
						style={{ flex: 1, height: 84 }}
						contentStyle={{
							flex: 1,
							justifyContent: 'center',
							alignItems: 'center',
						}}
					>
						<Text className="text-t3-regular text-white">до 18</Text>
					</GlowButton>
					<GlowButton
						isSelected={ageGroup === '18_24'}
						onPress={() => onAgeGroupChange('18_24')}
						style={{ flex: 1, height: 84 }}
						contentStyle={{
							flex: 1,
							justifyContent: 'center',
							alignItems: 'center',
						}}
					>
						<Text className="text-t3-regular text-white">18 - 24</Text>
					</GlowButton>
				</View>
				<View className="flex-row gap-2">
					<GlowButton
						isSelected={ageGroup === '25_34'}
						onPress={() => onAgeGroupChange('25_34')}
						style={{ flex: 1, height: 84 }}
						contentStyle={{
							flex: 1,
							justifyContent: 'center',
							alignItems: 'center',
						}}
					>
						<Text className="text-t3-regular text-white">25 - 34</Text>
					</GlowButton>
					<GlowButton
						isSelected={ageGroup === '35_44'}
						onPress={() => onAgeGroupChange('35_44')}
						style={{ flex: 1, height: 84 }}
						contentStyle={{
							flex: 1,
							justifyContent: 'center',
							alignItems: 'center',
						}}
					>
						<Text className="text-t3-regular text-white">35 - 44</Text>
					</GlowButton>
				</View>
				<View className="flex-row gap-2">
					<GlowButton
						isSelected={ageGroup === '45_54'}
						onPress={() => onAgeGroupChange('45_54')}
						style={{ flex: 1, height: 84 }}
						contentStyle={{
							flex: 1,
							justifyContent: 'center',
							alignItems: 'center',
						}}
					>
						<Text className="text-t3-regular text-white">45 - 54</Text>
					</GlowButton>
					<GlowButton
						isSelected={ageGroup === '55_64'}
						onPress={() => onAgeGroupChange('55_64')}
						style={{ flex: 1, height: 84 }}
						contentStyle={{
							flex: 1,
							justifyContent: 'center',
							alignItems: 'center',
						}}
					>
						<Text className="text-t3-regular text-white">55 - 64</Text>
					</GlowButton>
				</View>
				<View className="flex-row gap-2">
					<GlowButton
						isSelected={ageGroup === '65_plus'}
						onPress={() => onAgeGroupChange('65_plus')}
						style={{ flex: 1, height: 84 }}
						contentStyle={{
							flex: 1,
							justifyContent: 'center',
							alignItems: 'center',
						}}
					>
						<Text className="text-t3-regular text-white">65 +</Text>
					</GlowButton>
					<View style={{ flex: 1 }} />
				</View>
			</View>
		</>
	)
}
