import { PoseNormalizer } from './normalizer'
import { EMASmoother, OneEuroFilter, type Smoother } from './smoothers'
import { FeatureBuilder } from './features/FeatureBuilder'
import { RepCounterFSM } from './fsm/RepCounterFSM'
import { toCocoKeypoints } from './utils/keypoints'
import type { EngineConfig, EngineTelemetry, ExerciseRule, RawKeypoint } from './types'

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
    private readonly features: FeatureBuilder
    private fsm: RepCounterFSM

    constructor(rule: ExerciseRule, config?: Partial<EngineConfig>) {
        this.rule = rule
        this.config = { ...DEFAULT_CONFIG, ...config, smoothing: { ...DEFAULT_CONFIG.smoothing, ...(config?.smoothing ?? {}) } }
        this.normalizer = new PoseNormalizer(this.config.minConfidence)
        // Smoother stays optional because seated exercises may prefer raw data.
        this.smoother = this.buildSmoother()
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

    reset(): void {
        this.features.reset()
        this.smoother?.reset()
        this.fsm.reset()
    }

    process(keypoints: RawKeypoint[] | null | undefined, timestamp?: number): EngineTelemetry {
        if (!keypoints || !keypoints.length) {
            return this.emptyTelemetry()
        }

        // Pipeline: raw keypoints -> normalized -> smoothed -> high level features -> FSM step.
        const coco = toCocoKeypoints(keypoints)
        const normalized = this.normalizer.normalize(coco)
        const smoothed = this.smoother ? this.smoother.smooth(normalized, timestamp) : normalized
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
            traceback: DEFAULT_TRACEBACK,
        }
    }

    private buildFsm(): RepCounterFSM {
        const params = {
            ...this.rule.thresholds,
            min_dwell_ms: this.rule.thresholds.min_dwell_ms ?? 0,
            hysteresis: this.rule.hysteresis ?? 0.01,
            anti_yaw_max: this.rule.anti_yaw_max,
        }
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
            traceback: DEFAULT_TRACEBACK,
        }
    }
}

