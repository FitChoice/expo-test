import { Dimensions, Image, StyleSheet, Text, View } from 'react-native'
import { Button, StepProgress } from '@/shared/ui'
import React from 'react'
import type { TempCapturedPhoto } from '@/entities/progress'
import { GradientBg } from '@/shared/ui/GradientBG'
import { CloseBtn } from '@/shared/ui/CloseBtn'
import { router } from 'expo-router'


type PreviewProps = {
	photo: TempCapturedPhoto
	onRetake: () => void
	onConfirm: () => void
	handleStop: () => void
	sideLabel: string
	currentSideIndex: number
}

export const PreviewScreen = ({ photo, onRetake, onConfirm, sideLabel, currentSideIndex, handleStop }: PreviewProps) => {


	const CAM_PREVIEW_HEIGHT = Dimensions.get('window').height * 0.7

	return <View className="flex-1">
		<View style={styles.background} pointerEvents="none">
			<GradientBg />
		</View>

		<View style={styles.content}>
			<View className="absolute right-4 z-10 top-10">
				<CloseBtn handlePress={handleStop} classNames="h-12 w-12 rounded-2xl" />
			</View>

			<View
				style={{
					height: CAM_PREVIEW_HEIGHT,
					backgroundColor: 'transparent',
					borderBottomLeftRadius: 24,
					borderBottomRightRadius: 24,
					overflow: 'hidden',
				}}
			>
				<Image source={{ uri: photo.tempUri }} className="h-full w-full"
							 resizeMode="contain" />
			</View>

			<View className="pl-2 pt-5">
				<StepProgress isVertical={true} current={currentSideIndex} total={4} />
				<Text
					className="mt-2 text-[20px] text-light-text-100 text-center">{sideLabel}</Text>
				<View className="mt-6 items-center">
					<Text className="text-h1 text-brand-green-500">Фото сохранено!</Text>
				</View>
			</View>

			<View
				className="absolute bottom-10 left-0 right-0 flex-row gap-3  px-4 py-4">
				<Button variant="secondary" onPress={onRetake} className="flex-1">
					Переснять
				</Button>
				<Button onPress={onConfirm} className="flex-1">
					Далее
				</Button>
			</View>
		</View>
	</View>
}

const styles = StyleSheet.create({
	background: {
		...StyleSheet.absoluteFillObject,
		zIndex: 0,
		bottom: -200,
	},

	content: {
		flex: 1,
		position: 'relative',
		zIndex: 1,
	},
})
