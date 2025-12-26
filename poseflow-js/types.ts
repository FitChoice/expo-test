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
    // Number of complete phases (Top->Top) required to count one rep
    // For compound exercises (e.g., left+right lunge), set to 2
    phases_per_rep?: number
    // Threshold (0-1) for detecting partial ROM on down phase (Down->Bottom)
    // If user reaches this % of depth but doesn't complete transition, it's flagged
    partial_rom_threshold_down?: number
    // Threshold (0-1) for detecting partial ROM on up phase (Up->Top)
    // If user reaches this % of height but doesn't complete transition, it's flagged
    partial_rom_threshold_up?: number
}

/**
 * Event for incomplete range of motion (partial amplitude).
 * Detected when user almost reaches a threshold but doesn't cross it.
 * Can be triggered for both down phase (Down->Bottom) and up phase (Up->Top).
 */
export interface PartialROMEvent {
    // Type of partial ROM: "down" (didn't reach Bottom) or "up" (didn't reach Top)
    phase_type: 'down' | 'up'
    // Percentage of required depth/height achieved (0.0 - 1.0)
    depth_achieved: number
    // Actual axis value reached (min for down, max for up)
    axis_value: number
    // Required threshold (bottom_enter for down, top_enter for up)
    required_threshold: number
    // How much was missing to reach the threshold
    deficit: number
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
    // Partial ROM event if detected (incomplete amplitude)
    partialRom: PartialROMEvent | null
    traceback: string // placeholder for downstream exercise diagnostics
}

export interface EngineTelemetry extends EngineStep {
    exercise: string
}

