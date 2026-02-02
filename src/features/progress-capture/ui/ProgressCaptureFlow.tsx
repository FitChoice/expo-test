import React, { useMemo, useState, useEffect } from 'react'
import { Text, View } from 'react-native'
import * as ScreenOrientation from 'expo-screen-orientation'
import * as MediaLibrary from 'expo-media-library'
import {
	useSaveProgressBatchMutation,
	type TempCapturedPhoto,
	type ProgressSide,
} from '@/entities/progress'
import { BackgroundLayoutNoSidePadding, Loader } from '@/shared/ui'
import { useOrientation } from '@/shared/lib/useOrientation'
import { useCameraDecision } from '@/shared/lib'
import {
	CameraPermission
} from '@/features/progress-capture/ui/CameraPermission'
import { PhonePosition } from '@/features/progress-capture/ui/PhonePosition'
import { PositionReady } from '@/features/progress-capture/ui/PositionReady'
import { usePoseCameraSetup } from '@/widgets/pose-camera'
import {
	CountdownCapture
} from '@/features/progress-capture/ui/CountDownCapture'
import { PreviewScreen } from '@/features/progress-capture/ui/PreviewScreen'
import { sideTitle } from '@/shared/constants/labels'
import { router } from 'expo-router'
import { FinalScreen } from '@/features/progress-capture/ui/FinalScreen'

type ProgressCaptureFlowProps = {
	onFinished: () => void
	onCancel: () => void
}


const sidesOrder: ProgressSide[] = ['front', 'back', 'left', 'right']
const sideIndexMap: Record<ProgressSide, number> = sidesOrder.reduce(
	(acc, current, index) => {
		acc[current] = index
		return acc
	},
	{} as Record<ProgressSide, number>,
)


export const ProgressCaptureFlow = ({ onFinished, onCancel }: ProgressCaptureFlowProps) => {
	const { decision: cameraDecision, setDecision } = useCameraDecision()
	const { tfReady, model, error } = usePoseCameraSetup({
		enabled: cameraDecision === 'granted',
	})
	const [step, setStep] = useState<'loading' | 'permission' | 'phone' | 'position' | 'capture' | 'preview' | 'final'>('permission')
	const [currentSideIndex, setCurrentSideIndex] = useState(0)
	const [currentPhoto, setCurrentPhoto] = useState<TempCapturedPhoto | null>(null)
	const [pendingPhotos, setPendingPhotos] = useState<TempCapturedPhoto[]>([])
	const [retakeSide, setRetakeSide] = useState<ProgressSide | null>(null)
	const [saveToGallery, setSaveToGallery] = useState(false)

	useOrientation(ScreenOrientation.OrientationLock.PORTRAIT_UP, true)

	useEffect(() => {
		if (cameraDecision === 'granted' && step === 'permission') {
			setStep('phone')
		}
	}, [cameraDecision, step])


	const {
		mutateAsync: saveBatch,
		isPending: isSaving
	} = useSaveProgressBatchMutation()
	const [mediaPermissionChecked, setMediaPermissionChecked] = useState(false)


	const handleStop = () => {
		router.push('/stats')
	}

	const startCaptureForSide = (targetSide: ProgressSide, isRetake: boolean) => {
		setCurrentPhoto(null)
		setCurrentSideIndex(sideIndexMap[targetSide])
		setRetakeSide(isRetake ? targetSide : null)
		setStep('position')
	}

	const side = useMemo<ProgressSide>(() => sidesOrder[currentSideIndex] ?? 'front', [currentSideIndex])

	const sideLabel = useMemo(() => sideTitle[side], [side])

	if (cameraDecision !== 'granted' || step === 'permission') {
		return <CameraPermission setStep={setStep} onDecision={setDecision} />
	}

	if (step === 'phone') {
		return <PhonePosition setStep={setStep} handleStop={handleStop}/>
	}

	if (step === 'position' && model) {
		return (<PositionReady
			side={side}
			handleStop={handleStop}
			model={model}
			setStep={setStep}
			/>)
	}

	if (step === 'capture') {
		return (<CountdownCapture
			handleStop={handleStop}
			currentSideIndex={currentSideIndex}
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
			currentSideIndex={currentSideIndex}
			handleStop={handleStop}
			  sideLabel={sideLabel}
				photo={currentPhoto}
				onRetake={() => setStep('position')}
				onConfirm={() => {
					setPendingPhotos((prev) => {
						const filtered = prev.filter((p) => p.side !== currentPhoto.side)
						return [...filtered, currentPhoto]
					})

					if (retakeSide) {
						setRetakeSide(null)
						setCurrentPhoto(null)
						setStep('final')
						return
					}

					const nextSide = currentSideIndex + 1
					if (nextSide >= sidesOrder.length) {
						setStep('final')
						return
					}

					setCurrentSideIndex(nextSide)
					setCurrentPhoto(null)
					setStep('position')
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
				onRestart={(side) => {
					setPendingPhotos((prev) => prev.filter((p) => p.side !== side))
					startCaptureForSide(side, true)
				}}
			/>)
	}

	if (error) {
		return (
			<BackgroundLayoutNoSidePadding>
			<View className="flex-1 items-center justify-center px-6">
				<Text className="mb-3 text-center text-h2 font-bold text-light-text-100">
					Ошибка инициализации камеры
				</Text>
				<Text className="text-center text-t2 leading-6 text-light-text-500">
					{error.message}
				</Text>
			</View>
				</BackgroundLayoutNoSidePadding>
		)
	}

	if (step === 'loading' || !tfReady) {
		return 	<Loader />
	}

	return null
}

