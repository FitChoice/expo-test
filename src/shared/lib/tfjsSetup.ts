import * as tf from '@tensorflow/tfjs'
import '@tensorflow/tfjs-backend-cpu'
import '@tensorflow/tfjs-backend-webgl'
import '@tensorflow/tfjs-react-native'
import * as posedetection from '@tensorflow-models/pose-detection'

let initPromise: Promise<void> | null = null
let detectorPromise: Promise<posedetection.PoseDetector> | null = null

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

const ensureBackend = async () => {
	const backend = tf.getBackend()
	if (backend && backend !== 'rn-webgl') {
		await tf.setBackend('rn-webgl')
	}
	if (!backend) {
		await tf.setBackend('rn-webgl')
	}
}

export const initTfjs = async (): Promise<void> => {
	if (!initPromise) {
		initPromise = (async () => {
			await ensureBackend()
			await waitForTfReady()
		})()
	}
	return initPromise
}

export const getPoseDetector = async (): Promise<posedetection.PoseDetector> => {
	if (!detectorPromise) {
		detectorPromise = (async () => {
			await initTfjs()
			const movenetModelConfig: posedetection.MoveNetModelConfig = {
				modelType: posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
				enableSmoothing: true,
			}
			return posedetection.createDetector(
				posedetection.SupportedModels.MoveNet,
				movenetModelConfig
			)
		})()
	}
	return detectorPromise
}
