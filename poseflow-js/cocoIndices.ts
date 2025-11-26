/**
 * COCO index helpers rewritten in TS.
 * Only the handful of helpers required by the engine are ported.
 */
import type { NormalizedKeypoints } from './types'

export const COCO_17_INDICES: Record<string, number> = {
    nose: 0,
    left_eye: 1,
    right_eye: 2,
    left_ear: 3,
    right_ear: 4,
    left_shoulder: 5,
    right_shoulder: 6,
    left_elbow: 7,
    right_elbow: 8,
    left_wrist: 9,
    right_wrist: 10,
    left_hip: 11,
    right_hip: 12,
    left_knee: 13,
    right_knee: 14,
    left_ankle: 15,
    right_ankle: 16,
}

type PointTuple = [number, number, number]

const safeGet = (kpts: NormalizedKeypoints, name: string): PointTuple => {
    const idx = COCO_17_INDICES[name]
    return kpts[idx] ?? [0, 0, 0]
}

const averagePoints = (a: PointTuple, b: PointTuple): PointTuple => {
    return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]
}

export const getMidHip = (kpts: NormalizedKeypoints): PointTuple => {
    return averagePoints(safeGet(kpts, 'left_hip'), safeGet(kpts, 'right_hip'))
}

export const getMidShoulder = (kpts: NormalizedKeypoints): PointTuple => {
    return averagePoints(safeGet(kpts, 'left_shoulder'), safeGet(kpts, 'right_shoulder'))
}

