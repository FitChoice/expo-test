import { useEffect, useMemo, useRef, useState } from 'react'
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

type ProgressCaptureFlowProps = {
	onFinished: () => void
	onCancel: () => void
}

const sidesOrder: ProgressSide[] = ['front', 'back', 'left', 'right']

const sideTitle: Record<ProgressSide, string> = {
	front: 'Спереди',
	back: 'Сзади',
	left: 'Слева',
	right: 'Справа',
}

const isPortrait = (o: ScreenOrientation.Orientation | null) =>
	o === ScreenOrientation.Orientation.PORTRAIT_UP ||
	o === ScreenOrientation.Orientation.PORTRAIT_DOWN

const PermissionScreen = ({ onRequest }: { onRequest: () => void }) => (
	<BackgroundLayoutNoSidePadding>
		<View className="flex-1 items-center justify-center gap-6 px-6">
			<Text className="text-center text-h2 text-light-text-100">
				Нужен доступ к камере
			</Text>
			<Text className="text-center text-t2 text-light-text-200">
				Дадим приложению доступ к камере, чтобы сделать фото-прогресс.
			</Text>
			<Button onPress={onRequest} className="w-full">
				Разрешить
			</Button>
		</View>
	</BackgroundLayoutNoSidePadding>
)

const PhonePositionScreen = ({
	onContinue,
}: {
	onContinue: () => void
}) => {
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

	return (
		<BackgroundLayoutNoSidePadding>
			<View className="flex-1 items-center justify-center gap-6 px-6">
				<Text className="text-center text-h2 text-light-text-100">Держите телефон вертикально</Text>
				<Text className="text-center text-t2 text-light-text-200">
					Для корректного кадра убедитесь, что телефон в портретной ориентации.
				</Text>
				<View
					className={`rounded-2xl px-4 py-3 ${
						isReady ? 'bg-brand-green-500/20 border border-brand-green-500' : 'bg-[#1f1f1f]'
					}`}
				>
					<Text className={isReady ? 'text-body-medium text-brand-green-500' : 'text-body-medium text-light-text-200'}>
						{isReady ? 'Ок, телефон вертикально' : 'Телефон не в портретной ориентации'}
					</Text>
				</View>
				<Button disabled={!isReady} onPress={onContinue} className="w-full">
					Продолжить
				</Button>
			</View>
		</BackgroundLayoutNoSidePadding>
	)
}

const PositionReadyScreen = ({
	onReady,
	title = 'Примите исходное положение',
	subtitle = 'Встаньте в полный рост. Держите телефон на уровне груди.',
	successText = 'Начнём',
}: {
	onReady: () => void
	title?: string
	subtitle?: string
	successText?: string
}) => {
	const [showSuccess, setShowSuccess] = useState(false)

	useEffect(() => {
		const successTimer = setTimeout(() => {
			setShowSuccess(true)
		}, 2000)
		const completeTimer = setTimeout(() => {
			onReady()
		}, 2200)
		return () => {
			clearTimeout(successTimer)
			clearTimeout(completeTimer)
		}
	}, [onReady])

	return (
		<BackgroundLayoutNoSidePadding>
			<View className="flex-1 items-center justify-center gap-6 px-6">
				<Text className="text-center text-h2 text-light-text-100">{title}</Text>
				<Text className="text-center text-t2 text-light-text-200">{subtitle}</Text>
				<View className="h-72 w-full items-center justify-center rounded-3xl border border-dashed border-light-text-300/40">
					<Text className="text-body-medium text-light-text-300">Силуэт</Text>
				</View>
				{showSuccess && <Text className="text-h1 text-brand-green-500">{successText}</Text>}
			</View>
		</BackgroundLayoutNoSidePadding>
	)
}

type CountdownCaptureProps = {
	side: ProgressSide
	onCaptured: (photo: TempCapturedPhoto) => void
	onCancel: () => void
}

const CountdownCapture = ({ side, onCaptured, onCancel }: CountdownCaptureProps) => {
	const [countdown, setCountdown] = useState(5)
	const [isCounting, setIsCounting] = useState(true)
	const cameraRef = useRef<CameraView | null>(null)

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
	const [permission, requestPermission] = useCameraPermissions()
	const [step, setStep] = useState<'permission' | 'phone' | 'position' | 'capture' | 'preview' | 'final'>(
		'permission'
	)
	const [currentSideIndex, setCurrentSideIndex] = useState(0)
	const [currentPhoto, setCurrentPhoto] = useState<TempCapturedPhoto | null>(null)
	const [pendingPhotos, setPendingPhotos] = useState<TempCapturedPhoto[]>([])
	const [saveToGallery, setSaveToGallery] = useState(false)

	useOrientation(ScreenOrientation.OrientationLock.PORTRAIT_UP, true)

	const { mutateAsync: saveBatch, isPending: isSaving } = useSaveProgressBatchMutation()
	const [mediaPermissionChecked, setMediaPermissionChecked] = useState(false)

	useEffect(() => {
		if (permission?.granted) {
			setStep('phone')
		}
	}, [permission])

	const side = sidesOrder[currentSideIndex]

	if (!permission || !permission.granted) {
		return <PermissionScreen onRequest={() => requestPermission()} />
	}

	if (step === 'phone') {
		return <PhonePositionScreen onContinue={() => setStep('position')} />
	}

	if (step === 'position') {
		return (
			<PositionReadyScreen
				onReady={() => setStep('capture')}
				title={`Ракурс: ${sideTitle[side]}`}
				subtitle="Встаньте прямо, держите телефон на уровне груди"
				successText="Начнём"
			/>
		)
	}

	if (step === 'capture') {
		return (
			<CountdownCapture
				side={side}
				onCaptured={(photo) => {
					setCurrentPhoto(photo)
					setStep('preview')
				}}
				onCancel={onCancel}
			/>
		)
	}

	if (step === 'preview' && currentPhoto) {
		return (
			<PreviewScreen
				photo={currentPhoto}
				onRetake={() => setStep('capture')}
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
			/>
		)
	}

	if (step === 'final') {
		return (
			<FinalScreen
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
			/>
		)
	}

	return (
		<View className="flex-1 items-center justify-center bg-black">
			<Loader />
		</View>
	)
}

