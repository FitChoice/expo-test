/**
 * Camera Permission Screen (2.1)
 * Второй шаг onboarding - запрос разрешения на использование камеры
 */

import { View, Text } from 'react-native'
import { useState } from 'react'
import { Button, Icon } from '@/shared/ui'
import { DotsProgress } from '@/shared/ui/DotsProgress'
import Svg, { Defs, LinearGradient, RadialGradient, Stop, Rect } from 'react-native-svg'
import CameraIcon from '@/assets/icons/large/camera.svg'
import { Camera } from 'expo-camera'
import { GradientBg } from '@/shared/ui/GradientBG'


interface CameraPermissionScreenProps {
	onNext: () => void
}

export function CameraPermissionScreen({ onNext }: CameraPermissionScreenProps) {
	const [isRequesting, setIsRequesting] = useState(false)

	const handleRequestPermission = async () => {
		setIsRequesting(true)
		try {
			const { status } = await Camera.requestCameraPermissionsAsync()
			if (status === 'granted') {
				onNext()
			}
		} catch (error) {
			console.error('Failed to request camera permission:', error)
		} finally {
			setIsRequesting(false)
		}
	}

	return (
		<View className="flex-1 bg-black">
		{/* Gradient Background */}

			<GradientBg />

			{/* Close Button */}
			<View className="absolute right-4 top-12 z-10">
				<Button variant="ghost" onPress={() => {}} className="h-12 w-12 rounded-2xl">
					<Icon name="close" size={24} color="#FFFFFF" />
				</Button>
			</View>

		{/* Progress Dots */}

        <View className="absolute left-1/2 -translate-x-1/2 top-20 z-10">
		<DotsProgress total={4} current={1} variant="onboarding" />
      </View>


		{/* Icon Section */}
		<View className="flex-1 justify-center items-center ">
			<CameraIcon width={194} height={186} />
		</View>

		{/* Text and Button Section */}
		<View className="px-6 pb-6">
			{/* Title */}
			<Text className="text-h2 font-bold text-light-text-100 mb-3 text-left">
			Конфедициальность
			</Text>

			{/* Description */}
			<Text className="text-t2 text-light-text-500 text-left leading-6 mb-20">
			Камера используется только для анализа движений. Видео не сохраняется и не передаётся	
				</Text>

			{/* Button */}
			<Button variant="primary" onPress={onNext} className="w-full">
				Далее
			</Button>
		</View>
		</View>
	)
}