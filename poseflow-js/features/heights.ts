import type { FeatureMap, NormalizedKeypoints } from '../types'
import { COCO_17_INDICES } from '../cocoIndices'
import { getMidHip, getMidShoulder } from '../cocoIndices'

export const computeHeights = (
    nkpts: NormalizedKeypoints,
    minConfidence: number,
    jointMinConfidence: Record<string, number>
): FeatureMap => {
    const feats: FeatureMap = {}
    const idx = COCO_17_INDICES
    const thr = (name: string): number => jointMinConfidence[name] ?? minConfidence

    const sternum = getMidShoulder(nkpts)
    if (sternum[2] >= minConfidence) {
        feats.sternum_y = sternum[1]
    }

    const hip = getMidHip(nkpts)
    if (hip[2] >= minConfidence) {
        feats.hip_y = hip[1]
    }

    if (nkpts[idx.left_knee][2] >= thr('left_knee')) {
        feats.left_knee_y = nkpts[idx.left_knee][1]
    }
    if (nkpts[idx.right_knee][2] >= thr('right_knee')) {
        feats.right_knee_y = nkpts[idx.right_knee][1]
    }
    if (nkpts[idx.left_hip][2] >= thr('left_hip')) {
        feats.left_hip_y = nkpts[idx.left_hip][1]
    }
    if (nkpts[idx.right_hip][2] >= thr('right_hip')) {
        feats.right_hip_y = nkpts[idx.right_hip][1]
    }

    return feats
}

