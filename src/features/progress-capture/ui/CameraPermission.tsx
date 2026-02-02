import {
	Button,
	DotsProgress,
} from '@/shared/ui'
import { Alert, Text, View } from 'react-native'
import { useEffect } from 'react'
import type { SetStateAction } from 'react'

import CameraIcon from '@/assets/icons/large/camera.svg'
import { useCameraPermissions } from 'expo-camera'
import {
	BackgroundLayoutSafeArea
} from '@/shared/ui/BackgroundLayout/BackgroundLayoutSafeArea'
import { CloseBtn } from '@/shared/ui/CloseBtn'
import { router } from 'expo-router'
import { type CameraDecision, useCameraDecision } from '@/shared/lib'




type CameraPermissionStep =
	| 'loading'
	| 'permission'
	| 'phone'
	| 'position'
	| 'capture'
	| 'preview'
	| 'final'

type CameraPermissionProps = {
	setStep: (value: SetStateAction<CameraPermissionStep>) => void
	onDecision?: (decision: CameraDecision) => void
}

export const CameraPermission = ({ setStep, onDecision }: CameraPermissionProps) => {
	const [permission, requestPermission] = useCameraPermissions()
	const { decision, setDecision } = useCameraDecision()

	useEffect(() => {
		if (permission?.granted) {
			void setDecision('granted')
			onDecision?.('granted')
		}
	}, [permission?.granted, onDecision, setDecision])

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
		onDecision?.(nextDecision)
		if (res.granted) {
			setStep('phone')
			return
		}
		showCameraRequiredAlert()
	}

	const handleNext = async () => {
		// если уже выданы — идём дальше без повторного запроса
		const isGranted = permission?.granted ?? decision === 'granted'
		if (isGranted) {
			setStep('phone')
			return
		}

		await requestAndHandle()
	}

	const handleStop = () => {
		router.push('/stats')
	}

	const isGranted = permission?.granted ?? decision === 'granted'

	return 	<BackgroundLayoutSafeArea>
		<View className="flex-1">
			{/*/!* Close Button *!/*/}
			<View className="absolute right-4 z-10">
				<CloseBtn handlePress={handleStop} classNames="h-12 w-12 rounded-2xl" />
			</View>

			{/* Progress Dots */}
			<View className="absolute left-1/2 top-10 z-10 -translate-x-1/2">
				<DotsProgress total={3} current={1} variant="onboarding" />
			</View>

			{/* Icon Section */}
			<View className="flex-1 items-center justify-center">
				<CameraIcon width={194} height={186} />
			</View>

			{/* Text and Button Section */}
			<View className="px-6 pb-6">
				{/* Title */}
				<Text className="mb-3 text-left text-h2 font-bold text-light-text-100">
					Конфиденциальность
				</Text>

				{/* Description */}
				<Text className="mb-20 text-left text-t2 leading-6 text-light-text-500">
					Все фото сохраняются на вашем телефоне. Мы не храним их у себя
				</Text>


				<Text className="mb-20 text-left text-t2 leading-6 text-light-text-500">
					Мы сделаем фотографии с 4 ракурсов: спереди, сзади, слева и справа
				</Text>



				{/* Button */}
				<Button
					variant="primary"
					onPress={handleNext}
					className="w-full"
				>
					{isGranted ? 'Далее' : 'Разрешить доступ'}
				</Button>
			</View>
		</View>
	</BackgroundLayoutSafeArea>
}