import { useEffect, useState } from 'react'
import { View } from 'react-native'

import { ProgressCaptureFlow } from '@/features/progress-capture'
import { useProgressListQuery, useResetProgressMutation } from '@/entities/progress'
import { StatsDetailPageLayout, Loader } from '@/shared/ui'
import {
	ExistingPhotosScreen
} from '@/pages/photo-progress/ui/ExistingPhotosScreen'

export const PhotoProgressScreen = () => {
	const [isCapturing, setIsCapturing] = useState(false)
	const { data, isLoading, refetch, isFetched } = useProgressListQuery()
	const { mutateAsync: resetProgress, isPending: isResetting } = useResetProgressMutation()

	useEffect(() => {
		if (isCapturing || isLoading || !isFetched) return

		if (!data || data.length === 0) {
			setIsCapturing(true)
		}
	}, [data, isCapturing, isFetched, isLoading])

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
			<View className="flex-1 gap-6">
				{isLoading ? <Loader /> : <ExistingPhotosScreen
					data={data ?? []}
					resetProgress={resetProgress}
					setIsCapturing={setIsCapturing}
					isResetting={isResetting}
				/>
				}
			</View>
		</StatsDetailPageLayout>
	)
}

