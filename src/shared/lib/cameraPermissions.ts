import { useEffect, useState } from 'react'
import * as SecureStore from 'expo-secure-store'
import { Camera } from 'expo-camera'

export type CameraDecision = 'unknown' | 'granted' | 'denied'

const CAMERA_PERMISSION_KEY = 'camera_permission'

let cachedDecision: CameraDecision | null = null
let pendingRead: Promise<CameraDecision> | null = null
const listeners = new Set<(decision: CameraDecision) => void>()

export const getCameraDecision = async (): Promise<CameraDecision> => {
	if (cachedDecision) return cachedDecision
	if (pendingRead) return pendingRead

	pendingRead = (async () => {
		try {
			const stored = await SecureStore.getItemAsync(CAMERA_PERMISSION_KEY)
			if (stored === 'granted' || stored === 'denied') {
				cachedDecision = stored
				return stored
			}
		} catch (error) {
			console.error('Failed to get camera decision:', error)
		}

		cachedDecision = 'unknown'
		return 'unknown'
	})()

	const result = await pendingRead
	pendingRead = null
	return result
}

export const setCameraDecision = async (decision: CameraDecision): Promise<void> => {
	cachedDecision = decision
	try {
		if (decision === 'unknown') {
			await SecureStore.deleteItemAsync(CAMERA_PERMISSION_KEY)
		} else {
			await SecureStore.setItemAsync(CAMERA_PERMISSION_KEY, decision)
		}
	} catch (error) {
		console.error('Failed to save camera decision:', error)
	}
	listeners.forEach((listener) => listener(decision))
}

export const requestCameraPermission = async (): Promise<CameraDecision> => {
	const result = await Camera.requestCameraPermissionsAsync()
	const decision: CameraDecision = result.granted ? 'granted' : 'denied'
	await setCameraDecision(decision)
	return decision
}

export const useCameraDecision = () => {
	const [decision, setDecisionState] = useState<CameraDecision>('unknown')

	useEffect(() => {
		getCameraDecision().then(setDecisionState)
	}, [])

	useEffect(() => {
		const listener = (nextDecision: CameraDecision) => {
			setDecisionState(nextDecision)
		}
		listeners.add(listener)
		return () => {
			listeners.delete(listener)
		}
	}, [])

	const setDecision = async (nextDecision: CameraDecision) => {
		await setCameraDecision(nextDecision)
	}

	const refreshDecision = async () => {
		const nextDecision = await getCameraDecision()
		setDecisionState(nextDecision)
		return nextDecision
	}

	return { decision, setDecision, refreshDecision }
}
