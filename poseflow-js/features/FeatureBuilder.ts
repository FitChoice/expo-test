import type { FeatureMap, NormalizedKeypoints } from '../types'
import { computeAngles } from './angles'
import { computeHeights } from './heights'
import { computeProgressAxes } from './axes'
import { computeSymmetry, computeYaw } from './symmetryYaw'

const cloneFeatures = (feats: FeatureMap): FeatureMap => ({ ...feats })

// Patterns for axis features that should be smoothed
// These are the main movement indicators fed to the FSM
const AXIS_SMOOTHING_PATTERNS = [
    'depth',      // squat_depth, pushup_depth, etc.
    'angle',      // squat_knee_angle, hip_extension_angle, etc.
    'extension',  // quadruped_hip_extension_*, etc.
    'distance',   // leg_abduction_distance_*, arm_spread_distance, etc.
    'lean',       // torso_lean_angle
    'height',     // wrist_height, elbow_height, etc.
    'progress',   // calf_raise_progress, etc.
    'spread',     // arm_spread_*, etc.
    'width',      // stance_width_*, etc.
    'ratio',      // stance_width_ratio, arm_spread_ratio, etc.
    'lift',       // thigh_lift_ratio, side_lying_leg_lift
]

export class FeatureBuilder {
    private readonly minConfidence: number
    private readonly jointMinConfidence: Record<string, number>
    private readonly historySize: number
    private readonly smoothingAlpha: number
    private featureHistory: FeatureMap[] = []
    private velocityHistory: FeatureMap[] = []

    // Axis smoothing state (EMA for key movement axes)
    // This reduces jitter in the FSM input signal
    private axisSmoothingState: FeatureMap = {}
    private readonly axisSmoothingAlpha = 0.4  // Lower = more smoothing

    constructor({
        minConfidence,
        historySize,
        smoothingAlpha,
        jointMinConfidence,
    }: {
        minConfidence: number
        historySize: number
        smoothingAlpha: number
        jointMinConfidence: Record<string, number>
    }) {
        this.minConfidence = minConfidence
        this.historySize = historySize
        this.smoothingAlpha = smoothingAlpha
        this.jointMinConfidence = jointMinConfidence
    }

    compute(nkpts: NormalizedKeypoints, dt: number): FeatureMap {
        if (!nkpts.length) return {}
        const feats: FeatureMap = {}

        // Angles first, other blocks reuse them.
        const angles = computeAngles(nkpts, this.minConfidence, this.jointMinConfidence)
        Object.assign(feats, angles)

        const heights = computeHeights(nkpts, this.minConfidence, this.jointMinConfidence)
        Object.assign(feats, heights)

        const axes = computeProgressAxes(nkpts, feats, angles, this.minConfidence, this.jointMinConfidence)
        Object.assign(feats, axes)

        const symmetry = computeSymmetry(feats)
        Object.assign(feats, symmetry)

        const yaw = computeYaw(nkpts, this.minConfidence)
        Object.assign(feats, yaw)

        // Apply EMA smoothing to axis features before FSM.
        // This reduces jitter in the main movement indicators.
        this.smoothAxisFeatures(feats)

        // Temporal derivatives help with tempo/speed checks and hysteresis tuning.
        const velocities = this.computeVelocities(feats, dt)
        Object.assign(feats, velocities)

        const accelerations = this.computeAccelerations(velocities, dt)
        Object.assign(feats, accelerations)

        this.pushHistory(this.featureHistory, cloneFeatures(feats))
        if (Object.keys(velocities).length) {
            this.pushHistory(this.velocityHistory, cloneFeatures(velocities))
        }

        return feats
    }

    reset(): void {
        this.featureHistory = []
        this.velocityHistory = []
        this.axisSmoothingState = {}
    }

    /**
     * Apply EMA smoothing to axis-related features.
     * This reduces jitter in the values fed to the FSM.
     * Only smooths features matching AXIS_SMOOTHING_PATTERNS.
     */
    private smoothAxisFeatures(feats: FeatureMap): void {
        for (const key of Object.keys(feats)) {
            // Check if this feature should be smoothed
            const shouldSmooth = AXIS_SMOOTHING_PATTERNS.some(pattern => key.includes(pattern))
            if (!shouldSmooth) continue

            const rawValue = feats[key]

            // Initialize state if first occurrence
            if (!(key in this.axisSmoothingState)) {
                this.axisSmoothingState[key] = rawValue
                continue
            }

            // Apply EMA: smoothed = alpha * raw + (1 - alpha) * prev
            const smoothed =
                this.axisSmoothingAlpha * rawValue +
                (1 - this.axisSmoothingAlpha) * this.axisSmoothingState[key]

            this.axisSmoothingState[key] = smoothed
            feats[key] = smoothed
        }
    }

    private computeVelocities(current: FeatureMap, dt: number): FeatureMap {
        if (!this.featureHistory.length) return {}
        const prev = this.featureHistory[this.featureHistory.length - 1]
        const velocities: FeatureMap = {}

        Object.keys(current).forEach((key) => {
            if (key in prev) {
                const raw = (current[key] - prev[key]) / dt
                const velKey = `${key}_velocity`
                const lastVel = this.velocityHistory.length ? this.velocityHistory[this.velocityHistory.length - 1][velKey] : undefined
                velocities[velKey] = lastVel !== undefined ? this.smoothingAlpha * raw + (1 - this.smoothingAlpha) * lastVel : raw
            }
        })

        return velocities
    }

    private computeAccelerations(velocities: FeatureMap, dt: number): FeatureMap {
        if (!this.velocityHistory.length) return {}
        const prev = this.velocityHistory[this.velocityHistory.length - 1]
        const acc: FeatureMap = {}

        Object.keys(velocities).forEach((key) => {
            if (key in prev) {
                const base = key.replace('_velocity', '')
                acc[`${base}_acceleration`] = (velocities[key] - prev[key]) / dt
            }
        })

        return acc
    }

    private pushHistory(history: FeatureMap[], item: FeatureMap): void {
        history.push(item)
        if (history.length > this.historySize) {
            history.shift()
        }
    }
}

