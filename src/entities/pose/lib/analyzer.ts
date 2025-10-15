/**
 * Pose analysis functions
 */

import { constants } from '@/shared/config'
import type { PoseAnalysis, PoseData, PoseLandmark } from '../model/types'

/**
 * Validates if a pose landmark is visible and confident enough
 * @param landmark - The pose landmark to validate
 * @returns True if landmark meets minimum requirements
 */
export const isLandmarkValid = (landmark: PoseLandmark): boolean => {
	const { MIN_VISIBILITY } = constants.POSE_DETECTION
	return landmark.visibility >= MIN_VISIBILITY
}

/**
 * Calculates the Euclidean distance between two landmarks
 * @param point1 - First landmark
 * @param point2 - Second landmark
 * @returns Distance between points
 */
export const calculateDistance = (
	point1: PoseLandmark,
	point2: PoseLandmark
): number => {
	const dx = point2.x - point1.x
	const dy = point2.y - point1.y
	const dz = point2.z - point1.z
	return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

/**
 * Calculates the angle between three landmarks (in degrees)
 * @param point1 - First point
 * @param point2 - Middle point (vertex)
 * @param point3 - Third point
 * @returns Angle in degrees
 */
export const calculateAngle = (
	point1: PoseLandmark,
	point2: PoseLandmark,
	point3: PoseLandmark
): number => {
	const radians =
		Math.atan2(point3.y - point2.y, point3.x - point2.x) -
		Math.atan2(point1.y - point2.y, point1.x - point2.x)
	let angle = Math.abs((radians * 180.0) / Math.PI)

	if (angle > 180.0) {
		angle = 360 - angle
	}

	return angle
}

/**
 * Validates a complete pose data
 * @param poseData - The pose data to validate
 * @returns Analysis result with validation status
 */
export const validatePose = (poseData: PoseData): PoseAnalysis => {
	if (!poseData.landmarks || poseData.landmarks.length === 0) {
		return {
			isValid: false,
			confidence: 0,
			message: 'No landmarks detected',
		}
	}

	// Count valid landmarks
	const validLandmarks = poseData.landmarks.filter(isLandmarkValid).length
	const confidence = validLandmarks / poseData.landmarks.length

	if (confidence < constants.POSE_DETECTION.MIN_CONFIDENCE) {
		return {
			isValid: false,
			confidence,
			message: 'Pose confidence too low',
		}
	}

	return {
		isValid: true,
		confidence,
	}
}

/**
 * Logs pose landmarks for debugging (development only)
 * @param landmarks - Array of pose landmarks
 */
export const logLandmarks = (landmarks: PoseLandmark[]): void => {
	if (__DEV__) {
		landmarks.forEach((point, idx) => {
			// eslint-disable-next-line no-console
			console.log(
				`Точка ${idx}: x=${point.x.toFixed(3)}, y=${point.y.toFixed(3)}, z=${point.z.toFixed(3)}, vis=${point.visibility.toFixed(3)}`
			)
		})
	}
}

