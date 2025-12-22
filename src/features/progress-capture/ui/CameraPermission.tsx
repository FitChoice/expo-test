import {
	Button,
	DotsProgress,
} from '@/shared/ui'
import { Text, View } from 'react-native'

import CameraIcon from '@/assets/icons/large/camera.svg'
import { useCameraPermissions } from 'expo-camera'
import { useEffect } from 'react'
import {
	BackgroundLayoutSafeArea
} from '@/shared/ui/BackgroundLayout/BackgroundLayoutSafeArea'
import { CloseBtn } from '@/shared/ui/CloseBtn'
import { router } from 'expo-router'
import {
	ProgressCaptureFlowState
} from '@/features/progress-capture/ui/ProgressCaptureFlow'




export const CameraPermission =  ({ setStep }: ProgressCaptureFlowState) => {


	const [permission, requestPermission] = useCameraPermissions()


	useEffect(() => {
		if (permission?.granted) {
			requestPermission()
		}
	}, [permission])


	const handleNext = async () => {
		setStep('phone')

	}

	const handleStop = () => {
		router.push('/stats')
	}

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
					disabled={!permission?.granted} // блокируем, пока не запрашивали и нет разрешения
					className="w-full"
				>
					 Далее
				</Button>
			</View>
		</View>
	</BackgroundLayoutSafeArea>
}