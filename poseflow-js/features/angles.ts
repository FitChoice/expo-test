import type { NormalizedKeypoints, FeatureMap } from '../types'
import { COCO_17_INDICES } from '../cocoIndices'

// Angles are reused by axes + symmetry, so keep this helper isolated.
const computeAngle = (
    p1: [number, number, number],
    p2: [number, number, number],
    p3: [number, number, number],
    minConf: number
): number | null => {
    if (p1[2] < minConf || p2[2] < minConf || p3[2] < minConf) {
        return null
    }
    const v1x = p1[0] - p2[0]
    const v1y = p1[1] - p2[1]
    const v2x = p3[0] - p2[0]
    const v2y = p3[1] - p2[1]
    const norm1 = Math.hypot(v1x, v1y)
    const norm2 = Math.hypot(v2x, v2y)
    if (norm1 < 1e-6 || norm2 < 1e-6) return null
    const dot = (v1x / norm1) * (v2x / norm2) + (v1y / norm1) * (v2y / norm2)
    const clamped = Math.min(1, Math.max(-1, dot))
    return (Math.acos(clamped) * 180) / Math.PI
}

export const computeAngles = (
    nkpts: NormalizedKeypoints,
    minConfidence: number,
    jointMinConfidence: Record<string, number>
): FeatureMap => {
    const idx = COCO_17_INDICES
    const feats: FeatureMap = {}

    const thr = (joint: string): number => jointMinConfidence[joint] ?? minConfidence

    const append = (name: string, angle: number | null) => {
        if (angle != null) {
            feats[name] = angle
        }
    }

    append(
        'left_knee_angle',
        computeAngle(nkpts[idx.left_hip], nkpts[idx.left_knee], nkpts[idx.left_ankle], Math.min(thr('left_hip'), thr('left_knee'), thr('left_ankle')))
    )
    append(
        'right_knee_angle',
        computeAngle(
            nkpts[idx.right_hip],
            nkpts[idx.right_knee],
            nkpts[idx.right_ankle],
            Math.min(thr('right_hip'), thr('right_knee'), thr('right_ankle'))
        )
    )
    append('left_elbow_angle', computeAngle(nkpts[idx.left_shoulder], nkpts[idx.left_elbow], nkpts[idx.left_wrist], minConfidence))
    append('right_elbow_angle', computeAngle(nkpts[idx.right_shoulder], nkpts[idx.right_elbow], nkpts[idx.right_wrist], minConfidence))
    append('left_shoulder_angle', computeAngle(nkpts[idx.left_hip], nkpts[idx.left_shoulder], nkpts[idx.left_elbow], minConfidence))
    append('right_shoulder_angle', computeAngle(nkpts[idx.right_hip], nkpts[idx.right_shoulder], nkpts[idx.right_elbow], minConfidence))

    const leftHip = nkpts[idx.left_hip]
    const rightHip = nkpts[idx.right_hip]
    if (leftHip[2] >= minConfidence && rightHip[2] >= minConfidence) {
        const midX = (leftHip[0] + rightHip[0]) / 2
        const midY = (leftHip[1] + rightHip[1]) / 2
        const leftVec = [leftHip[0] - midX, leftHip[1] - midY]
        const rightVec = [rightHip[0] - midX, rightHip[1] - midY]
        const leftNorm = Math.hypot(leftVec[0], leftVec[1])
        const rightNorm = Math.hypot(rightVec[0], rightVec[1])
        if (leftNorm > 1e-6 && rightNorm > 1e-6) {
            const dot = (leftVec[0] / leftNorm) * (rightVec[0] / rightNorm) + (leftVec[1] / leftNorm) * (rightVec[1] / rightNorm)
            feats.hip_angle = (Math.acos(Math.min(1, Math.max(-1, dot))) * 180) / Math.PI
        }
    }

    return feats
}

