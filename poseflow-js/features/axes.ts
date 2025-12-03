import type { FeatureMap, NormalizedKeypoints } from '../types'
import { COCO_17_INDICES } from '../cocoIndices'

const mean = (values: number[]): number => values.reduce((acc, v) => acc + v, 0) / values.length

// Converts normalized geometry into the axes consumed by the FSM thresholds.
export const computeProgressAxes = (
    nkpts: NormalizedKeypoints,
    feats: FeatureMap,
    angleFeats: FeatureMap,
    minConfidence: number,
    jointMinConfidence: Record<string, number>
): FeatureMap => {
    const axes: FeatureMap = {}
    const idx = COCO_17_INDICES
    const thr = (name: string): number => jointMinConfidence[name] ?? minConfidence

    if ('left_knee_y' in feats && 'right_knee_y' in feats) {
        axes.squat_depth = -mean([feats.left_knee_y, feats.right_knee_y])
    } else if ('left_knee_y' in feats) {
        axes.squat_depth = -feats.left_knee_y
    } else if ('right_knee_y' in feats) {
        axes.squat_depth = -feats.right_knee_y
    } else if ('hip_y' in feats) {
        axes.squat_depth = -feats.hip_y
    }

    if ('sternum_y' in feats) {
        axes.pushup_depth = feats.sternum_y
    }

    if ('left_knee_angle' in angleFeats && 'right_knee_angle' in angleFeats) {
        axes.squat_knee_angle = mean([angleFeats.left_knee_angle, angleFeats.right_knee_angle])
    } else if ('left_knee_angle' in angleFeats) {
        axes.squat_knee_angle = angleFeats.left_knee_angle
    } else if ('right_knee_angle' in angleFeats) {
        axes.squat_knee_angle = angleFeats.right_knee_angle
    }

    if ('squat_knee_angle' in axes) {
        axes.squat_knee_angle_inv = 180 - axes.squat_knee_angle
    }

    const hipAngle = computeHipExtension(nkpts, minConfidence, jointMinConfidence)
    if (hipAngle != null) {
        axes.hip_extension_angle = hipAngle
    }

    const crunch = computeCrunchAngle(nkpts, minConfidence)
    if (crunch != null) {
        axes.crunch_angle = crunch
    }

    const legAbduction = computeLegAbduction(nkpts, thr)
    Object.assign(axes, legAbduction)

    const quad = computeQuadrupedExtension(nkpts, thr)
    Object.assign(axes, quad)

    return axes
}

const computeHipExtension = (
    nkpts: NormalizedKeypoints,
    minConfidence: number,
    thrMap: Record<string, number>
): number | null => {
    const idx = COCO_17_INDICES
    const leftThr = Math.min(thrMap.left_knee ?? minConfidence, thrMap.left_hip ?? minConfidence, thrMap.left_shoulder ?? minConfidence)
    const rightThr = Math.min(
        thrMap.right_knee ?? minConfidence,
        thrMap.right_hip ?? minConfidence,
        thrMap.right_shoulder ?? minConfidence
    )

    const left = computeAngleSafe(nkpts[idx.left_knee], nkpts[idx.left_hip], nkpts[idx.left_shoulder], leftThr)
    const right = computeAngleSafe(nkpts[idx.right_knee], nkpts[idx.right_hip], nkpts[idx.right_shoulder], rightThr)

    if (left != null && right != null) return mean([left, right])
    if (left != null) return left
    if (right != null) return right
    return null
}

const computeCrunchAngle = (nkpts: NormalizedKeypoints, minConfidence: number): number | null => {
    const idx = COCO_17_INDICES
    const nose = nkpts[idx.nose]
    const sternum = [(nkpts[idx.left_shoulder][0] + nkpts[idx.right_shoulder][0]) / 2, (nkpts[idx.left_shoulder][1] + nkpts[idx.right_shoulder][1]) / 2, (nkpts[idx.left_shoulder][2] + nkpts[idx.right_shoulder][2]) / 2] as [
        number,
        number,
        number,
    ]
    const hip = [(nkpts[idx.left_hip][0] + nkpts[idx.right_hip][0]) / 2, (nkpts[idx.left_hip][1] + nkpts[idx.right_hip][1]) / 2, (nkpts[idx.left_hip][2] + nkpts[idx.right_hip][2]) / 2] as [
        number,
        number,
        number,
    ]
    if (nose[2] < minConfidence || sternum[2] < minConfidence || hip[2] < minConfidence) return null
    return computeAngleSafe(nose, sternum, hip, minConfidence)
}

const computeLegAbduction = (
    nkpts: NormalizedKeypoints,
    thr: (name: string) => number
): FeatureMap => {
    const idx = COCO_17_INDICES
    const feats: FeatureMap = {}

    if (nkpts[idx.left_knee][2] >= thr('left_knee') && nkpts[idx.left_ankle][2] >= thr('left_ankle')) {
        const dx = nkpts[idx.left_knee][0] - nkpts[idx.left_ankle][0]
        const dy = nkpts[idx.left_knee][1] - nkpts[idx.left_ankle][1]
        feats.leg_abduction_distance_l = Math.hypot(dx, dy)
    }

    if (nkpts[idx.right_knee][2] >= thr('right_knee') && nkpts[idx.right_ankle][2] >= thr('right_ankle')) {
        const dx = nkpts[idx.right_knee][0] - nkpts[idx.right_ankle][0]
        const dy = nkpts[idx.right_knee][1] - nkpts[idx.right_ankle][1]
        feats.leg_abduction_distance_r = Math.hypot(dx, dy)
    }

    return feats
}

const computeQuadrupedExtension = (
    nkpts: NormalizedKeypoints,
    thr: (name: string) => number
): FeatureMap => {
    const idx = COCO_17_INDICES
    const feats: FeatureMap = {}

    if (nkpts[idx.left_hip][2] >= thr('left_hip') && nkpts[idx.left_knee][2] >= thr('left_knee')) {
        const dx = nkpts[idx.left_hip][0] - nkpts[idx.left_knee][0]
        const dy = nkpts[idx.left_hip][1] - nkpts[idx.left_knee][1]
        feats.quadruped_hip_extension_distance_l = Math.hypot(dx, dy)
    }

    if (nkpts[idx.right_hip][2] >= thr('right_hip') && nkpts[idx.right_knee][2] >= thr('right_knee')) {
        const dx = nkpts[idx.right_hip][0] - nkpts[idx.right_knee][0]
        const dy = nkpts[idx.right_hip][1] - nkpts[idx.right_knee][1]
        feats.quadruped_hip_extension_distance_r = Math.hypot(dx, dy)
    }

    return feats
}

const computeAngleSafe = (
    p1: [number, number, number],
    p2: [number, number, number],
    p3: [number, number, number],
    thr: number
): number | null => {
    if (p1[2] < thr || p2[2] < thr || p3[2] < thr) return null
    const v1x = p1[0] - p2[0]
    const v1y = p1[1] - p2[1]
    const v2x = p3[0] - p2[0]
    const v2y = p3[1] - p2[1]
    const norm1 = Math.hypot(v1x, v1y)
    const norm2 = Math.hypot(v2x, v2y)
    if (norm1 < 1e-6 || norm2 < 1e-6) return null
    const dot = (v1x / norm1) * (v2x / norm2) + (v1y / norm1) * (v2y / norm2)
    return (Math.acos(Math.min(1, Math.max(-1, dot))) * 180) / Math.PI
}

