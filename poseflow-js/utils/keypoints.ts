import { COCO_17_INDICES } from '../cocoIndices'
import type { NormalizedKeypoints, RawKeypoint } from '../types'

const EMPTY_KEYPOINT: [number, number, number] = [0, 0, 0]

/**
 * Converts detector keypoints into the fixed COCO-17 order.
 * Falls back to the incoming array order when keypoint names are absent.
 */
export const toCocoKeypoints = (keypoints: RawKeypoint[]): NormalizedKeypoints => {
    const result: NormalizedKeypoints = Array.from({ length: 17 }, () => [...EMPTY_KEYPOINT])

    keypoints.forEach((kp, idx) => {
        const score = kp.score ?? 0
        const payload: [number, number, number] = [kp.x, kp.y, score]
        if (kp.name && kp.name in COCO_17_INDICES) {
            result[COCO_17_INDICES[kp.name]] = payload
        } else if (idx < result.length) {
            result[idx] = payload
        }
    })

    return result
}

