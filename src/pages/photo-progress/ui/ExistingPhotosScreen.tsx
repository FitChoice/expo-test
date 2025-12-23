import { Image, Text, View } from 'react-native'
import type { ProgressPhoto, ProgressSide } from '@/entities/progress/model/types'
import { Button } from '@/shared/ui'
import { sharedStyles } from '@/shared/ui/styles/shared-styles'

type Props = {
	data: ProgressPhoto[]
	resetProgress: () => Promise<void>
	setIsCapturing: (value: boolean) => void
	isResetting: boolean
}

const DAYS_INTERVAL = 30
const MS_IN_DAY = 1000 * 60 * 60 * 24
const PHOTO_SIDES_ORDER: ProgressSide[] = ['front', 'left', 'right', 'back']

const getDayWord = (value: number) => {
	const mod10 = value % 10
	const mod100 = value % 100

	if (mod10 === 1 && mod100 !== 11) return 'день'
	if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'дня'
	return 'дней'
}

export const ExistingPhotosScreen = ({ data, resetProgress, setIsCapturing, isResetting }: Props) => {
	const latestPhotoTimestamp = Math.max(
		...data.map((item) => new Date(item.createdAt).getTime()),
		0
	)

	const daysSinceLast = latestPhotoTimestamp
		? Math.floor((Date.now() - latestPhotoTimestamp) / MS_IN_DAY)
		: 0
	const daysUntilNext = Math.max(0, DAYS_INTERVAL - daysSinceLast)

	const orderedPhotos = PHOTO_SIDES_ORDER.map((side) => ({
		side,
		photo: data.find((item) => item.side === side),
	}))

	const handleRetake = async () => {
		await resetProgress()
		setIsCapturing(true)
	}

	return (
		<View className="flex-1 justify-between py-6">
			<View className="gap-8">
				<View className="flex-row items-center gap-4 px-1">
					<View className=" justify-between rounded-3xl border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-5">
						<Text style={sharedStyles.titleCenter}>
							{daysUntilNext}
						</Text>
						<Text className="text-center text-caption-regular leading-4 text-light-text-500 mt-3">
							{`${getDayWord(daysUntilNext)} до`}
							{'\n'}следующего{'\n'} фото
						</Text>
					</View>
					<View className="w-[124px] flex-row flex-wrap gap-2">
						{orderedPhotos.map(({ side, photo }) => (
							<View
								key={side}
								className="h-14 w-14 overflow-hidden rounded-lg bg-[#c7c7c7]"
							>
								{photo ? (
									<Image
										source={{ uri: photo.uri }}
										className="h-full w-full"
										resizeMode="cover"
									/>
								) : (
									<View className="flex-1" />
								)}
							</View>
						))}
					</View>
				</View>

				<View className="items-center gap-3 px-8">
					<Text style={sharedStyles.titleCenter}>
						Отличное начало!
					</Text>
					<Text className="text-center text-t2 text-light-text-200">
						Через месяц вы сможете добавить новое фото — и увидеть коллаж, который покажет,
						как изменилась ваша форма
					</Text>
				</View>
			</View>

			<View className="gap-3 px-2">
				{/*<Button*/}
				{/*	onPress={handleRetake}*/}
				{/*	disabled={isResetting}*/}
				{/*	variant="tertiary"*/}
				{/*	size="m"*/}
				{/*	fullWidth*/}
				{/*	className="rounded-[18px]"*/}
				{/*>*/}
				{/*	{isResetting ? 'Очищаем...' : 'Переснять'}*/}
				{/*</Button>*/}
				<View className="rounded-[18px] bg-[#444444] px-6 py-4">
					<Text className="text-center text-body-medium text-light-text-100">
						Мы подскажем, когда будет время сделать следующее фото
					</Text>
				</View>
			</View>
		</View>
	)
}