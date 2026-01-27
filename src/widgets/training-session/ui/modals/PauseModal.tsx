/**
 * Pause Modal (5.9)
 * Модальное окно паузы
 * Показывается при нажатии на кнопку паузы
 */

import {
	View,
	Text,
	Modal as RNModal,
	StyleSheet,
	Platform,
	useWindowDimensions,
} from 'react-native'
import { BlurView } from 'expo-blur'
import BigPauseIcon from 'assets/images/big_pause.svg'
import { Button } from '@/shared/ui'
import { sharedStyles } from '@/shared/ui/styles/shared-styles'

interface PauseModalProps {
	visible: boolean
	onResume: () => void
}
const IS_ANDROID = Platform.OS === 'android'

export function PauseModal({ visible, onResume }: PauseModalProps) {
	const { width, height } = useWindowDimensions()
	const isLandscape = width > height

	return (
		<RNModal
			visible={visible}
			statusBarTranslucent
			navigationBarTranslucent
			transparent
			animationType="fade"
			supportedOrientations={['portrait', 'landscape']}
		>
			<View className="flex-1">
				{/* Blurred gradient background */}
				<BlurView
					intensity={50}
					tint="dark"
					style={StyleSheet.absoluteFill}
					experimentalBlurMethod={
						Platform.OS === 'android' ? 'dimezisBlurView' : undefined
					}
					blurReductionFactor={Platform.OS === 'android' ? 6 : undefined}
				></BlurView>

				{/* Content */}
				<View className="flex-1 items-center justify-center">
					{/* Pause icon */}
					<BigPauseIcon />

					{/* Text */}
					<View className="mt-6 items-center">
						<Text style={sharedStyles.title}>Тренировка</Text>
						<Text style={sharedStyles.title}>на паузе</Text>
					</View>
				</View>

				{/* Button at bottom */}
				<View
					className={`absolute bottom-${IS_ANDROID ? 20 : 15} left-0 right-0 px-6`}
				>
					<Button
						onPress={onResume}
						variant="primary"
						className={isLandscape ? 'mx-auto w-full max-w-[300px]' : 'w-full'}
					>
						Продолжить тренировку
					</Button>
				</View>
			</View>
		</RNModal>
	)
}
