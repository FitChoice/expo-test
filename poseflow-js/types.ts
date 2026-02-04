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

// ========== Posture Guard Types ==========
// Posture detection helps reject frames where user is in wrong position for exercise.

/**
 * Body posture type for exercise validation.
 * - standing: Upright position, torso vertical
 * - lying: Horizontal on back or stomach
 * - side_lying: Lying on side (shoulders stacked vertically)
 * - quadruped: On all fours (hands and knees)
 * - sitting: Seated position, torso vertical
 * - unknown: Cannot determine posture
 */
export type PostureType = 'standing' | 'lying' | 'side_lying' | 'quadruped' | 'sitting' | 'unknown'

/**
 * Result of posture detection.
 */
export interface PostureResult {
    posture: PostureType
    confidence: number
}

// ========== Multi-Axis FSM Types ==========
// Support for combining multiple progress axes for rep counting.

/**
 * Thresholds for FSM state transitions.
 * Used both in single-axis and multi-axis modes.
 */
export interface FSMThresholds {
    down_enter: number
    bottom_enter: number
    up_enter: number
    top_enter: number
    min_dwell_ms?: number
}

/**
 * Configuration for a single axis in Multi-Axis mode.
 * Each axis has its own thresholds and FSM instance.
 */
export interface AxisConfig {
    // Axis name (e.g., "squat_knee_angle_inv", "hip_extension_angle")
    name: string
    // Individual thresholds for this axis
    thresholds: FSMThresholds
    // Hysteresis to prevent state oscillation
    hysteresis?: number
    // Range error lines for this specific axis
    range_error_lines?: RangeErrorLine[]
    // Invert axis values (1 - value). Used for anti-phase axes in compound exercises.
    // When true, Top becomes Bottom and vice versa, allowing sync of opposing movements.
    inverted?: boolean
}

/**
 * Modes for combining multiple axes.
 * - AND: Rep counted when ALL axes complete a cycle (within sync window)
 * - OR: Rep counted when ANY axis completes a cycle
 * - PRIMARY: Rep counted when primary axis completes; others validate quality
 */
export type AxisCombineMode = 'AND' | 'OR' | 'PRIMARY'

/**
 * Configuration for Multi-Axis FSM.
 * Allows multiple progress axes to be combined for rep counting.
 */
export interface MultiAxisConfig {
    // Array of axis configurations (minimum 1)
    axes: AxisConfig[]
    // How to combine axes for counting reps
    combineMode: AxisCombineMode
    // Index of primary axis (for PRIMARY mode). Default: 0
    primaryAxisIndex?: number
    // Time window (ms) for synchronization (for AND/OR modes).
    // All axes must complete within this window for AND mode.
    // Default: 500ms
    syncWindowMs?: number
    // === Reference timing from calibration ===
    // Average time in milliseconds to complete one repetition.
    avg_rep_ms?: number
    // === Timing Error Detection ===
    // Configuration for detecting reps that are too fast or too slow.
    timing_error?: TimingErrorConfig
}

/**
 * State of a single axis FSM in multi-axis context.
 */
export interface SingleAxisState {
    axisName: string
    phase: 'Top' | 'Down' | 'Bottom' | 'Up'
    axisValue: number | null
    lastTopTime: number | null  // Timestamp when last reached Top
    cycleComplete: boolean      // True if completed a full cycle since last count
}

/**
 * Combined state from MultiAxisFSM.
 */
export interface MultiAxisState {
    axes: SingleAxisState[]
    combinedPhase: string       // Human-readable combined phase
    reps: number
    repIncrement: number        // 1 if rep was just counted, 0 otherwise
    syncStatus: 'synced' | 'partial' | 'none'  // Sync state for UI feedback
    // Timing error event if detected (rep too fast or too slow)
    timingError?: TimingErrorEvent | null
}

export interface ExerciseRule {
    exercise: string
    // === Legacy single-axis mode (for backward compatibility) ===
    axis?: string
    thresholds?: FSMThresholds
    hysteresis?: number
    anti_yaw_max?: number
    // Number of complete phases (Top->Top) required to count one rep
    // For compound exercises (e.g., left+right lunge), set to 2
    phases_per_rep?: number

    // === NEW: Multi-Axis mode ===
    // When set, uses MultiAxisFSM instead of single RepCounterFSM.
    // Takes precedence over single-axis fields above.
    multiAxis?: MultiAxisConfig

    // === Reference timing from calibration ===
    // Average time in milliseconds to complete one repetition.
    // Measured from reference video during calibration.
    // Used to evaluate if user performs exercise too fast or too slow.
    avg_rep_ms?: number

    // === Timing Error Detection ===
    // Configuration for detecting reps that are too fast or too slow.
    // Uses avg_rep_ms as the reference baseline.
    timing_error?: TimingErrorConfig

    // === Posture Guard (Level 1 Robustness) ===
    // Required body posture for this exercise.
    // If set, frames where detected posture doesn't match will be rejected.
    posture?: PostureType
    // Minimum confidence required for posture detection (0-1). Default: 0.6
    // Lower values are more permissive (accept less confident detections).
    posture_tolerance?: number

    // === NEW: Range Error Lines ===
    // Simple visual threshold lines for detecting amplitude errors.
    // More intuitive than the old percentage-based partial ROM detection.
    // Note: In multi-axis mode, use range_error_lines in each AxisConfig instead.
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
    id?: string
    // Threshold value on the axis
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

// === Timing Error System ===
// Detects when user performs exercise too fast or too slow
// compared to reference timing from calibration.

/**
 * Configuration for timing-based error detection.
 * Uses percentage deviation from average rep time (avg_rep_ms).
 *
 * Example config for a squat:
 * {
 *   slow_threshold_pct: 50,     // Error if > 50% slower than avg
 *   slow_message: "Слишком медленно! Держите темп",
 *   fast_threshold_pct: 40,     // Error if > 40% faster than avg
 *   fast_message: "Слишком быстро! Контролируйте движение"
 * }
 */
export interface TimingErrorConfig {
    // Percentage threshold for "too slow" error.
    // If actual time > avg_rep_ms * (1 + slow_threshold_pct/100), show slow error.
    // Example: 50 means error if rep takes > 1.5x the average time.
    // Set to null/undefined to disable slow detection.
    slow_threshold_pct?: number | null
    // Message to display when rep is too slow.
    slow_message?: string
    // Percentage threshold for "too fast" error.
    // If actual time < avg_rep_ms * (1 - fast_threshold_pct/100), show fast error.
    // Example: 40 means error if rep takes < 0.6x the average time.
    // Set to null/undefined to disable fast detection.
    fast_threshold_pct?: number | null
    // Message to display when rep is too fast.
    fast_message?: string
}

/**
 * Timing error event emitted when rep duration deviates from reference.
 * Triggered after a rep is completed (Top->...->Top cycle).
 */
export interface TimingErrorEvent {
    // Type of timing error
    type: 'too_slow' | 'too_fast'
    // User-friendly message to display
    message: string
    // Actual rep duration in milliseconds
    actual_ms: number
    // Expected average duration from config
    expected_ms: number
    // Percentage deviation from expected
    // Positive = slower, Negative = faster
    deviation_pct: number
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
    // Timing error event if detected (rep too fast or too slow)
    timingError: TimingErrorEvent | null
    // Posture Guard: detected posture and whether it was rejected
    detectedPosture?: PostureType
    postureRejected?: boolean
    traceback: string // placeholder for downstream exercise diagnostics

    // === Body Ready State ===
    // True when all body keypoints (excluding face) are visible.
    // Before this is true, FSM tracking is paused to prevent false positives.
    bodyReady?: boolean

    // === Multi-Axis mode fields ===
    // Present only when using MultiAxisFSM
    multiAxisState?: MultiAxisState
}

export interface EngineTelemetry extends EngineStep {
    exercise: string
}
