import { PoseNormalizer } from './normalizer'
import { EMASmoother, OneEuroFilter, PostureSmoother, type Smoother } from './smoothers'
import { FeatureBuilder } from './features/FeatureBuilder'
import { RepCounterFSM, type FSMParams } from './fsm/RepCounterFSM'
import { MultiAxisFSM } from './fsm/MultiAxisFSM'
import { toCocoKeypoints } from './utils/keypoints'
import { KeypointImputer } from './KeypointImputer'
import { computePosture } from './features/axes'
import type {
    EngineConfig,
    EngineTelemetry,
    ExerciseRule,
    RawKeypoint,
    MultiAxisConfig,
    FSMThresholds,
} from './types'

// Minimum visible keypoints required for reliable processing.
// Below this threshold, frames are dropped to avoid false positives.
const MIN_VISIBLE_KEYPOINTS = 10

// Body keypoint indices (COCO format) - excludes face (0-4).
// Required for "body ready" check before tracking starts.
// Indices: 5-6 shoulders, 7-8 elbows, 9-10 wrists, 11-12 hips, 13-14 knees, 15-16 ankles
const BODY_KEYPOINT_INDICES = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]

// Default runtime knobs are intentionally conservative so the app behaves like the Python prototype.
const DEFAULT_CONFIG: EngineConfig = {
    fps: 30,
    minConfidence: 0.3,
    historySize: 10,
    smoothing: {
        method: 'ema',
        alpha: 0.4,
        windowMs: 300,
        minCutoff: 1.2,
        beta: 0.012,
        dCutoff: 1.0,
    },
}

const DEFAULT_TRACEBACK = 'OK' // placeholder error channel for future form diagnostics

/**
 * Mirrors the Python Orchestrator but assumes keypoints are already detected on-device.
 * The class keeps small stateful components so we can reuse them for every frame.
 */
export class ExerciseEngine {
    private rule: ExerciseRule
    private readonly config: EngineConfig
    private readonly normalizer: PoseNormalizer
    private smoother: Smoother | null
    private readonly imputer: KeypointImputer
    private readonly features: FeatureBuilder
    // FSM can be either single-axis or multi-axis
    private fsm: RepCounterFSM | MultiAxisFSM
    private isMultiAxisMode: boolean = false

    // Body ready state: becomes true when all body keypoints (except face) are visible.
    // This prevents false rep counting when user hasn't fully entered the frame yet.
    // Once true, stays true until reset() is called.
    private bodyReady: boolean = false

    // Posture smoother: temporal smoothing for posture detection.
    // Reduces flickering by using majority vote over sliding window.
    private readonly postureSmoother: PostureSmoother

    constructor(rule: ExerciseRule, config?: Partial<EngineConfig>) {
        this.rule = rule
        this.config = { ...DEFAULT_CONFIG, ...config, smoothing: { ...DEFAULT_CONFIG.smoothing, ...(config?.smoothing ?? {}) } }
        this.normalizer = new PoseNormalizer(this.config.minConfidence)
        // Smoother stays optional because seated exercises may prefer raw data.
        this.smoother = this.buildSmoother()
        // Imputer restores missing keypoints from recent history
        this.imputer = new KeypointImputer({
            threshold: this.config.minConfidence,
            historySize: Math.max(30, this.config.historySize * 3),
        })
        this.features = new FeatureBuilder({
            minConfidence: this.config.minConfidence,
            historySize: this.config.historySize,
            smoothingAlpha: 0.7,
            jointMinConfidence: {},
        })
        // Posture smoother: 7-frame window, need 4 votes to switch (majority + 1)
        // At 30 FPS this is ~230ms window with ~130ms hysteresis
        this.postureSmoother = new PostureSmoother({
            windowSize: 7,
            minVotesToSwitch: 4,
        })
        // Determine if we're in multi-axis mode
        this.isMultiAxisMode = !!(rule.multiAxis && rule.multiAxis.axes.length > 0)
        this.fsm = this.buildFsm()
    }

    updateRule(rule: ExerciseRule) {
        this.rule = rule
        this.isMultiAxisMode = !!(rule.multiAxis && rule.multiAxis.axes.length > 0)
        this.fsm = this.buildFsm()
    }

    /**
     * Update thresholds without resetting FSM state.
     * Useful for live threshold tuning during debugging.
     * Note: In multi-axis mode, use updateMultiAxisConfig instead.
     */
    updateThresholds(thresholds: Partial<FSMThresholds>): void {
        if (this.isMultiAxisMode) {
            console.warn('[ExerciseEngine] updateThresholds called in multi-axis mode. Use updateMultiAxisConfig instead.')
            return
        }

        // Merge with existing thresholds, preserving required fields
        const existingThresholds = this.rule.thresholds ?? {
            down_enter: 0,
            bottom_enter: 0,
            up_enter: 0,
            top_enter: 0,
        }

        this.rule = {
            ...this.rule,
            thresholds: { ...existingThresholds, ...thresholds },
        }
        // Rebuild FSM with new thresholds but preserve rep count
        const currentReps = this.fsm.getReps()
        this.fsm = this.buildFsm()
        this.fsm.setReps(currentReps)
    }

    /**
     * Update multi-axis configuration.
     * Only works in multi-axis mode.
     */
    updateMultiAxisConfig(multiAxis: MultiAxisConfig): void {
        this.rule = { ...this.rule, multiAxis }
        this.isMultiAxisMode = true
        const currentReps = this.fsm.getReps()
        this.fsm = this.buildFsm()
        this.fsm.setReps(currentReps)
    }

    /**
     * Check if engine is in multi-axis mode.
     */
    isMultiAxis(): boolean {
        return this.isMultiAxisMode
    }

    /**
     * Get multi-axis configuration (if in multi-axis mode).
     */
    getMultiAxisConfig(): MultiAxisConfig | undefined {
        return this.rule.multiAxis
    }

    /**
     * Update hysteresis value for FSM transitions.
     */
    updateHysteresis(hysteresis: number): void {
        this.rule = { ...this.rule, hysteresis }
        const currentReps = this.fsm.getReps()
        this.fsm = this.buildFsm()
        this.fsm.setReps(currentReps)
    }

    /**
     * Update partial ROM detection thresholds.
     * Four thresholds for different transitions:
     * - down_up: Down->Up (incomplete descent)
     * - up_down: Up->Down (incomplete ascent)
     * - down_bottom: Down->Bottom (depth quality)
     * - up_top: Up->Top (extension quality)
     * Set to null/undefined to disable detection for that transition.
     */
    updatePartialRomThresholds(thresholds: {
        down_up?: number | null
        up_down?: number | null
        down_bottom?: number | null
        up_top?: number | null
    }): void {
        console.log('[ExerciseEngine] Updating partial ROM thresholds:', {
            down_up: thresholds.down_up,
            up_down: thresholds.up_down,
            down_bottom: thresholds.down_bottom,
            up_top: thresholds.up_top,
        })
        this.rule = {
            ...this.rule,
            partial_rom_threshold_down_up: thresholds.down_up,
            partial_rom_threshold_up_down: thresholds.up_down,
            partial_rom_threshold_down_bottom: thresholds.down_bottom,
            partial_rom_threshold_up_top: thresholds.up_top,
        }
        const currentReps = this.fsm.getReps()
        this.fsm = this.buildFsm()
        this.fsm.setReps(currentReps)
        console.log('[ExerciseEngine] FSM rebuilt with new thresholds')
    }

    /**
     * Get current rule configuration.
     */
    getRule(): ExerciseRule {
        return { ...this.rule }
    }

    reset(): void {
        this.features.reset()
        this.smoother?.reset()
        this.imputer.reset()
        this.fsm.reset()
        // Reset posture smoother to clear history
        this.postureSmoother.reset()
        // Reset body ready state so user must re-enter frame fully
        this.bodyReady = false
    }

    /**
     * Check if body is ready for tracking.
     * Returns true when all body keypoints (excluding face) are visible.
     */
    isBodyReady(): boolean {
        return this.bodyReady
    }

    /**
     * Check if all body keypoints (excluding face) are visible.
     * Body keypoints: shoulders, elbows, wrists, hips, knees, ankles (indices 5-16).
     * Returns true if all body keypoints have confidence >= minConfidence.
     */
    private checkBodyKeypointsVisible(keypoints: RawKeypoint[]): boolean {
        for (const idx of BODY_KEYPOINT_INDICES) {
            const kp = keypoints[idx]
            // Keypoint missing or low confidence = not visible
            if (!kp || (kp.score ?? 0) < this.config.minConfidence) {
                return false
            }
        }
        return true
    }

    process(keypoints: RawKeypoint[] | null | undefined, timestamp?: number): EngineTelemetry {
        if (!keypoints || !keypoints.length) {
            return this.emptyTelemetry()
        }

        // Count visible keypoints BEFORE processing
        const visibleCount = keypoints.filter(
            kp => (kp.score ?? 0) >= this.config.minConfidence
        ).length

        // If too few keypoints visible, skip processing to avoid false positives.
        // This prevents FSM from making bad transitions when skeleton is mostly occluded.
        if (visibleCount < MIN_VISIBLE_KEYPOINTS) {
            return {
                ...this.emptyTelemetry(),
                frameDropped: true,
                // Preserve current rep count so UI doesn't reset
                reps: this.fsm.getReps(),
            }
        }

        // === Body Ready Check ===
        // Before tracking starts, all body keypoints (excluding face) must be visible.
        // This prevents false rep counting when user hasn't fully entered the frame.
        // Once body is ready, we don't check on every frame (would break tracking
        // if some keypoint is temporarily occluded during exercise).
        if (!this.bodyReady) {
            const allBodyVisible = this.checkBodyKeypointsVisible(keypoints)
            if (!allBodyVisible) {
                // Body not ready yet - return waiting state
                return {
                    ...this.emptyTelemetry(),
                    bodyReady: false,
                    frameDropped: false,
                    reps: 0,
                }
            }
            // Body is now ready - activate tracking
            this.bodyReady = true
            console.log('[ExerciseEngine] Body ready - all body keypoints visible, starting tracking')
        }

        // Pipeline: raw -> COCO format -> normalized -> imputed -> smoothed -> features -> FSM
        const coco = toCocoKeypoints(keypoints)
        const normalized = this.normalizer.normalize(coco)
        // Impute missing keypoints from recent history before smoothing
        const imputed = this.imputer.impute(normalized)
        const smoothed = this.smoother ? this.smoother.smooth(imputed, timestamp) : imputed

        // === Posture Guard: detect and validate posture ===
        // Step 1: Raw posture detection from keypoints
        const rawPostureResult = computePosture(smoothed, this.config.minConfidence)
        // Step 2: Apply temporal smoothing (majority vote + hysteresis)
        // This prevents flickering between postures on borderline frames
        const postureResult = this.postureSmoother.smooth(rawPostureResult)
        const detectedPosture = postureResult.posture

        // Check if posture matches required posture (if configured)
        const requiredPosture = this.rule.posture
        const postureTolerance = this.rule.posture_tolerance ?? 0.6

        // Posture is rejected if:
        // 1. Required posture is set
        // 2. Detected posture is known (not 'unknown')
        // 3. Detection confidence meets tolerance
        // 4. Detected posture doesn't match required
        const postureRejected = requiredPosture != null
            && detectedPosture !== 'unknown'
            && postureResult.confidence >= postureTolerance
            && detectedPosture !== requiredPosture

        // If posture is rejected, don't update FSM (skip transition)
        // This prevents false positives when user is in wrong position
        if (postureRejected) {
            return {
                exercise: this.rule.exercise,
                phase: 'Top', // Keep at Top when posture is wrong
                reps: this.fsm.getReps(),
                axis: null,
                yawRejected: false,
                frameDropped: false,
                transitionRecovered: false,
                partialRom: null,
                extremum: null,
                timingError: null,
                detectedPosture,
                postureRejected: true,
                bodyReady: this.bodyReady,
                traceback: `Posture mismatch: expected ${requiredPosture}, got ${detectedPosture}`,
            }
        }

        const feats = this.features.compute(smoothed, 1 / this.config.fps)

        // Handle multi-axis vs single-axis mode
        if (this.isMultiAxisMode && this.fsm instanceof MultiAxisFSM) {
            const multiStep = this.fsm.step(feats)
            // For multi-axis, use primary axis value for backward compatibility
            const primaryIdx = this.fsm.getPrimaryAxisIndex()
            const primaryAxis = multiStep.axes[primaryIdx]?.axisValue ?? null

            return {
                exercise: this.rule.exercise,
                phase: multiStep.combinedPhase,
                reps: multiStep.reps,
                axis: primaryAxis,
                yawRejected: false, // Multi-axis doesn't have yaw rejection per axis yet
                frameDropped: false,
                transitionRecovered: false,
                partialRom: null, // Multi-axis partial ROM is handled per axis
                extremum: null, // Multi-axis extremum is handled per axis
                // Timing error from multi-axis FSM
                timingError: multiStep.timingError ?? null,
                detectedPosture,
                postureRejected: false,
                bodyReady: this.bodyReady,
                // Include full multi-axis state for advanced UI
                multiAxisState: multiStep,
                traceback: DEFAULT_TRACEBACK,
            }
        }

        // Single-axis mode
        const singleFsm = this.fsm as RepCounterFSM
        const step = singleFsm.step(feats)

        return {
            exercise: this.rule.exercise,
            phase: step.phase,
            reps: step.reps,
            axis: step.axis,
            yawRejected: step.yaw_rejected,
            frameDropped: step.frame_dropped,
            transitionRecovered: step.transition_recovered,
            // Partial ROM detection: incomplete amplitude warning
            partialRom: step.partial_rom,
            // Peak/valley event from FSM transitions (for range_error_lines checks)
            extremum: step.extremum ?? null,
            // Timing error event from FSM
            timingError: step.timing_error ?? null,
            // Posture Guard: include detected posture in telemetry
            detectedPosture,
            postureRejected: false,
            bodyReady: this.bodyReady,
            traceback: DEFAULT_TRACEBACK,
        }
    }

    private buildFsm(): RepCounterFSM | MultiAxisFSM {
        // Check for multi-axis mode
        if (this.isMultiAxisMode && this.rule.multiAxis) {
            // Ensure timing config is propagated to multi-axis FSM
            const multiAxisConfig = {
                ...this.rule.multiAxis,
                // Inherit avg_rep_ms and timing_error from rule if not in multiAxis
                avg_rep_ms: this.rule.multiAxis.avg_rep_ms ?? this.rule.avg_rep_ms,
                timing_error: this.rule.multiAxis.timing_error ?? this.rule.timing_error,
            }
            console.log('[ExerciseEngine] Building MultiAxisFSM:', {
                axes: multiAxisConfig.axes.map(a => a.name),
                combineMode: multiAxisConfig.combineMode,
                syncWindowMs: multiAxisConfig.syncWindowMs,
                avg_rep_ms: multiAxisConfig.avg_rep_ms,
                timing_error: multiAxisConfig.timing_error,
            })
            return new MultiAxisFSM(multiAxisConfig, this.config.fps)
        }

        // Legacy single-axis mode
        if (!this.rule.axis || !this.rule.thresholds) {
            throw new Error('[ExerciseEngine] Single-axis mode requires axis and thresholds')
        }

        const params: FSMParams = {
            ...this.rule.thresholds,
            min_dwell_ms: this.rule.thresholds.min_dwell_ms ?? 0,
            hysteresis: this.rule.hysteresis ?? 0.01,
            anti_yaw_max: this.rule.anti_yaw_max,
            // Phases per rep: for compound exercises (e.g., left+right lunge)
            phases_per_rep: this.rule.phases_per_rep,
            // Partial ROM detection thresholds (4 transitions)
            partial_rom_threshold_down_up: this.rule.partial_rom_threshold_down_up,
            partial_rom_threshold_up_down: this.rule.partial_rom_threshold_up_down,
            partial_rom_threshold_down_bottom: this.rule.partial_rom_threshold_down_bottom,
            partial_rom_threshold_up_top: this.rule.partial_rom_threshold_up_top,
            // Timing error detection
            avg_rep_ms: this.rule.avg_rep_ms,
            timing_error: this.rule.timing_error,
        }
        console.log('[ExerciseEngine] Building single-axis FSM with timing config:', {
            axis: this.rule.axis,
            avg_rep_ms: params.avg_rep_ms,
            timing_error: params.timing_error,
        })
        return new RepCounterFSM(this.rule.axis, params, this.config.fps)
    }

    private buildSmoother(): Smoother | null {
        const { method, alpha, minCutoff, beta, dCutoff } = this.config.smoothing
        if (method === 'ema') {
            return new EMASmoother(alpha ?? 0.4)
        }
        if (method === 'oneeuro') {
            return new OneEuroFilter(minCutoff ?? 1.2, beta ?? 0.012, dCutoff ?? 1.0, this.config.fps)
        }
        return null
    }

    private emptyTelemetry(): EngineTelemetry {
        // Keep UI stable when frames are missing or camera is warming up.
        return {
            exercise: this.rule.exercise,
            phase: 'Top',
            reps: 0,
            axis: null,
            yawRejected: false,
            frameDropped: true,
            transitionRecovered: false,
            partialRom: null,
            extremum: null,
            timingError: null,
            detectedPosture: 'unknown',
            postureRejected: false,
            bodyReady: this.bodyReady,
            traceback: DEFAULT_TRACEBACK,
        }
    }
}
