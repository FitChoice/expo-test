import { useEffect, useState } from 'react'
import type * as posedetection from '@tensorflow-models/pose-detection'
import * as ScreenOrientation from 'expo-screen-orientation'
import { getPoseDetector } from '@/shared/lib'

export const usePoseCameraSetup = (options?: { enabled?: boolean; blockedError?: string }) => {
	const [tfReady, setTfReady] = useState(false)
	const [model, setModel] = useState<posedetection.PoseDetector>()
	const [orientation, setOrientation] = useState<ScreenOrientation.Orientation>()
	const [error, setError] = useState<Error | null>(null)
	const enabled = options?.enabled ?? true
	const blockedError = options?.blockedError

	useEffect(() => {
		let orientationListener: ScreenOrientation.Subscription | null = null
		let cancelled = false

		async function prepare() {
			try {
				setError(null)

				// Set initial orientation
				const curOrientation = await ScreenOrientation.getOrientationAsync()
				if (cancelled) return
				setOrientation(curOrientation)

				// Listen to orientation changes
				orientationListener = ScreenOrientation.addOrientationChangeListener((event) => {
					setOrientation(event.orientationInfo.orientation)
				})

				if (!enabled) {
					if (blockedError) {
						setError(new Error(blockedError))
					}
					setTfReady(false)
					setModel(undefined)
					return
				}

				const poseModel = await getPoseDetector()
				if (cancelled) return
				setModel(poseModel)

				// Ready!
				setTfReady(true)
			} catch (err) {
				if (cancelled) return
				setTfReady(false)
				setModel(undefined)
				setError(err as Error)
			}
		}

		prepare()

		return () => {
			cancelled = true
			if (orientationListener) {
				ScreenOrientation.removeOrientationChangeListener(orientationListener)
			}
		}
	}, [enabled, blockedError])

	return {
		tfReady,
		model,
		orientation,
		error,
	}
}
