import { Text, View } from 'react-native'
import { Button, DotsProgress } from '@/shared/ui'
import {
	BackgroundLayoutSafeArea
} from '@/shared/ui/BackgroundLayout/BackgroundLayoutSafeArea'
import { router } from 'expo-router'
import { CloseBtn } from '@/shared/ui/CloseBtn'
import { CameraView } from 'expo-camera'
import React, { useEffect, useState } from 'react'
import * as ScreenOrientation from 'expo-screen-orientation'

export type ProgressCaptureFlowState = {
	setStep: (value: React.SetStateAction<'loading' | 'permission' | 'phone' | 'position' | 'capture' | 'preview' | 'final'>) => void
	handleStop: () => void
}

export const PhonePosition =   ({ setStep, handleStop }: ProgressCaptureFlowState) => {


	const isPortrait = (o: ScreenOrientation.Orientation | null) =>
		o === ScreenOrientation.Orientation.PORTRAIT_UP ||
		o === ScreenOrientation.Orientation.PORTRAIT_DOWN




	const [isReady, setIsReady] = useState(false)

	useEffect(() => {
		const read = async () => {
			const current = await ScreenOrientation.getOrientationAsync()
			setIsReady(isPortrait(current))
		}
		read()
		const sub = ScreenOrientation.addOrientationChangeListener((event) => {
			setIsReady(isPortrait(event.orientationInfo.orientation))
		})
		return () => {
			ScreenOrientation.removeOrientationChangeListener(sub)
		}
	}, [])

	const onNext = () => {
		setStep('position')
	}


	return 	<BackgroundLayoutSafeArea >
		<View className="flex-1">
			{/*/!* Close Button *!/*/}
			<View className="absolute right-4 z-10">
				<CloseBtn handlePress={handleStop} classNames="h-12 w-12 rounded-2xl" />
			</View>

			{/* Progress Dots */}
			<View className="absolute left-1/2 top-20 z-10 -translate-x-1/2">
				<DotsProgress total={3} current={2} variant="onboarding" />
			</View>


			{/* Content */}
			<View className="mb-10 mt-20 flex-1 items-center justify-center px-6">
				{/* Camera Preview */}
				<View className="h-96 w-full overflow-hidden rounded-3xl bg-black mb-10">
					<CameraView
						facing="front"
						className="flex-1"
						style={{ width: '100%', height: '100%' }}
					/>
				</View>

				{/* Title */}
				<Text className="mb-3 text-left text-h2 font-bold text-light-text-100">
					Поставьте телефон вертикально
				</Text>

				{/* Description */}
				<Text className=" text-left text-t2 font-bold text-light-text-500">
					Поставьте смартфон на пол, слегка наклонив его к стене, чтобы камера хорошо фиксировала ваше положение
				</Text>
			</View>

			{/* Button */}
			<View className="p-6 pb-12">
				<Button
					variant="primary"
					onPress={onNext}
					disabled={!isReady}
					className="w-full"
				>
					Далее
				</Button>
			</View>
		</View>
	</BackgroundLayoutSafeArea>
}