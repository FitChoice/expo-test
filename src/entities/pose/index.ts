/**
 * Pose entity public API
 */

// Types
export type {
	PoseLandmark,
	PoseData,
	PoseAnalysis,
} from './model/types'

export { PoseLandmarkIndex } from './model/types'

// Analysis functions
export {
	isLandmarkValid,
	calculateDistance,
	calculateAngle,
	validatePose,
	logLandmarks,
} from './lib/analyzer'

