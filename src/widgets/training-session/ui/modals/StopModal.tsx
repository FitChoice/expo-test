/**
 * Pause Modal (5.9)
 * Модальное окно паузы
 * Показывается при нажатии на кнопку паузы
 */

import { View, Text, Modal as RNModal, StyleSheet, Platform } from 'react-native'
import { BlurView } from 'expo-blur'

import { Button } from '@/shared/ui'
import { sharedStyles } from '@/pages/survey/ui/components/shared-styles'

interface PauseModalProps {
	visible: boolean
	onResume: () => void
	onStop: () => void
}

export function StopModal({ visible, onResume, onStop }: PauseModalProps) {
	return (
		<RNModal visible={visible} transparent animationType="fade">
			<View className="flex-1">
				{/* Blurred gradient background */}
				<BlurView
					intensity={80}
					tint="light"
					style={StyleSheet.absoluteFill}
					experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
					blurReductionFactor={Platform.OS === 'android' ? 4 : undefined}
				>
					
				</BlurView>

				{/* Content */}
				<View className="flex-1 justify-center items-center px-6">
				
					
					{/* Text */}
					<View className="mt-6 items-center">
						<Text style={sharedStyles.title}>
							Остановить
						</Text>
						<Text style={sharedStyles.title}>
							тренировку?
						</Text>
					</View>
				</View>

				{/* Button at bottom */}
				<View className="absolute bottom-0 left-0 right-0 px-6 pb-safe-bottom pb-6">
					<Button onPress={onResume} variant="primary" className="w-full">
						Продолжить тренировку
					</Button>
				</View>
			</View>
		</RNModal>
	)
}
