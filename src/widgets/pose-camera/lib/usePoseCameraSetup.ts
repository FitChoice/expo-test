import { useEffect, useState } from 'react'
import * as tf from '@tensorflow/tfjs'
import * as posedetection from '@tensorflow-models/pose-detection'
import * as ScreenOrientation from 'expo-screen-orientation'

const withTimeout = async <T,>(promise: Promise<T>, timeoutMs: number) => {
	return new Promise<T>((resolve, reject) => {
		const timerId = setTimeout(() => {
			reject(new Error('TensorFlow initialization timed out'))
		}, timeoutMs)

		promise
			.then((result) => {
				clearTimeout(timerId)
				resolve(result)
			})
			.catch((error) => {
				clearTimeout(timerId)
				reject(error)
			})
	})
}

const waitForTfReady = async (retries = 3, timeoutMs = 8000) => {
	let lastError: unknown
	for (let attempt = 1; attempt <= retries; attempt += 1) {
		try {
			await withTimeout(tf.ready(), timeoutMs)
			return
		} catch (error) {
			lastError = error
		}
	}
	throw (lastError as Error) || new Error('TensorFlow initialization failed')
}

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

				// Wait for tfjs to initialize the backend
				await waitForTfReady()
				if (cancelled) return

				const movenetModelConfig: posedetection.MoveNetModelConfig = {
					modelType: posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
					enableSmoothing: true,
				}

				const poseModel = await posedetection.createDetector(
					posedetection.SupportedModels.MoveNet,
					movenetModelConfig
				)
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
