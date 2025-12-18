/**
 * VideoProgressBar - индикатор прогресса воспроизведения видео
 * Показывает прогресс в виде линии от начала к концу
 */

import { View, type ViewProps } from 'react-native'
import { useEffect, useState } from 'react'
import type { VideoPlayer } from 'expo-video'

export interface VideoProgressBarProps extends ViewProps {
	/** Video player instance */
	player: VideoPlayer | null
}

export function VideoProgressBar({ player, className, ...props }: VideoProgressBarProps) {
	const [progress, setProgress] = useState(0)

	useEffect(() => {
		if (!player) return

		const updateProgress = () => {
			if (player.duration > 0) {
				const currentProgress = player.currentTime / player.duration
				setProgress(Math.min(Math.max(currentProgress, 0), 1))
			}
		}

		// Обновляем прогресс периодически
		const interval = setInterval(() => {
			if (player.status === 'readyToPlay' && player.duration > 0) {
				updateProgress()
			}
		}, 100)

		return () => {
			clearInterval(interval)
		}
	}, [player])

	if (!player || player.duration === 0) {
		return (
			<View
				{...props}
				className={`h-1.5 w-full rounded-full bg-white/30 ${className || ''}`}
			/>
		)
	}

	return (
		<View
			{...props}
			className={`h-1.5 w-full overflow-hidden rounded-full bg-white/30 ${className || ''}`}
		>
			<View
				className="h-full rounded-full bg-brand-green-500"
				style={{
					width: `${progress * 100}%`,
				}}
			/>
		</View>
	)
}
