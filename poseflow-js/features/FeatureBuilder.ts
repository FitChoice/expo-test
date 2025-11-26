import type { FeatureMap, NormalizedKeypoints } from '../types'
import { computeAngles } from './angles'
import { computeHeights } from './heights'
import { computeProgressAxes } from './axes'
import { computeSymmetry, computeYaw } from './symmetryYaw'

const cloneFeatures = (feats: FeatureMap): FeatureMap => ({ ...feats })

export class FeatureBuilder {
    private readonly minConfidence: number
    private readonly jointMinConfidence: Record<string, number>
    private readonly historySize: number
    private readonly smoothingAlpha: number
    private featureHistory: FeatureMap[] = []
    private velocityHistory: FeatureMap[] = []

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

