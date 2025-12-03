/**
 * Shared types for the in-app PoseFlow port.
 * Keep this file tiny so the rest of the modules can import from a single place.
 */
export type RawKeypoint = {
    x: number
    y: number
    score?: number
    name?: string
}

export type NormalizedKeypoint = [number, number, number]
export type NormalizedKeypoints = NormalizedKeypoint[]

export type FeatureMap = Record<string, number>

export interface ExerciseRule {
    exercise: string
    axis: string
    thresholds: {
        down_enter: number
        bottom_enter: number
        up_enter: number
        top_enter: number
        min_dwell_ms?: number
    }
    hysteresis?: number
    anti_yaw_max?: number
}

export interface EngineConfig {
    fps: number
    minConfidence: number
    historySize: number
    smoothing: {
        method: 'ema' | 'oneeuro' | 'none'
        alpha?: number
        windowMs?: number
        minCutoff?: number
        beta?: number
        dCutoff?: number
    }
}

export interface EngineStep {
    phase: string
    reps: number
    axis: number | null
    yawRejected: boolean
    frameDropped: boolean
    transitionRecovered: boolean
    traceback: string // placeholder for downstream exercise diagnostics
}

export interface EngineTelemetry extends EngineStep {
    exercise: string
}

