import type { FeatureMap, NormalizedKeypoints } from '../types'
import { COCO_17_INDICES, getMidHip, getMidShoulder } from '../cocoIndices'

// Symmetry deltas highlight left/right imbalance for quality checks.
export const computeSymmetry = (feats: FeatureMap): FeatureMap => {
    const result: FeatureMap = {}
    const pairs: Array<[string, string, string]> = [
        ['left_knee_angle', 'right_knee_angle', 'knee_angle_symmetry'],
        ['left_elbow_angle', 'right_elbow_angle', 'elbow_angle_symmetry'],
        ['left_shoulder_angle', 'right_shoulder_angle', 'shoulder_angle_symmetry'],
        ['left_knee_y', 'right_knee_y', 'knee_y_symmetry'],
        ['left_hip_y', 'right_hip_y', 'hip_y_symmetry'],
    ]

    pairs.forEach(([left, right, key]) => {
        if (left in feats && right in feats) {
            result[key] = Math.abs(feats[left] - feats[right])
        }
    })

    return result
}

// Shoulder/hip rotation proxies feed the anti-yaw guard in the FSM.
export const computeYaw = (nkpts: NormalizedKeypoints, minConfidence: number): FeatureMap => {
    const yaw: FeatureMap = {}
    const idx = COCO_17_INDICES

    const shouldersValid = nkpts[idx.left_shoulder][2] >= minConfidence && nkpts[idx.right_shoulder][2] >= minConfidence
    const hipsValid = nkpts[idx.left_hip][2] >= minConfidence && nkpts[idx.right_hip][2] >= minConfidence

    if (shouldersValid) {
        const vec = [
            nkpts[idx.right_shoulder][0] - nkpts[idx.left_shoulder][0],
            nkpts[idx.right_shoulder][1] - nkpts[idx.left_shoulder][1],
        ]
        const width = Math.hypot(vec[0], vec[1])
        if (width > 1e-6) {
            yaw.shoulder_yaw = vec[0] / width
        }
    }

    if (hipsValid) {
        const vec = [nkpts[idx.right_hip][0] - nkpts[idx.left_hip][0], nkpts[idx.right_hip][1] - nkpts[idx.left_hip][1]]
        const width = Math.hypot(vec[0], vec[1])
        if (width > 1e-6) {
            yaw.hip_yaw = vec[0] / width
        }
    }

    if (shouldersValid && hipsValid) {
        const midShoulder = getMidShoulder(nkpts)
        const midHip = getMidHip(nkpts)
        if (midShoulder[2] >= minConfidence && midHip[2] >= minConfidence) {
            const torso = [midShoulder[0] - midHip[0], midShoulder[1] - midHip[1]]
            const torsoLen = Math.hypot(torso[0], torso[1])
            if (torsoLen > 1e-6) {
                const shoulderDiff = nkpts[idx.right_shoulder][0] - nkpts[idx.left_shoulder][0]
                const hipDiff = nkpts[idx.right_hip][0] - nkpts[idx.left_hip][0]
                yaw.combined_yaw = (shoulderDiff + hipDiff) / (2 * torsoLen)
            }
        }
    }

    return yaw
}

