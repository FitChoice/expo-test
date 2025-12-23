import React, { useEffect, useMemo, useRef, useState } from 'react'
import { CameraView, useCameraPermissions } from 'expo-camera'
import * as ScreenOrientation from 'expo-screen-orientation'
import * as MediaLibrary from 'expo-media-library'
import { Image, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native'

import {
	useSaveProgressBatchMutation,
	type TempCapturedPhoto,
	type ProgressSide,
} from '@/entities/progress'
import { Button, BackgroundLayoutNoSidePadding, Icon, Loader } from '@/shared/ui'
import { useOrientation } from '@/shared/lib/useOrientation'
import {
	CameraPermission
} from '@/features/progress-capture/ui/CameraPermission'
import { PhonePosition } from '@/features/progress-capture/ui/PhonePosition'
import { PositionReady } from '@/features/progress-capture/ui/PositionReady'
import { usePoseCameraSetup } from '@/widgets/pose-camera'
import {
	CountdownCapture
} from '@/features/progress-capture/ui/CountDownCapture'

type ProgressCaptureFlowProps = {
	onFinished: () => void
	onCancel: () => void
}

export type ProgressCaptureFlowState = {
	 setStep: (value: React.SetStateAction<'loading' | 'permission' | 'phone' | 'position' | 'capture' | 'preview' | 'final'>) => void
}

const sidesOrder: ProgressSide[] = ['front', 'back', 'left', 'right']

type PreviewProps = {
	photo: TempCapturedPhoto
	onRetake: () => void
	onConfirm: () => void
}

const PreviewScreen = ({ photo, onRetake, onConfirm }: PreviewProps) => (
	<View className="flex-1 bg-black">
		<Image source={{ uri: photo.tempUri }} className="h-full w-full" resizeMode="contain" />
		<View className="absolute bottom-0 left-0 right-0 flex-row gap-3 bg-black/70 px-4 py-4">
			<Button variant="secondary" onPress={onRetake} className="flex-1">
				Переснять
			</Button>
			<Button onPress={onConfirm} className="flex-1">
				Далее
			</Button>
		</View>
	</View>
)

const FinalScreen = ({
	items,
	onSave,
	onRestart,
	saveToGallery,
	onToggleSaveToGallery,
	isSaving,
}: {
	items: TempCapturedPhoto[]
	onSave: () => void
	onRestart: () => void
	saveToGallery: boolean
	onToggleSaveToGallery: () => void
	isSaving: boolean
}) => (
	<BackgroundLayoutNoSidePadding>
		<ScrollView className="flex-1 px-4 py-6" contentContainerStyle={{ gap: 12 }}>
			<Text className="text-h2 text-light-text-100">Готово! Проверьте фото</Text>
			<View className="flex-row flex-wrap gap-3">
				{items.map((item) => (
					<View
						key={`${item.side}-${item.tempUri}`}
						className="w-[47%] overflow-hidden rounded-2xl border border-[#2a2a2a]"
					>
						<Image source={{ uri: item.tempUri }} className="h-40 w-full" resizeMode="cover" />
						<Text className="px-3 py-2 text-body-medium text-light-text-100">
							{sideTitle[item.side]}
						</Text>
					</View>
				))}
			</View>
			<View className="mt-2 flex-row items-center justify-between rounded-2xl bg-[#1f1f1f] px-4 py-3">
				<Text className="text-body-medium text-light-text-100">Сохранить в галерею</Text>
				<Pressable
					onPress={onToggleSaveToGallery}
					className={`h-6 w-12 rounded-full ${saveToGallery ? 'bg-brand-green-500' : 'bg-[#555]'}`}
				>
					<View
						className={`h-6 w-6 rounded-full bg-white ${saveToGallery ? 'ml-6' : 'ml-0'}`}
					/>
				</Pressable>
			</View>
			<Button onPress={onSave} disabled={isSaving || items.length < 4}>
				{isSaving ? 'Сохраняем...' : items.length < 4 ? 'Сделайте 4 снимка' : 'Сохранить'}
			</Button>
			<Button variant="ghost" onPress={onRestart} disabled={isSaving}>
				Начать заново
			</Button>
		</ScrollView>
	</BackgroundLayoutNoSidePadding>
)

export const ProgressCaptureFlow = ({ onFinished, onCancel }: ProgressCaptureFlowProps) => {
	const [permission] = useCameraPermissions()
	const { tfReady, model, error } = usePoseCameraSetup()
	const [step, setStep] = useState<'loading' | 'permission' | 'phone' | 'position' | 'capture' | 'preview' | 'final'>('permission')
	const [currentSideIndex, setCurrentSideIndex] = useState(0)
	const [currentPhoto, setCurrentPhoto] = useState<TempCapturedPhoto | null>(null)
	const [pendingPhotos, setPendingPhotos] = useState<TempCapturedPhoto[]>([])
	const [saveToGallery, setSaveToGallery] = useState(false)

	useOrientation(ScreenOrientation.OrientationLock.PORTRAIT_UP, true)


	const {
		mutateAsync: saveBatch,
		isPending: isSaving
	} = useSaveProgressBatchMutation()
	const [mediaPermissionChecked, setMediaPermissionChecked] = useState(false)


	const side = sidesOrder[currentSideIndex]

	if (!permission || !permission.granted || step === 'permission' ) {
		return <CameraPermission setStep={setStep} />
	}

	if (step === 'phone') {
		return <PhonePosition setStep={setStep} />
	}

	if (step === 'position' && model) {
		return (<PositionReady
			model={model}
			setStep={setStep}
			/>)
	}

	if (step === 'capture') {
		return (<CountdownCapture
				side={side}
				onCaptured={(photo) => {
					setCurrentPhoto(photo)
					setStep('preview')
				}}
				onCancel={onCancel}
			/>)
	}

	if (step === 'preview' && currentPhoto) {
		return (<PreviewScreen
				photo={currentPhoto}
				onRetake={() => setStep('phone')}
				onConfirm={() => {
					setPendingPhotos((prev) => {
						const filtered = prev.filter((p) => p.side !== currentPhoto.side)
						return [...filtered, currentPhoto]
					})
					const nextSide = currentSideIndex + 1
					if (nextSide >= sidesOrder.length) {
						setStep('final')
					} else {
						setCurrentSideIndex(nextSide)
						setCurrentPhoto(null)
						setStep('position')
					}
				}}
			/>)
	}

	if (step === 'final') {
		return (<FinalScreen
				items={pendingPhotos}
				saveToGallery={saveToGallery}
				onToggleSaveToGallery={async () => {
					if (!saveToGallery && !mediaPermissionChecked) {
						const res = await MediaLibrary.requestPermissionsAsync()
						setMediaPermissionChecked(true)
						if (!res.granted) {
							setSaveToGallery(false)
							return
						}
						setSaveToGallery(true)
					} else {
						setSaveToGallery(!saveToGallery)
					}
				}}
				isSaving={isSaving}
				onSave={async () => {
					await saveBatch({ items: pendingPhotos, saveToGallery })
					onFinished()
				}}
				onRestart={() => {
					setPendingPhotos([])
					setCurrentSideIndex(0)
					setCurrentPhoto(null)
					setStep('position')
				}}
			/>)
	}

	if (step === 'loading' || !tfReady) {
		return (<View className="flex-1 items-center justify-center w-full bg-red-500">
				<Loader />
			</View>)
	}
}

