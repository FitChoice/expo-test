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
	states?: string[],
	rep_on_transition?: string
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

    // === NEW: Range Error Lines ===
    // Simple visual threshold lines for detecting amplitude errors.
    // More intuitive than the old percentage-based partial ROM detection.
    range_error_lines?: RangeErrorLine[]

    // === LEGACY: Partial ROM thresholds (0-1) ===
    // Kept for backward compatibility. New UI uses range_error_lines instead.
    // Detect incomplete range of motion for different transitions.
    // Threshold = minimum % of range required. Error if achieved >= threshold but < 100%.
    // Set to null/undefined to disable detection for that transition.

    // Down->Up transition (returned up without reaching Bottom)
    // Range: from down_enter to bottom_enter
    partial_rom_threshold_down_up?: number | null

    // Up->Down transition (returned down without reaching Top)
    // Range: from up_enter to top_enter
    partial_rom_threshold_up_down?: number | null

    // Down->Bottom transition (reached Bottom, check depth quality)
    // Range: from down_enter to bottom_enter (checks if went deep enough)
    partial_rom_threshold_down_bottom?: number | null

    // Up->Top transition (reached Top, check extension quality)
    // Range: from up_enter to top_enter (checks if extended enough)
    partial_rom_threshold_up_top?: number | null
}

/**
 * Event for incomplete range of motion (partial amplitude).
 * Triggered when user doesn't achieve the minimum required % for a transition.
 *
 * Four transition types:
 * - down_up: Down->Up without reaching Bottom (incomplete descent)
 * - up_down: Up->Down without reaching Top (incomplete ascent)
 * - down_bottom: Down->Bottom but shallow depth (quality check)
 * - up_top: Up->Top but incomplete extension (quality check)
 */
export interface PartialROMEvent {
    // Transition type that triggered partial ROM
    phase_type: 'down_up' | 'up_down' | 'down_bottom' | 'up_top'
    // Percentage of range actually achieved (0.0 - 1.0)
    depth_achieved: number
    // Actual axis value reached (min for down, max for up)
    axis_value: number
    // Required threshold value (bottom_enter or top_enter)
    required_threshold: number
    // How much was missing to reach the threshold
    deficit: number
}

/**
 * Axis extremum event (peak / valley) produced by the FSM.
 *
 * Why this exists:
 * - We want to trigger range_error_lines checks ONLY on meaningful FSM transitions.
 * - This prevents UI spam when the user is holding still or moving very slowly.
 *
 * Semantics:
 * - `pointType` tells whether it is a peak (top) or a valley (bottom).
 * - `axisValue` is the actual min/max value observed during the phase.
 * - The event is edge-triggered: produced once and then cleared on the next step.
 */
export interface AxisExtremumEvent {
    pointType: 'peak' | 'valley'
    axisValue: number
}

// === New Range Error System ===
// Simple visual threshold lines for detecting amplitude errors.
// More intuitive than percentage-based partial ROM detection.

/**
 * Type of range error check.
 * - min_valley: valleys (bottom points) must go BELOW this line. Error: "Не досел"
 * - max_valley: valleys must NOT go BELOW this line. Error: "Слишком глубоко"
 * - min_peak: peaks (top points) must go ABOVE this line. Error: "Не довстал"
 * - max_peak: peaks must NOT go ABOVE this line. (for specific exercises)
 */
export type RangeErrorType = 'min_valley' | 'max_valley' | 'min_peak' | 'max_peak'

/**
 * Single error threshold line.
 * User can add multiple lines to check different error conditions.
 *
 * Example for squat:
 * - { type: 'min_peak', value: 95, label: 'Не довстал' }
 * - { type: 'min_valley', value: 25, label: 'Не досел' }
 * - { type: 'max_valley', value: 10, label: 'Слишком глубоко' }
 */
export interface RangeErrorLine {
    // Unique identifier used by the UI (for editing/deleting lines).
    // Optional because saved JSON configs may omit it (we generate IDs on load).
    value: number
    // Type of check (what should be above/below this line)
    type: RangeErrorType
    // User-friendly label shown on errors (e.g., "Не досел", "Слишком глубоко")
    label: string
    // Optional custom color (hex). Defaults based on type.
    color?: string
}

/**
 * Detected error when a peak/valley violates a RangeErrorLine.
 */
export interface RangeError {
    // The line that was violated
    line: RangeErrorLine
    // Frame index where error occurred
    frameIndex: number
    // Actual value at error point
    actualValue: number
    // Whether it was a peak or valley that violated the line
    pointType: 'peak' | 'valley'
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
    // Axis extremum event from FSM transitions (peak/valley), edge-triggered
    extremum: AxisExtremumEvent | null
    traceback: string // placeholder for downstream exercise diagnostics
}

export interface EngineTelemetry extends EngineStep {
    exercise: string
}
