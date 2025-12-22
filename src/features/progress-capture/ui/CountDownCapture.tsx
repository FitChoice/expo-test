import type { ProgressSide, TempCapturedPhoto } from '@/entities/progress'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { CameraView } from 'expo-camera'
import { Text, TouchableOpacity, View } from 'react-native'
import { Icon } from '@/shared/ui'

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
					onCaptured({
						side,
						tempUri: result.uri,
						width: result.width,
						height: result.height,
						size: result.fileSize,
					})
				}
			} catch {
				onCancel()
			}
		}
		capture()
	}, [isCounting, countdown, onCancel, onCaptured, side])

	return (
		<View className="flex-1 bg-black">
			<CameraView
				style={{ flex: 1 }}
				facing="front"
				ref={(ref) => {
					cameraRef.current = ref
				}}
			>
				<View className="absolute inset-0 items-center justify-center bg-black/30">
					<Text className="text-h1 text-white">{isCounting ? countdown : 'Снимаем...'}</Text>
					<Text className="mt-2 text-body-medium text-white/80">{sideLabel}</Text>
				</View>
				<View className="absolute bottom-8 left-0 right-0 flex-row items-center justify-between px-6">
					<View className="w-12" />
					<TouchableOpacity
						onPress={() => {
							setIsCounting(true)
							setCountdown(5)
						}}
						className="h-12 rounded-full bg-white/20 px-4"
					>
						<Text className="text-body-medium text-white">Перезапуск</Text>
					</TouchableOpacity>
					<TouchableOpacity onPress={onCancel} className="h-12 w-12 items-center justify-center rounded-full bg-white/20">
						<Icon name="x" color="#fff" size={20} />
					</TouchableOpacity>
				</View>
			</CameraView>
		</View>
	)
}
