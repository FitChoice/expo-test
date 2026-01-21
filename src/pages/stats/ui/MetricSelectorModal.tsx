import React from 'react'
import { View, Text, Modal as RNModal, StyleSheet, Platform } from 'react-native'
import { BlurView } from 'expo-blur'
import { SafeAreaView } from 'react-native-safe-area-context'

import { GlowButton } from '@/shared/ui'
import { WELLBEING_METRICS, type WellbeingMetric } from '../lib'

interface MetricSelectorModalProps {
	visible: boolean
	selectedMetric: WellbeingMetric
	onSelect: (metric: WellbeingMetric) => void
	onClose: () => void
}

export const MetricSelectorModal = ({
	visible,
	selectedMetric,
	onSelect,
	onClose,
}: MetricSelectorModalProps) => {
	const handleSelect = (metric: WellbeingMetric) => {
		onSelect(metric)
		onClose()
	}

	return (
		<RNModal
			visible={visible}
			statusBarTranslucent
			navigationBarTranslucent
			transparent
			animationType="fade"
		>
			<View className="flex-1">
				<BlurView
					intensity={50}
					tint="dark"
					style={StyleSheet.absoluteFill}
					experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
					blurReductionFactor={Platform.OS === 'android' ? 4 : undefined}
				/>

				<SafeAreaView className="flex-1 justify-center px-6">
					<View className="gap-3">
						{WELLBEING_METRICS.map((option) => (
							<GlowButton
								key={option.key}
								isSelected={selectedMetric === option.key}
								onPress={() => handleSelect(option.key)}
								style={styles.optionButton}
								contentStyle={styles.optionContent}
							>
								<Text className="text-t2 text-center text-white">{option.label}</Text>
							</GlowButton>
						))}
					</View>
				</SafeAreaView>
			</View>
		</RNModal>
	)
}

const styles = StyleSheet.create({
	optionButton: {
		minHeight: 70,
		justifyContent: 'center',
		alignItems: 'center',
	},
	optionContent: {
		justifyContent: 'center',
		alignItems: 'center',
	},
})
