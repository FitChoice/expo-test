import { PoseNormalizer } from './normalizer'
import { EMASmoother, OneEuroFilter, type Smoother } from './smoothers'
import { FeatureBuilder } from './features/FeatureBuilder'
import { RepCounterFSM, type FSMParams } from './fsm/RepCounterFSM'
import { toCocoKeypoints } from './utils/keypoints'
import { KeypointImputer } from './KeypointImputer'
import type { EngineConfig, EngineTelemetry, ExerciseRule, RawKeypoint } from './types'

// Minimum visible keypoints required for reliable processing.
// Below this threshold, frames are dropped to avoid false positives.
const MIN_VISIBLE_KEYPOINTS = 10

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
    private fsm: RepCounterFSM

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
        this.fsm = this.buildFsm()
    }

    updateRule(rule: ExerciseRule) {
        this.rule = rule
        this.fsm = this.buildFsm()
    }

    /**
     * Update thresholds without resetting FSM state.
     * Useful for live threshold tuning during debugging.
     */
    updateThresholds(thresholds: Partial<ExerciseRule['thresholds']>): void {
        this.rule = {
            ...this.rule,
            thresholds: { ...this.rule.thresholds, ...thresholds },
        }
        // Rebuild FSM with new thresholds but preserve rep count
        const currentReps = this.fsm.getReps()
        this.fsm = this.buildFsm()
        this.fsm.setReps(currentReps)
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

        // Pipeline: raw -> COCO format -> normalized -> imputed -> smoothed -> features -> FSM
        const coco = toCocoKeypoints(keypoints)
        const normalized = this.normalizer.normalize(coco)
        // Impute missing keypoints from recent history before smoothing
        const imputed = this.imputer.impute(normalized)
        const smoothed = this.smoother ? this.smoother.smooth(imputed, timestamp) : imputed
        const feats = this.features.compute(smoothed, 1 / this.config.fps)
        const step = this.fsm.step(feats)

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
            traceback: DEFAULT_TRACEBACK,
        }
    }

    private buildFsm(): RepCounterFSM {
        const params = {
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
        }
        console.log('[ExerciseEngine] Building FSM with partial ROM thresholds:', {
            down_up: params.partial_rom_threshold_down_up,
            up_down: params.partial_rom_threshold_up_down,
            down_bottom: params.partial_rom_threshold_down_bottom,
            up_top: params.partial_rom_threshold_up_top,
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
            traceback: DEFAULT_TRACEBACK,
        }
    }
}

