/**
 * Keypoint imputation from history with exponential decay.
 * 
 * When keypoints are missing (low confidence), attempts to restore them
 * from recent history with decaying confidence. This reduces skeleton
 * "flicker" when joints temporarily disappear.
 * 
 * Ported from Python: src/poseflow/keypoint_imputer.py
 */
import type { NormalizedKeypoints } from './types'
import { COCO_17_INDICES } from './cocoIndices'

// Segment definitions for validation (hip->knee->ankle chains)
const SEGMENTS: Array<[string, string, string]> = [
    ['left_hip', 'left_knee', 'left_ankle'],
    ['right_hip', 'right_knee', 'right_ankle'],
]

export interface ImputerConfig {
    /** Confidence threshold for considering keypoint as missing */
    threshold: number
    /** Exponential decay factor per frame (0.85 = 15% decay per frame) */
    decayFactor: number
    /** Additional confidence penalty for imputed keypoints */
    missingPenalty: number
    /** Maximum confidence cap after decay */
    decayCap: number
    /** Number of frames to keep in history */
    historySize: number
    /** (min, max) multiplier for segment length validation */
    segmentBounds: [number, number]
    /** Multiplier for detecting speed spikes (reject imputation if exceeded) */
    speedSpikeMult: number
}

const DEFAULT_CONFIG: ImputerConfig = {
    threshold: 0.27,
    decayFactor: 0.85,
    missingPenalty: 0.02,
    decayCap: 0.5,
    historySize: 30,
    segmentBounds: [0.6, 1.4],
    speedSpikeMult: 1.5,
}

/**
 * Impute missing keypoints from history with exponential decay
 * and segment length constraints.
 * 
 * Designed for exercises where distal joints (knees, ankles) may
 * frequently disappear due to occlusion or camera angle.
 */
export class KeypointImputer {
    private readonly config: ImputerConfig
    private history: Array<{ keypoints: NormalizedKeypoints; frameIdx: number }> = []
    private frameIdx = 0

    constructor(config?: Partial<ImputerConfig>) {
        this.config = { ...DEFAULT_CONFIG, ...config }
    }

    /**
     * Impute missing keypoints from history.
     * Returns keypoints with imputed values where applicable.
     */
    impute(keypoints: NormalizedKeypoints): NormalizedKeypoints {
        if (!keypoints.length || keypoints.length !== 17) {
            return keypoints
        }

        // Clone to avoid mutating input
        const result: NormalizedKeypoints = keypoints.map(
            kp => [...kp] as [number, number, number]
        )

        // Find missing keypoints (confidence < threshold)
        const missingIndices: number[] = []
        for (let i = 0; i < result.length; i++) {
            if (result[i][2] < this.config.threshold) {
                missingIndices.push(i)
            }
        }

        // If all keypoints valid, just update history and return
        if (missingIndices.length === 0) {
            this.pushHistory(result)
            return result
        }

        // Try to impute each missing keypoint
        let imputedCount = 0
        for (const idx of missingIndices) {
            const imputed = this.tryImpute(result, idx)
            if (imputed) {
                result[idx] = imputed
                imputedCount++
            }
        }

        // Update history with (potentially imputed) result
        this.pushHistory(result)

        return result
    }

    /**
     * Try to impute a single keypoint from history.
     * Returns imputed keypoint or null if not possible.
     */
    private tryImpute(
        currentKeypoints: NormalizedKeypoints,
        idx: number
    ): [number, number, number] | null {
        // Find last valid keypoint in history
        let lastValid: [number, number, number] | null = null
        let framesAgo = 0

        for (let i = this.history.length - 1; i >= 0; i--) {
            const histEntry = this.history[i]
            const histKp = histEntry.keypoints[idx]
            
            if (histKp[2] >= this.config.threshold) {
                lastValid = [...histKp] as [number, number, number]
                framesAgo = this.frameIdx - histEntry.frameIdx
                break
            }
        }

        if (!lastValid) {
            return null
        }

        // Apply exponential decay to confidence
        const decayFactor = Math.pow(this.config.decayFactor, framesAgo)
        let decayedConf = lastValid[2] * decayFactor * (1 - this.config.missingPenalty)
        decayedConf = Math.min(decayedConf, this.config.decayCap)

        // Position from history (no decay for position)
        const imputedPos: [number, number] = [lastValid[0], lastValid[1]]

        // Check for speed spike (reject if movement too fast)
        if (this.checkSpeedSpike(idx, imputedPos)) {
            return null
        }

        // Create temporary keypoints to validate segment lengths
        const tempKeypoints: NormalizedKeypoints = currentKeypoints.map(
            kp => [...kp] as [number, number, number]
        )
        tempKeypoints[idx] = [imputedPos[0], imputedPos[1], decayedConf]

        // Validate segment lengths
        if (!this.validateSegmentLengths(tempKeypoints, idx)) {
            return null
        }

        return [imputedPos[0], imputedPos[1], decayedConf]
    }

    /**
     * Check if imputed position would create a speed spike.
     * Returns true if spike detected (should reject imputation).
     */
    private checkSpeedSpike(idx: number, imputedPos: [number, number]): boolean {
        if (this.history.length < 2) {
            return false
        }

        // Find last valid position from history
        let lastValidPos: [number, number] | null = null
        for (let i = this.history.length - 1; i >= 0; i--) {
            const kp = this.history[i].keypoints[idx]
            if (kp[2] >= this.config.threshold) {
                lastValidPos = [kp[0], kp[1]]
                break
            }
        }

        if (!lastValidPos) {
            return false
        }

        // Calculate speed (distance per frame)
        const dx = imputedPos[0] - lastValidPos[0]
        const dy = imputedPos[1] - lastValidPos[1]
        const speed = Math.hypot(dx, dy)

        // Get median speed from history
        const speeds: number[] = []
        let prevPos = lastValidPos

        for (let i = this.history.length - 2; i >= 0; i--) {
            const kp = this.history[i].keypoints[idx]
            if (kp[2] >= this.config.threshold) {
                const currPos: [number, number] = [kp[0], kp[1]]
                const spd = Math.hypot(prevPos[0] - currPos[0], prevPos[1] - currPos[1])
                speeds.push(spd)
                prevPos = currPos
            }
        }

        if (speeds.length === 0) {
            return false
        }

        // Calculate median
        speeds.sort((a, b) => a - b)
        const medianSpeed = speeds[Math.floor(speeds.length / 2)]

        // Check for spike
        if (medianSpeed > 0 && speed > medianSpeed * this.config.speedSpikeMult) {
            return true
        }

        return false
    }

    /**
     * Validate that imputed keypoint doesn't violate segment length constraints.
     * Checks hip->knee and knee->ankle segment lengths against historical medians.
     */
    private validateSegmentLengths(keypoints: NormalizedKeypoints, imputedIdx: number): boolean {
        const idx = COCO_17_INDICES

        for (const [hipName, kneeName, ankleName] of SEGMENTS) {
            const hipIdx = idx[hipName]
            const kneeIdx = idx[kneeName]
            const ankleIdx = idx[ankleName]

            if (imputedIdx === kneeIdx) {
                // Validate hip->knee and knee->ankle segments
                const hipKneeLen = this.getSegmentLength(keypoints, hipIdx, kneeIdx)
                const kneeAnkleLen = this.getSegmentLength(keypoints, kneeIdx, ankleIdx)

                if (hipKneeLen === null || kneeAnkleLen === null) {
                    continue
                }

                // Get median lengths from history
                const hipKneeLengths: number[] = []
                const kneeAnkleLengths: number[] = []

                for (const histEntry of this.history) {
                    const hkLen = this.getSegmentLength(histEntry.keypoints, hipIdx, kneeIdx)
                    const kaLen = this.getSegmentLength(histEntry.keypoints, kneeIdx, ankleIdx)
                    if (hkLen !== null) hipKneeLengths.push(hkLen)
                    if (kaLen !== null) kneeAnkleLengths.push(kaLen)
                }

                if (hipKneeLengths.length === 0 || kneeAnkleLengths.length === 0) {
                    continue
                }

                const medianHK = this.median(hipKneeLengths)
                const medianKA = this.median(kneeAnkleLengths)

                const [minMult, maxMult] = this.config.segmentBounds
                if (hipKneeLen < medianHK * minMult || hipKneeLen > medianHK * maxMult) {
                    return false
                }
                if (kneeAnkleLen < medianKA * minMult || kneeAnkleLen > medianKA * maxMult) {
                    return false
                }
            } else if (imputedIdx === ankleIdx) {
                // Validate knee->ankle segment only
                const kneeAnkleLen = this.getSegmentLength(keypoints, kneeIdx, ankleIdx)
                if (kneeAnkleLen === null) {
                    continue
                }

                const kneeAnkleLengths: number[] = []
                for (const histEntry of this.history) {
                    const len = this.getSegmentLength(histEntry.keypoints, kneeIdx, ankleIdx)
                    if (len !== null) kneeAnkleLengths.push(len)
                }

                if (kneeAnkleLengths.length === 0) {
                    continue
                }

                const medianKA = this.median(kneeAnkleLengths)
                const [minMult, maxMult] = this.config.segmentBounds

                if (kneeAnkleLen < medianKA * minMult || kneeAnkleLen > medianKA * maxMult) {
                    return false
                }
            }
        }

        return true
    }

    /**
     * Calculate segment length between two keypoints.
     * Returns null if either keypoint has low confidence.
     */
    private getSegmentLength(
        keypoints: NormalizedKeypoints,
        idx1: number,
        idx2: number
    ): number | null {
        const kp1 = keypoints[idx1]
        const kp2 = keypoints[idx2]

        if (kp1[2] < this.config.threshold || kp2[2] < this.config.threshold) {
            return null
        }

        const dx = kp2[0] - kp1[0]
        const dy = kp2[1] - kp1[1]
        return Math.hypot(dx, dy)
    }

    /**
     * Calculate median of array.
     */
    private median(values: number[]): number {
        if (values.length === 0) return 0
        const sorted = [...values].sort((a, b) => a - b)
        const mid = Math.floor(sorted.length / 2)
        return sorted.length % 2 !== 0
            ? sorted[mid]
            : (sorted[mid - 1] + sorted[mid]) / 2
    }

    /**
     * Add keypoints to history.
     */
    private pushHistory(keypoints: NormalizedKeypoints): void {
        this.history.push({
            keypoints: keypoints.map(kp => [...kp] as [number, number, number]),
            frameIdx: this.frameIdx,
        })
        this.frameIdx++

        // Trim history to max size
        if (this.history.length > this.config.historySize) {
            this.history.shift()
        }
    }

    /**
     * Reset imputer state (clear history).
     */
    reset(): void {
        this.history = []
        this.frameIdx = 0
    }
}
