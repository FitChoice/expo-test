import { useEffect, useState } from 'react'
import { Camera } from 'expo-camera'
import * as tf from '@tensorflow/tfjs'
import * as posedetection from '@tensorflow-models/pose-detection'
import * as ScreenOrientation from 'expo-screen-orientation'

export const usePoseCameraSetup = () => {
	const [tfReady, setTfReady] = useState(false)
	const [model, setModel] = useState<posedetection.PoseDetector>()
	const [orientation, setOrientation] = useState<ScreenOrientation.Orientation>()
	const [error, setError] = useState<Error | null>(null)

	useEffect(() => {
		let orientationListener: ScreenOrientation.Subscription | null = null

		async function prepare() {
			try {
				// Set initial orientation
				const curOrientation = await ScreenOrientation.getOrientationAsync()
				setOrientation(curOrientation)

				// Listen to orientation changes
				orientationListener = ScreenOrientation.addOrientationChangeListener((event) => {
					setOrientation(event.orientationInfo.orientation)
				})

				// Camera permission
				await Camera.requestCameraPermissionsAsync()

				// Wait for tfjs to initialize the backend
				await tf.ready()

				const movenetModelConfig: posedetection.MoveNetModelConfig = {
					modelType: posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
					enableSmoothing: true,
				}

				const poseModel = await posedetection.createDetector(
					posedetection.SupportedModels.MoveNet,
					movenetModelConfig
				)
				setModel(poseModel)

				// Ready!
				setTfReady(true)
			} catch (err) {
				setError(err instanceof Error ? err : new Error('Failed to setup pose camera'))
			}
		}

		prepare()

		return () => {
			if (orientationListener) {
				ScreenOrientation.removeOrientationChangeListener(orientationListener)
			}
		}
	}, [])

	return {
		tfReady,
		model,
		orientation,
		error,
	}
}
