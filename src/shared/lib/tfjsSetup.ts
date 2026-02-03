import * as tf from '@tensorflow/tfjs'
import '@tensorflow/tfjs-backend-cpu'
import '@tensorflow/tfjs-backend-webgl'
import { bundleResourceIO, decodeJpeg, fetch as tfjsFetch } from '@tensorflow/tfjs-react-native'
import { GLView } from 'expo-gl'
import { Platform } from 'react-native'

import * as posedetection from '@tensorflow-models/pose-detection'

const BACKENDS_PRIORITY = ['rn-webgl', 'webgl', 'cpu'] as const

let initPromise: Promise<void> | null = null
let detectorPromise: Promise<posedetection.PoseDetector> | null = null
let activeBackend: string | null = null

// Keep a reference to prevent tree-shaking of side-effectful imports.
const tfjsReactNativeUtils = { bundleResourceIO, decodeJpeg, tfjsFetch }

const ensureGLContext = async (): Promise<void> => {
	if (Platform.OS === 'web') return

	try {
		const ctx = await GLView.createContextAsync()
		if (ctx && typeof (ctx as any).endFrameEXP === 'function') {
			;(ctx as any).endFrameEXP()
		}
	} catch (error) {
		console.warn('[TensorFlow] GLView warmup failed:', error)
	}
}

const trySetBackend = async (backendName: string): Promise<boolean> => {
	try {
		const result = await tf.setBackend(backendName)
		if (result) {
			await tf.ready()
			return true
		}
	} catch (error) {
		console.warn(`[TensorFlow] Backend ${backendName} failed:`, error)
	}
	return false
}

const initializeBackend = async (): Promise<string> => {
	await ensureGLContext()

	for (const backend of BACKENDS_PRIORITY) {
		if (await trySetBackend(backend)) {
			console.log(`[TensorFlow] Initialized with backend: ${backend}`)
			return backend
		}
	}

	throw new Error('[TensorFlow] No available backend')
}

export const initTfjs = async (): Promise<void> => {
	if (!initPromise) {
		initPromise = (async () => {
			activeBackend = await initializeBackend()
		})()
	}
	return initPromise
}

export const getActiveBackend = (): string | null => activeBackend

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

export { tfjsReactNativeUtils }
