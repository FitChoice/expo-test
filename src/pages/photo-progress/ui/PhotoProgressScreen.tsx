import { useState } from 'react'
import { FlatList, Image, Text, View } from 'react-native'

import { ProgressCaptureFlow } from '@/features/progress-capture'
import { useProgressListQuery } from '@/entities/progress'
import { Button, StatsDetailPageLayout, Loader } from '@/shared/ui'

export const PhotoProgressScreen = () => {
	const [isCapturing, setIsCapturing] = useState(false)
	const { data, isLoading, refetch } = useProgressListQuery()

	if (isCapturing) {
		return (
			<ProgressCaptureFlow
				onFinished={async () => {
					setIsCapturing(false)
					await refetch()
				}}
				onCancel={() => setIsCapturing(false)}
			/>
		)
	}

	return (
		<StatsDetailPageLayout isLoading={false} title="Фото-прогресс">
			<View className="flex-1 gap-6 px-4 py-4">
				{isLoading ? (
					<View className="flex-1 items-center justify-center">
						<Loader />
					</View>
				) : !data || data.length === 0 ? (
					<View className="flex-1 items-center justify-center gap-4">
						<Text className="text-center text-h2 text-light-text-100">
							Сделайте первое фото
						</Text>
						<Text className="text-center text-t2 text-light-text-200">
							Нужно 4 снимка: спереди, сзади, слева и справа.
						</Text>
						<Button onPress={() => setIsCapturing(true)}>Сделать фото</Button>
					</View>
				) : (
					<View className="gap-4">
						<Text className="text-t1.1 text-light-text-100">Последние снимки</Text>
						<FlatList
							data={data}
							numColumns={2}
							columnWrapperStyle={{ gap: 12 }}
							contentContainerStyle={{ gap: 12 }}
							renderItem={({ item }) => (
								<View className="w-[48%] overflow-hidden rounded-2xl border border-[#2a2a2a]">
									<Image source={{ uri: item.uri }} className="h-40 w-full" resizeMode="cover" />
									<View className="px-3 py-2">
										<Text className="text-body-medium text-light-text-100">{item.side}</Text>
										<Text className="text-caption-regular text-light-text-500">
											{new Date(item.createdAt).toLocaleDateString()}
										</Text>
									</View>
								</View>
							)}
							keyExtractor={(item) => item.id}
						/>
						<Button onPress={() => setIsCapturing(true)}>Переснять</Button>
					</View>
				)}
			</View>
		</StatsDetailPageLayout>
	)
}

