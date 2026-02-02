/**
 * Camera Permission Screen (2.1)
 * Второй шаг onboarding - запрос разрешения на использование камеры
 */

import { Alert, View, Text } from 'react-native'
import { Button } from '@/shared/ui'
import { DotsProgress } from '@/shared/ui/DotsProgress'
import CameraIcon from '@/assets/icons/large/camera.svg'
import { useCameraPermissions } from 'expo-camera'
import { CloseBtn } from '@/shared/ui/CloseBtn'
import { router } from 'expo-router'
import { useCameraDecision } from '@/shared/lib'
import { useEffect } from 'react'

interface CameraPermissionScreenProps {
	onNext: () => void
}

export function CameraPermissionScreen({ onNext }: CameraPermissionScreenProps) {
	const [permission, requestPermission] = useCameraPermissions()
	const { decision, setDecision } = useCameraDecision()

	useEffect(() => {
		if (permission?.granted) {
			void setDecision('granted')
		}
	}, [permission?.granted, setDecision])

	const handleStop = () => {
		router.back()
	}

	const showCameraRequiredAlert = () => {
		Alert.alert(
			'Доступ к камере',
			'Дальнейшее использование приложения невозможно без использования камеры',
			[
				{
					text: 'Разрешить',
					onPress: () => {
						void requestAndHandle()
					},
				},
			],
			{ cancelable: false }
		)
	}

	const requestAndHandle = async () => {
		const res = await requestPermission()
		const nextDecision = res.granted ? 'granted' : 'denied'
		await setDecision(nextDecision)
		if (res.granted) {
			onNext()
			return
		}
		showCameraRequiredAlert()
	}

	const handleNext = async () => {
		const isGranted = permission?.granted ?? decision === 'granted'
		if (isGranted) {
			onNext()
			return
		}

		await requestAndHandle()
	}

	const isGranted = permission?.granted ?? decision === 'granted'

	return (
		<View className="flex-1">
			{/* Close Button */}
			<View className="absolute right-0 z-10">
				<CloseBtn handlePress={handleStop} classNames="h-12 w-12 rounded-2xl" />
			</View>

			{/* Progress Dots */}
			<View className="absolute left-1/2 top-10 z-10 -translate-x-1/2">
				<DotsProgress total={4} current={1} variant="onboarding" />
			</View>

			{/* Icon Section */}
			<View className="flex-1 items-center justify-center">
				<CameraIcon />
			</View>

			{/* Text and Button Section */}
			<View className="px-6 pb-6">
				{/* Title */}
				<Text className="mb-3 text-left text-h2 font-bold text-light-text-100">
					Конфиденциальность
				</Text>

				{/* Description */}
				<Text className="mb-20 text-left text-t2 leading-6 text-light-text-500">
					Камера используется только для анализа движений. Видео не сохраняется и не
					передаётся
				</Text>

				{/* Button */}
				<Button
					variant="primary"
					onPress={handleNext}
					//disabled={!permission?.granted} // блокируем, пока не запрашивали и нет разрешения
					className="w-full"
				>
					{isGranted ? 'Далее' : 'Разрешить доступ'}
				</Button>
			</View>
		</View>
	)
}
