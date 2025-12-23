import type { ProgressSide, TempCapturedPhoto } from '@/entities/progress'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { CameraView } from 'expo-camera'
import * as FileSystem from 'expo-file-system'
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Button, DotsProgress, Icon, StepProgress } from '@/shared/ui'
import { CloseBtn } from '@/shared/ui/CloseBtn'
import {
	BackgroundLayoutSafeArea
} from '@/shared/ui/BackgroundLayout/BackgroundLayoutSafeArea'
import { PoseCamera } from '@/widgets/pose-camera'
import Svg, { Circle } from 'react-native-svg'
import BodySilhouetteDefault from '@/assets/images/body_silhouette_default.svg'
import { router } from 'expo-router'
import { GradientBg } from '@/shared/ui/GradientBG'

type CountdownCaptureProps = {
	side: ProgressSide
	onCaptured: (photo: TempCapturedPhoto) => void
	onCancel: () => void
}

export const CountdownCapture = ({ side, onCaptured, onCancel }: CountdownCaptureProps) => {
	const [countdown, setCountdown] = useState(5)
	const [isCounting, setIsCounting] = useState(true)
	const cameraRef = useRef<CameraView | null>(null)

	const sideTitle: Record<ProgressSide, string> = {
		front: 'Спереди',
		back: 'Сзади',
		left: 'Слева',
		right: 'Справа',
	}
	const sideLabel = useMemo(() => sideTitle[side], [side])

	useEffect(() => {
		if (!isCounting) return
		setCountdown(5)
		const interval = setInterval(() => {
			setCountdown((prev) => {
				if (prev <= 1) {
					clearInterval(interval)
					setIsCounting(false)
					return 0
				}
				return prev - 1
			})
		}, 1000)
		return () => clearInterval(interval)
	}, [isCounting])

	useEffect(() => {
		if (isCounting || countdown > 0) return
		const capture = async () => {
			try {
				const result = await cameraRef.current?.takePictureAsync({
					quality: 0.8,
					skipProcessing: false,
				})
				if (result?.uri) {
					let fileSize: number | undefined
					try {
						const info = await FileSystem.getInfoAsync(result.uri)
						if (info.exists && typeof info.size === 'number') {
							fileSize = info.size
						}
					} catch {
						fileSize = undefined
					}

					onCaptured({
						side,
						tempUri: result.uri,
						width: result.width,
						height: result.height,
						size: fileSize,
					})
				}
			} catch {
				onCancel()
			}
		}
		capture()
	}, [isCounting, countdown, onCancel, onCaptured, side])

	const handleStop = () => {
		router.push('/stats')
	}
	const CAM_PREVIEW_HEIGHT = Dimensions.get('window').height * 0.7

	return (
		<View className="flex-1">
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
					<CameraView
						style={{ flex: 1 }}
						facing="front"
						ref={(ref) => {
							cameraRef.current = ref
						}}
					/>
				</View>

				<View className="pl-2 pt-5">
					<StepProgress isVertical={true} current={0} total={5} />
					<Text className="mt-2 text-[20px] text-light-text-100 text-center">{sideLabel}</Text>
					<View className="mt-6 items-center">
						<Text className="text-h1 text-brand-green-500">{isCounting ? countdown : 'Снимаем...'}</Text>
					</View>
				</View>
			</View>
		</View>

		// <View className="flex-1 bg-black">
		// 	<CameraView
		// 		style={{ flex: 1 }}
		// 		facing="front"
		// 		ref={(ref) => {
		// 			cameraRef.current = ref
		// 		}}
		// 	>
		// 		<View className="absolute inset-0 items-center justify-center bg-black/30">
		// 			<Text className="text-h1 text-white">{isCounting ? countdown : 'Снимаем...'}</Text>
		// 			<Text className="mt-2 text-body-medium text-white/80">{sideLabel}</Text>
		// 		</View>
		// 		<View className="absolute bottom-8 left-0 right-0 flex-row items-center justify-between px-6">
		// 			<View className="w-12" />
		// 			<TouchableOpacity
		// 				onPress={() => {
		// 					setIsCounting(true)
		// 					setCountdown(5)
		// 				}}
		// 				className="h-12 rounded-full bg-white/20 px-4"
		// 			>
		// 				<Text className="text-body-medium text-white">Перезапуск</Text>
		// 			</TouchableOpacity>
		// 			<TouchableOpacity onPress={onCancel} className="h-12 w-12 items-center justify-center rounded-full bg-white/20">
		// 				<Icon name="x" color="#fff" size={20} />
		// 			</TouchableOpacity>
		// 		</View>
		// 	</CameraView>
		// </View>
	)
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
