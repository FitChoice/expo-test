/**
 * Pose entity types based on MediaPipe landmarks
 */

/**
 * Single pose landmark point from MediaPipe
 */
export interface PoseLandmark {
	x: number // Normalized x coordinate (0-1)
	y: number // Normalized y coordinate (0-1)
	z: number // Depth relative to hip (negative = closer to camera)
	visibility: number // Confidence score (0-1)
}

/**
 * Complete pose data with all landmarks
 */
export interface PoseData {
	landmarks: PoseLandmark[]
	timestamp: number
}

/**
 * Pose landmark indices (MediaPipe Pose)
 * https://developers.google.com/mediapipe/solutions/vision/pose_landmarker
 */
export enum PoseLandmarkIndex {
	// Face
	NOSE = 0,
	LEFT_EYE_INNER = 1,
	LEFT_EYE = 2,
	LEFT_EYE_OUTER = 3,
	RIGHT_EYE_INNER = 4,
	RIGHT_EYE = 5,
	RIGHT_EYE_OUTER = 6,
	LEFT_EAR = 7,
	RIGHT_EAR = 8,
	MOUTH_LEFT = 9,
	MOUTH_RIGHT = 10,

	// Upper Body
	LEFT_SHOULDER = 11,
	RIGHT_SHOULDER = 12,
	LEFT_ELBOW = 13,
	RIGHT_ELBOW = 14,
	LEFT_WRIST = 15,
	RIGHT_WRIST = 16,
	LEFT_PINKY = 17,
	RIGHT_PINKY = 18,
	LEFT_INDEX = 19,
	RIGHT_INDEX = 20,
	LEFT_THUMB = 21,
	RIGHT_THUMB = 22,

	// Lower Body
	LEFT_HIP = 23,
	RIGHT_HIP = 24,
	LEFT_KNEE = 25,
	RIGHT_KNEE = 26,
	LEFT_ANKLE = 27,
	RIGHT_ANKLE = 28,
	LEFT_HEEL = 29,
	RIGHT_HEEL = 30,
	LEFT_FOOT_INDEX = 31,
	RIGHT_FOOT_INDEX = 32,
}

/**
 * Pose analysis result
 */
export interface PoseAnalysis {
	isValid: boolean
	confidence: number
	message?: string
}
