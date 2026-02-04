/**
 * MultiAxisFSM: Combines multiple RepCounterFSM instances for multi-axis rep counting.
 *
 * Supports three combine modes:
 * - AND: Rep counted when ALL axes complete a full cycle within sync window
 * - OR: Rep counted when ANY axis completes a full cycle
 * - PRIMARY: Rep counted when primary axis completes; others are for validation only
 *
 * Each axis maintains its own FSM state independently.
 * The combined rep count is determined by the combine mode logic.
 */
import type {
    AxisConfig,
    AxisCombineMode,
    FeatureMap,
    MultiAxisConfig,
    MultiAxisState,
    SingleAxisState,
    TimingErrorEvent,
} from '../types'
import { RepCounterFSM, type FSMParams } from './RepCounterFSM'

/**
 * Internal state for tracking axis cycle completion.
 */
interface AxisTracker {
    fsm: RepCounterFSM
    config: AxisConfig
    lastTopTime: number | null      // Timestamp (ms) when last reached Top
    cycleComplete: boolean          // True if completed a cycle since last combined rep
    currentPhase: 'Top' | 'Down' | 'Bottom' | 'Up'
    lastAxisValue: number | null
}

// Minimum interval between reps in milliseconds.
// Prevents false positives from axis jitter during skeleton initialization.
// Even very fast exercises (jumping jacks) take at least 300ms per rep.
const MIN_REP_INTERVAL_MS = 200

/**
 * MultiAxisFSM coordinates multiple single-axis FSMs for combined rep counting.
 */
export class MultiAxisFSM {
    private readonly config: MultiAxisConfig
    private readonly fps: number
    private readonly syncWindowMs: number
    private readonly trackers: AxisTracker[]
    private combinedReps = 0
    private frameTime = 0  // Current time in ms based on frame count

    // Rep cooldown: prevent rapid-fire rep counting from skeleton jitter
    private lastRepTime: number | null = null

    // Timing error detection: track when rep started and pending error event
    private repStartTime: number | null = null
    private pendingTimingError: TimingErrorEvent | null = null

    constructor(config: MultiAxisConfig, fps: number) {
        this.config = config
        this.fps = fps
        // Default sync window is 500ms
        this.syncWindowMs = config.syncWindowMs ?? 500

        // Create a tracker for each axis
        this.trackers = config.axes.map((axisConfig) => {
            const fsmParams: FSMParams = {
                down_enter: axisConfig.thresholds.down_enter,
                bottom_enter: axisConfig.thresholds.bottom_enter,
                up_enter: axisConfig.thresholds.up_enter,
                top_enter: axisConfig.thresholds.top_enter,
                hysteresis: axisConfig.hysteresis ?? 0.01,
                min_dwell_ms: axisConfig.thresholds.min_dwell_ms ?? 0,
                // Note: Partial ROM and posture are handled at ExerciseEngine level
            }

            return {
                fsm: new RepCounterFSM(axisConfig.name, fsmParams, fps),
                config: axisConfig,
                lastTopTime: null,
                cycleComplete: false,
                currentPhase: 'Top' as const,
                lastAxisValue: null,
            }
        })
    }

    /**
     * Reset all FSMs and combined state.
     */
    reset(): void {
        this.combinedReps = 0
        this.frameTime = 0
        this.lastRepTime = null  // Reset rep cooldown
        this.repStartTime = null  // Reset timing tracking
        this.pendingTimingError = null
        for (const tracker of this.trackers) {
            tracker.fsm.reset()
            tracker.lastTopTime = null
            tracker.cycleComplete = false
            tracker.currentPhase = 'Top'
            tracker.lastAxisValue = null
        }
    }

    /**
     * Get current combined rep count.
     */
    getReps(): number {
        return this.combinedReps
    }

    /**
     * Set combined rep count.
     * Useful for preserving reps when rebuilding FSM.
     */
    setReps(reps: number): void {
        this.combinedReps = reps
    }

    /**
     * Get the primary axis index (for PRIMARY mode).
     */
    getPrimaryAxisIndex(): number {
        return this.config.primaryAxisIndex ?? 0
    }

    /**
     * Process a single frame for all axes and return combined state.
     */
    step(feats: FeatureMap): MultiAxisState {
        // Advance frame time
        this.frameTime += 1000 / this.fps

        // Track if we were all in Top before this step (to detect rep start)
        const wereAllInTop = this.trackers.every(t => t.currentPhase === 'Top')

        // Process each axis
        const axisStates: SingleAxisState[] = []
        let anyRepIncrement = false
        let allInTop = true

        for (let i = 0; i < this.trackers.length; i++) {
            const tracker = this.trackers[i]

            // Invert axis value if configured (for anti-phase axes)
            // This transforms Top↔Bottom, allowing sync of opposing movements
            let processedFeats = feats
            if (tracker.config.inverted) {
                const axisName = tracker.config.name
                if (axisName in feats) {
                    processedFeats = { ...feats, [axisName]: 1 - feats[axisName] }
                }
            }

            const result = tracker.fsm.step(processedFeats)
            const prevPhase = tracker.currentPhase

            // Update tracker state
            tracker.currentPhase = result.phase as 'Top' | 'Down' | 'Bottom' | 'Up'
            tracker.lastAxisValue = result.axis

            // Check if this axis just completed a cycle (reached Top)
            if (result.rep_increment > 0) {
                // The FSM counted a rep, meaning we transitioned to Top
                tracker.lastTopTime = this.frameTime
                tracker.cycleComplete = true
                anyRepIncrement = true
            }

            // Track if all axes are currently in Top state
            if (tracker.currentPhase !== 'Top') {
                allInTop = false
            }

            axisStates.push({
                axisName: tracker.config.name,
                phase: tracker.currentPhase,
                axisValue: tracker.lastAxisValue,
                lastTopTime: tracker.lastTopTime,
                cycleComplete: tracker.cycleComplete,
            })
        }

        // Start timing when first axis leaves Top (beginning of rep cycle)
        if (wereAllInTop && !allInTop && this.repStartTime === null) {
            this.repStartTime = this.frameTime
        }

        // Determine if we should count a combined rep based on combine mode
        let repIncrement = 0
        let syncStatus: 'synced' | 'partial' | 'none' = 'none'

        switch (this.config.combineMode) {
            case 'AND':
                const andResult = this.checkAndMode()
                repIncrement = andResult.increment
                syncStatus = andResult.syncStatus
                break

            case 'OR':
                const orResult = this.checkOrMode()
                repIncrement = orResult.increment
                syncStatus = orResult.syncStatus
                break

            case 'PRIMARY':
                const primaryResult = this.checkPrimaryMode()
                repIncrement = primaryResult.increment
                syncStatus = primaryResult.syncStatus
                break
        }

        // Apply rep cooldown: prevent rapid-fire counting from skeleton jitter
        // Check if enough time has passed since last rep
        if (repIncrement > 0) {
            if (this.lastRepTime !== null && (this.frameTime - this.lastRepTime) < MIN_REP_INTERVAL_MS) {
                // Too fast - ignore this rep (skeleton jitter protection)
                repIncrement = 0
            } else {
                // Valid rep - update last rep time
                this.lastRepTime = this.frameTime
                // Check timing error when rep is counted
                this.checkTimingError()
                // Reset rep start time for next rep
                this.repStartTime = null
            }
        }

        // Update combined rep count
        this.combinedReps += repIncrement

        // Generate combined phase string for display
        const combinedPhase = this.generateCombinedPhase(axisStates)

        // Get pending timing error (edge-triggered)
        const timingError = this.pendingTimingError
        this.pendingTimingError = null

        return {
            axes: axisStates,
            combinedPhase,
            reps: this.combinedReps,
            repIncrement,
            syncStatus,
            timingError,
        }
    }

    /**
     * AND mode: Rep counted when ALL axes complete a cycle within sync window.
     *
     * Logic:
     * 1. Wait for all axes to complete at least one cycle (cycleComplete = true)
     * 2. Check if all completion times are within syncWindowMs of each other
     * 3. If yes: count rep and reset all cycleComplete flags
     * 4. If no: reset the oldest axis to allow re-synchronization
     */
    private checkAndMode(): { increment: number; syncStatus: 'synced' | 'partial' | 'none' } {
        // Check if all axes have completed at least one cycle
        const allComplete = this.trackers.every((t) => t.cycleComplete)

        if (!allComplete) {
            // Check if some axes completed (partial sync)
            const someComplete = this.trackers.some((t) => t.cycleComplete)
            return { increment: 0, syncStatus: someComplete ? 'partial' : 'none' }
        }

        // All axes completed - check if within sync window
        // Build array of {index, time} to preserve tracker index
        const topTimesWithIndex = this.trackers
            .map((t, idx) => ({ idx, time: t.lastTopTime }))
            .filter((item): item is { idx: number; time: number } => item.time !== null)

        if (topTimesWithIndex.length < this.trackers.length) {
            return { increment: 0, syncStatus: 'partial' }
        }

        const times = topTimesWithIndex.map((t) => t.time)
        const minTime = Math.min(...times)
        const maxTime = Math.max(...times)
        const timeDiff = maxTime - minTime

        if (timeDiff <= this.syncWindowMs) {
            // All axes completed within sync window - count rep!
            this.resetCycleFlags()
            return { increment: 1, syncStatus: 'synced' }
        }

        // Axes completed but NOT within sync window.
        // Reset the oldest axis's cycleComplete flag to allow re-synchronization.
        // This means the "slow" axis must wait for the "fast" axis to complete another cycle.
        const oldestItem = topTimesWithIndex.reduce((oldest, item) =>
            item.time < oldest.time ? item : oldest
        )
        this.trackers[oldestItem.idx].cycleComplete = false

        return { increment: 0, syncStatus: 'partial' }
    }

    /**
     * OR mode: Rep counted when ANY axis completes a cycle.
     * Only count once per sync window to avoid double counting.
     */
    private checkOrMode(): { increment: number; syncStatus: 'synced' | 'partial' | 'none' } {
        // Find axes that just completed a cycle
        const completedNow = this.trackers.filter((t) => t.cycleComplete)

        if (completedNow.length === 0) {
            return { increment: 0, syncStatus: 'none' }
        }

        // Count a rep for the first completion
        // Reset all cycle flags within the sync window to avoid double counting
        this.resetCycleFlags()

        // Check how many axes are synchronized
        const allInTop = this.trackers.every((t) => t.currentPhase === 'Top')

        return {
            increment: 1,
            syncStatus: allInTop ? 'synced' : 'partial',
        }
    }

    /**
     * PRIMARY mode: Rep counted when primary axis completes.
     * Other axes are for validation/feedback only.
     */
    private checkPrimaryMode(): { increment: number; syncStatus: 'synced' | 'partial' | 'none' } {
        const primaryIdx = this.config.primaryAxisIndex ?? 0
        const primaryTracker = this.trackers[primaryIdx]

        if (!primaryTracker) {
            return { increment: 0, syncStatus: 'none' }
        }

        if (!primaryTracker.cycleComplete) {
            return { increment: 0, syncStatus: 'none' }
        }

        // Primary axis completed - count rep
        // Check if other axes are synchronized for feedback
        const othersInTop = this.trackers
            .filter((_, idx) => idx !== primaryIdx)
            .every((t) => t.currentPhase === 'Top' || t.cycleComplete)

        this.resetCycleFlags()

        return {
            increment: 1,
            syncStatus: othersInTop ? 'synced' : 'partial',
        }
    }

    /**
     * Reset cycle complete flags for all axes.
     */
    private resetCycleFlags(): void {
        for (const tracker of this.trackers) {
            tracker.cycleComplete = false
        }
    }

    /**
     * Check if the just-completed rep was too fast or too slow.
     * Called when a combined rep is counted.
     *
     * Compares actual rep duration to avg_rep_ms from config.
     * Emits a TimingErrorEvent if deviation exceeds threshold.
     */
    private checkTimingError(): void {
        const avgRepMs = this.config.avg_rep_ms
        const timingConfig = this.config.timing_error

        // Skip if no reference timing or timing config
        if (avgRepMs == null || avgRepMs <= 0) {
            return
        }
        if (!timingConfig) {
            return
        }

        // Calculate actual rep duration
        if (this.repStartTime === null) {
            // No start time recorded (shouldn't happen)
            return
        }

        const actualMs = this.frameTime - this.repStartTime
        const deviationMs = actualMs - avgRepMs
        const deviationPct = (deviationMs / avgRepMs) * 100

        // Check "too slow" threshold
        const slowThreshold = timingConfig.slow_threshold_pct
        if (slowThreshold != null && deviationPct > slowThreshold) {
            this.pendingTimingError = {
                type: 'too_slow',
                message: timingConfig.slow_message ?? 'Слишком медленно',
                actual_ms: Math.round(actualMs),
                expected_ms: Math.round(avgRepMs),
                deviation_pct: Math.round(deviationPct),
            }
            return
        }

        // Check "too fast" threshold (negative deviation)
        const fastThreshold = timingConfig.fast_threshold_pct
        if (fastThreshold != null && -deviationPct > fastThreshold) {
            this.pendingTimingError = {
                type: 'too_fast',
                message: timingConfig.fast_message ?? 'Слишком быстро',
                actual_ms: Math.round(actualMs),
                expected_ms: Math.round(avgRepMs),
                deviation_pct: Math.round(deviationPct),
            }
            return
        }
    }

    /**
     * Generate a human-readable combined phase string.
     */
    private generateCombinedPhase(states: SingleAxisState[]): string {
        // If all axes in same phase, return that phase
        const phases = states.map((s) => s.phase)
        const uniquePhases = Array.from(new Set(phases))

        if (uniquePhases.length === 1) {
            return uniquePhases[0]
        }

        // Mixed phases - show primary or first axis
        const primaryIdx = this.config.primaryAxisIndex ?? 0
        const primaryState = states[primaryIdx]

        if (this.config.combineMode === 'PRIMARY' && primaryState) {
            return `${primaryState.phase}*`  // * indicates primary
        }

        // Show count of phases for AND/OR modes
        const topCount = phases.filter((p) => p === 'Top').length
        const bottomCount = phases.filter((p) => p === 'Bottom').length

        if (topCount === phases.length) return 'Top'
        if (bottomCount === phases.length) return 'Bottom'

        return `Mixed(${topCount}/${phases.length} Top)`
    }

    /**
     * Get configuration for a specific axis by index.
     */
    getAxisConfig(index: number): AxisConfig | undefined {
        return this.config.axes[index]
    }

    /**
     * Get all axis configurations.
     */
    getAllAxisConfigs(): AxisConfig[] {
        return [...this.config.axes]
    }

    /**
     * Get the combine mode.
     */
    getCombineMode(): AxisCombineMode {
        return this.config.combineMode
    }

    /**
     * Get the sync window in milliseconds.
     */
    getSyncWindowMs(): number {
        return this.syncWindowMs
    }

    /**
     * Get number of axes.
     */
    getAxisCount(): number {
        return this.trackers.length
    }
}
