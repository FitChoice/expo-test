import type { AxisExtremumEvent, FeatureMap, PartialROMEvent } from '../types'

export interface FSMParams {
    down_enter: number
    bottom_enter: number
    up_enter: number
    top_enter: number
    hysteresis: number
    min_dwell_ms: number
    anti_yaw_max?: number
    // Number of complete phases (Top->Top) required to count one rep
    phases_per_rep?: number

    // === Partial ROM thresholds (0-1) ===
    // Set to null/undefined to disable detection for that transition.
    // Down->Up: returned up without reaching Bottom
    partial_rom_threshold_down_up?: number | null
    // Up->Down: returned down without reaching Top
    partial_rom_threshold_up_down?: number | null
    // Down->Bottom: reached Bottom, check depth quality
    partial_rom_threshold_down_bottom?: number | null
    // Up->Top: reached Top, check extension quality
    partial_rom_threshold_up_top?: number | null
}

// Port of the Python rep-counting FSM with interpolation helpers for dropped frames.
export class RepCounterFSM {
    private readonly params: FSMParams
    private readonly axisName: string
    private readonly fps: number
    private readonly minDwellFrames: number
    private state: 'Top' | 'Down' | 'Bottom' | 'Up' = 'Top'
    private reps = 0
    private stateHistory: string[] = ['Top']
    private axisHistory: number[] = []
    private lastAxis: number | null = null
    private missingFrames = 0

    // Phases per rep: for compound exercises (e.g., left+right), set to 2
    private readonly phasesPerRep: number
    private phaseCount = 0

    // Partial ROM detection: track min/max axis values in Down/Up states
    private downMinAxis: number | null = null
    private upMaxAxis: number | null = null
    // Track minimum axis while in Bottom (true valley for depth checks).
    // This is important because the axis can continue decreasing AFTER entering Bottom.
    private bottomMinAxis: number | null = null
    // Last detected partial ROM event (reset after reading)
    private pendingPartialRom: PartialROMEvent | null = null
    // Axis extremum events (peak/valley) used by range_error_lines checks in UI.
    // This is intentionally edge-triggered, same idea as pendingPartialRom.
    private pendingExtremum: AxisExtremumEvent | null = null

    // --- Anti-spam extremum emission helpers ---
    // We emit peak/valley not only on explicit FSM transitions, but also on a
    // "direction reversal" inside Down/Up phases. This fixes cases where the
    // thresholds are a bit off and the FSM doesn't reach the expected transition,
    // so range_error_lines would never be evaluated.
    //
    // The event remains edge-triggered (once per descent/ascent attempt).
    private downValleyEmitted = false
    private upPeakEmitted = false
    private lastAxisForReversal: number | null = null

    constructor(axisName: string, params: FSMParams, fps: number) {
        this.axisName = axisName
        this.params = params
        this.fps = fps
        this.minDwellFrames = Math.max(1, Math.floor(((params.min_dwell_ms ?? 100) / 1000) * fps))
        this.phasesPerRep = params.phases_per_rep ?? 1
    }

    reset(): void {
        this.state = 'Top'
        this.reps = 0
        this.stateHistory = ['Top']
        this.axisHistory = []
        this.lastAxis = null
        this.missingFrames = 0
        // Reset phases per rep counter
        this.phaseCount = 0
        // Reset partial ROM tracking
        this.downMinAxis = null
        this.upMaxAxis = null
        this.bottomMinAxis = null
        this.pendingPartialRom = null
        this.pendingExtremum = null
        this.downValleyEmitted = false
        this.upPeakEmitted = false
        this.lastAxisForReversal = null
    }

    /**
     * Epsilon for detecting "direction reversal" (start going up after a valley, etc).
     *
     * Needs to work for:
     * - Angle axes (0..180) where 0.5..1.0 degrees is meaningful
     * - Normalized axes (0..1) where epsilon must be ~0.01
     *
     * We scale epsilon with the threshold span as a robust default.
     */
    private reversalEpsilon(): number {
        const span = Math.abs(this.params.top_enter - this.params.bottom_enter)
        return Math.max(this.params.hysteresis * 2, span * 0.01, 1e-6)
    }

    /**
     * Get current rep count.
     * Useful for preserving reps when rebuilding FSM with new thresholds.
     */
    getReps(): number {
        return this.reps
    }

    /**
     * Set rep count.
     * Useful for restoring reps when rebuilding FSM with new thresholds.
     */
    setReps(reps: number): void {
        this.reps = reps
    }

    step(feats: FeatureMap) {
        const frameDropped = !(this.axisName in feats)
        const axis = this.interpolateAxis(feats)

        if (!this.checkYaw(feats)) {
            return {
                phase: this.state,
                rep_increment: 0,
                axis,
                reps: this.reps,
                yaw_rejected: true,
                frame_dropped: frameDropped,
                transition_recovered: false,
                partial_rom: null,
                extremum: null,
            }
        }

        const missed = this.checkMissedCritical(axis)
        if (missed && frameDropped && this.state === 'Up' && axis > this.params.top_enter + this.params.hysteresis) {
            this.state = 'Top'
            // Increment phase count for compound exercises
            this.phaseCount += 1
            // Only increment rep counter after completing required phases
            let repIncr = 0
            if (this.phaseCount >= this.phasesPerRep) {
                repIncr = 1
                this.phaseCount = 0
            }
            this.reps += repIncr
            this.pushState('Top')
            return {
                phase: this.state,
                rep_increment: repIncr,
                axis,
                reps: this.reps,
                yaw_rejected: false,
                frame_dropped: true,
                transition_recovered: true,
                partial_rom: null,
                extremum: null,
            }
        }

        const prevState = this.state
        const [phase, incr] = this.transition(axis)
        this.reps += incr

        // Get pending partial ROM event and reset it
        const partialRom = this.pendingPartialRom
        this.pendingPartialRom = null

        // Get pending extremum event and reset it.
        // This is the key piece that prevents error "spam":
        // the UI only reacts to a single transition event, not to continuous axis comparisons.
        const extremum = this.pendingExtremum
        this.pendingExtremum = null

        // Debug logging for partial ROM detection
        if (partialRom) {
            console.log('[PartialROM] DETECTED:', partialRom.phase_type, 
                'depth:', (partialRom.depth_achieved * 100).toFixed(1) + '%',
                'transition:', prevState, '->', phase)
        }

        return {
            phase,
            rep_increment: incr,
            axis,
            reps: this.reps,
            yaw_rejected: false,
            frame_dropped: frameDropped,
            transition_recovered: false,
            partial_rom: partialRom,
            extremum,
        }
    }

    private transition(axis: number): [typeof this.state, number] {
        const prev = this.state
        let next = prev
        let increment = 0
        const h = this.params.hysteresis

        // Track axis direction (increase/decrease) for reversal-based extrema.
        const prevAxis = this.lastAxisForReversal
        const delta = prevAxis == null ? 0 : axis - prevAxis
        this.lastAxisForReversal = axis

        // Track minimum axis value while in Down state (for partial ROM detection)
        if (prev === 'Down') {
            if (this.downMinAxis === null || axis < this.downMinAxis) {
                this.downMinAxis = axis
            }
        }

        // Track minimum axis value while in Bottom state (true valley).
        if (prev === 'Bottom') {
            if (this.bottomMinAxis === null || axis < this.bottomMinAxis) {
                this.bottomMinAxis = axis
            }
        }

        // Track maximum axis value while in Up state (for partial ROM detection)
        if (prev === 'Up') {
            if (this.upMaxAxis === null || axis > this.upMaxAxis) {
                this.upMaxAxis = axis
            }
        }

        // Reversal-based extremum emission (no spam, once per attempt).
        // - In Down: when we start moving UP after reaching a minimum, emit a valley.
        // - In Up: when we start moving DOWN after reaching a maximum, emit a peak.
        //
        // This helps even if we don't cross up_enter/bottom_enter due to threshold mismatch.
        const eps = this.reversalEpsilon()
        if (prev === 'Down' && !this.downValleyEmitted && this.downMinAxis != null) {
            if (delta > 0 && axis > this.downMinAxis + eps) {
                this.pendingExtremum = { pointType: 'valley', axisValue: this.downMinAxis }
                this.downValleyEmitted = true
            }
        }
        // In Bottom: emit the true valley on the first upward move after the minimum.
        if (prev === 'Bottom' && !this.downValleyEmitted && this.bottomMinAxis != null) {
            if (delta > 0 && axis > this.bottomMinAxis + eps) {
                this.pendingExtremum = { pointType: 'valley', axisValue: this.bottomMinAxis }
                this.downValleyEmitted = true
            }
        }
        if (prev === 'Up' && !this.upPeakEmitted && this.upMaxAxis != null) {
            if (delta < 0 && axis < this.upMaxAxis - eps) {
                this.pendingExtremum = { pointType: 'peak', axisValue: this.upMaxAxis }
                this.upPeakEmitted = true
            }
        }

        if (prev === 'Top') {
            if (axis < this.params.bottom_enter) {
                // Direct transition to Bottom if axis is very low
                // Do NOT emit the valley here: the axis may keep decreasing in Bottom.
                // Instead, track bottomMinAxis and emit on reversal / exit from Bottom.
                this.bottomMinAxis = axis
                this.downValleyEmitted = false
                next = 'Bottom'
            } else if (axis < this.params.down_enter - h) {
                next = 'Down'
                // Reset tracking when entering Down state
                this.downMinAxis = axis
                this.downValleyEmitted = false
            }
        } else if (prev === 'Down') {
            if (axis > this.params.up_enter + h) {
                // Down->Up: returned up without reaching Bottom
                // Check partial ROM for incomplete descent
                console.log('[FSM] Transition Down->Up (incomplete descent)', {
                    axis: axis.toFixed(3),
                    up_enter: this.params.up_enter,
                    hysteresis: h,
                    downMinAxis: this.downMinAxis?.toFixed(3) ?? 'null',
                })
                if (this.downMinAxis !== null) {
                    // Emit a valley based on the observed minimum during the descent attempt.
                    // Only if we haven't emitted it already via reversal logic.
                    if (!this.downValleyEmitted) {
                        this.pendingExtremum = { pointType: 'valley', axisValue: this.downMinAxis }
                        this.downValleyEmitted = true
                    }
                    this.pendingPartialRom = this.checkPartialRomDownUp(this.downMinAxis)
                }
                next = 'Up'
                this.downMinAxis = null
                this.bottomMinAxis = null
                this.upMaxAxis = axis
                this.upPeakEmitted = false
            } else if (axis < this.params.bottom_enter - h) {
                // Down->Bottom: reached Bottom
                // Check partial ROM for depth quality (how deep did we go?)
                console.log('[FSM] Transition Down->Bottom (full descent)', {
                    axis: axis.toFixed(3),
                    bottom_enter: this.params.bottom_enter,
                    hysteresis: h,
                })
                if (this.downMinAxis !== null) {
                    // IMPORTANT:
                    // Do NOT emit a valley here. The axis can keep decreasing while in Bottom,
                    // and we want to evaluate range_error_lines using the TRUE minimum.
                    // We will emit the valley on reversal / exit from Bottom.
                    const partial = this.checkPartialRomDownBottom(this.downMinAxis)
                    if (partial) this.pendingPartialRom = partial
                }
                next = 'Bottom'
                // Carry the minimum into Bottom tracking.
                this.bottomMinAxis = this.downMinAxis
                this.downMinAxis = null
            }
        } else if (prev === 'Bottom') {
            if (axis > this.params.up_enter + h) {
                // Bottom->Up: leaving the bottom. Emit the true valley if we haven't already.
                if (!this.downValleyEmitted && this.bottomMinAxis != null) {
                    this.pendingExtremum = { pointType: 'valley', axisValue: this.bottomMinAxis }
                    this.downValleyEmitted = true
                }
                next = 'Up'
                this.bottomMinAxis = null
                this.upMaxAxis = axis
                this.upPeakEmitted = false
            }
        } else if (prev === 'Up') {
            if (axis > this.params.top_enter + h) {
                // Up->Top: reached Top
                // Check partial ROM for extension quality (how high did we go?)
                console.log('[FSM] Transition Up->Top (full extension)', {
                    axis: axis.toFixed(3),
                    top_enter: this.params.top_enter,
                    hysteresis: h,
                    upMaxAxis: this.upMaxAxis?.toFixed(3) ?? 'null',
                })
                if (this.upMaxAxis !== null) {
                    // Emit a peak based on the observed maximum during the ascent.
                    // Only if we haven't emitted it already via reversal logic.
                    if (!this.upPeakEmitted) {
                        this.pendingExtremum = { pointType: 'peak', axisValue: this.upMaxAxis }
                        this.upPeakEmitted = true
                    }
                    const partial = this.checkPartialRomUpTop(this.upMaxAxis)
                    if (partial) this.pendingPartialRom = partial
                }
                next = 'Top'
                this.upMaxAxis = null
                // Increment phase count for compound exercises
                this.phaseCount += 1
                if (this.phaseCount >= this.phasesPerRep) {
                    increment = 1
                    this.phaseCount = 0
                }
            } else if (axis < this.params.down_enter - h) {
                // Up->Down: returned down without reaching Top
                // Check partial ROM for incomplete ascent
                console.log('[FSM] Transition Up->Down (incomplete extension)', {
                    axis: axis.toFixed(3),
                    down_enter: this.params.down_enter,
                    hysteresis: h,
                    upMaxAxis: this.upMaxAxis?.toFixed(3) ?? 'null',
                })
                if (this.upMaxAxis !== null) {
                    // Emit a peak based on the observed maximum during the ascent attempt.
                    // Again: edge-triggered on transition (and guarded from duplicates).
                    if (!this.upPeakEmitted) {
                        this.pendingExtremum = { pointType: 'peak', axisValue: this.upMaxAxis }
                        this.upPeakEmitted = true
                    }
                    const partial = this.checkPartialRomUpDown(this.upMaxAxis)
                    if (partial) this.pendingPartialRom = partial
                }
                next = 'Down'
                this.upMaxAxis = null
                this.downMinAxis = axis
                this.downValleyEmitted = false
                this.bottomMinAxis = null
            }
        }

        if (next !== prev) {
            if (this.canTransition(prev)) {
                this.state = next
                this.pushState(next)
            } else {
                this.pushState(prev)
            }
        } else {
            this.pushState(prev)
        }

        return [this.state, increment]
    }

    private canTransition(from: string): boolean {
        if (this.stateHistory.length < this.minDwellFrames) return true
        const recent = this.stateHistory.slice(-this.minDwellFrames)
        return recent.every((state) => state === from)
    }

    private interpolateAxis(feats: FeatureMap): number {
        if (this.axisName in feats) {
            const axis = feats[this.axisName]
            this.axisHistory.push(axis)
            if (this.axisHistory.length > 10) this.axisHistory.shift()
            this.lastAxis = axis
            this.missingFrames = 0
            return axis
        }

        this.missingFrames += 1
        if (this.lastAxis == null) return 0
        if (this.axisHistory.length >= 2) {
            const trend = this.axisHistory[this.axisHistory.length - 1] - this.axisHistory[this.axisHistory.length - 2]
            const decay = Math.pow(0.9, Math.min(this.missingFrames - 1, 3))
            return this.lastAxis + trend * decay
        }
        return this.lastAxis
    }

    // Detect transitions that likely happened while frames were dropped.
    private checkMissedCritical(axis: number): boolean {
        if (!this.axisHistory.length || this.lastAxis == null) return false
        const h = this.params.hysteresis
        const last = this.axisHistory[this.axisHistory.length - 1]

        if (this.state === 'Up' && last <= this.params.top_enter + h * 2 && axis > this.params.top_enter + h) return true
        if (this.state === 'Top' && last >= this.params.down_enter - h * 2 && axis < this.params.down_enter - h) return true
        if (this.state === 'Down' && last >= this.params.bottom_enter - h * 2 && axis < this.params.bottom_enter - h) return true
        if (this.state === 'Bottom' && last <= this.params.up_enter + h * 2 && axis > this.params.up_enter + h) return true
        return false
    }

    // Protect the counter from large body rotation where thresholds break down.
    private checkYaw(feats: FeatureMap): boolean {
        if (this.params.anti_yaw_max == null) return true
        const keys = ['shoulder_yaw', 'hip_yaw', 'combined_yaw']
        return keys.every((key) => !(key in feats) || Math.abs(feats[key]) <= (this.params.anti_yaw_max ?? 0))
    }

    private pushState(state: string) {
        this.stateHistory.push(state)
        if (this.stateHistory.length > this.minDwellFrames + 2) {
            this.stateHistory.shift()
        }
    }

    // ========== Partial ROM Detection Methods ==========
    // Each method checks one specific transition for incomplete range of motion.
    // Threshold meaning: minimum % of range that must be achieved to trigger a partial ROM warning.
    // Logic: if achieved >= threshold AND achieved < 100%, it's partial ROM (user started but didn't complete).
    // This matches Python implementation semantics.

    /**
     * Down->Up: returned up without reaching Bottom (incomplete descent)
     * Uses partial_rom_threshold_down_up
     * 
     * Triggers when:
     * - User achieved >= threshold% of depth (started the movement)
     * - But didn't reach 100% (didn't complete to Bottom)
     * 
     * Example: threshold=0.2 means partial ROM is flagged if user went 20-99% deep
     */
    private checkPartialRomDownUp(minAxis: number): PartialROMEvent | null {
        const threshold = this.params.partial_rom_threshold_down_up
        if (threshold == null) {
            console.log('[PartialROM] down_up: threshold is null/undefined, skipping')
            return null
        }

        // Range from down_enter to bottom_enter (axis decreases when going deeper)
        const rangeTotal = this.params.down_enter - this.params.bottom_enter
        if (rangeTotal <= 0) {
            console.log('[PartialROM] down_up: invalid range (down_enter <= bottom_enter)')
            return null
        }

        // How far we went from down_enter toward bottom_enter
        const depthAchieved = this.params.down_enter - minAxis
        let depthPct = Math.max(0, Math.min(1, depthAchieved / rangeTotal))

        console.log('[PartialROM] down_up CHECK:', {
            threshold,
            minAxis: minAxis.toFixed(3),
            down_enter: this.params.down_enter,
            bottom_enter: this.params.bottom_enter,
            rangeTotal: rangeTotal.toFixed(3),
            depthAchieved: depthAchieved.toFixed(3),
            depthPct: (depthPct * 100).toFixed(1) + '%',
            willTrigger: depthPct >= threshold && depthPct < 1.0,
        })

        // Error if achieved >= threshold but < 100% (started movement but didn't complete)
        // This matches Python: depth_pct >= threshold AND depth_pct < 1.0
        if (depthPct >= threshold && depthPct < 1.0) {
            return {
                phase_type: 'down_up',
                depth_achieved: depthPct,
                axis_value: minAxis,
                required_threshold: this.params.bottom_enter,
                deficit: minAxis - this.params.bottom_enter,
            }
        }
        return null
    }

    /**
     * Up->Down: returned down without reaching Top (incomplete ascent)
     * Uses partial_rom_threshold_up_down
     * 
     * Triggers when:
     * - User achieved >= threshold% of height (started the movement)
     * - But didn't reach 100% (didn't complete to Top)
     */
    private checkPartialRomUpDown(maxAxis: number): PartialROMEvent | null {
        const threshold = this.params.partial_rom_threshold_up_down
        if (threshold == null) return null

        // Range from up_enter to top_enter (axis increases when going up)
        const rangeTotal = this.params.top_enter - this.params.up_enter
        if (rangeTotal <= 0) return null

        // How far we went from up_enter toward top_enter
        const heightAchieved = maxAxis - this.params.up_enter
        let heightPct = Math.max(0, Math.min(1, heightAchieved / rangeTotal))

        // Error if achieved >= threshold but < 100% (started movement but didn't complete)
        if (heightPct >= threshold && heightPct < 1.0) {
            return {
                phase_type: 'up_down',
                depth_achieved: heightPct,
                axis_value: maxAxis,
                required_threshold: this.params.top_enter,
                deficit: this.params.top_enter - maxAxis,
            }
        }
        return null
    }

    /**
     * Down->Bottom: reached Bottom, check depth quality
     * Uses partial_rom_threshold_down_bottom
     * 
     * This checks quality even when Bottom is reached.
     * Triggers when depth achieved >= threshold but we want to flag it as partial.
     */
    private checkPartialRomDownBottom(minAxis: number): PartialROMEvent | null {
        const threshold = this.params.partial_rom_threshold_down_bottom
        if (threshold == null) return null

        // Range from down_enter to bottom_enter
        const rangeTotal = this.params.down_enter - this.params.bottom_enter
        if (rangeTotal <= 0) return null

        // How far we went from down_enter toward bottom_enter
        const depthAchieved = this.params.down_enter - minAxis
        let depthPct = Math.max(0, Math.min(1, depthAchieved / rangeTotal))

        // Error if achieved >= threshold but < 100% (quality check)
        if (depthPct >= threshold && depthPct < 1.0) {
            return {
                phase_type: 'down_bottom',
                depth_achieved: depthPct,
                axis_value: minAxis,
                required_threshold: this.params.bottom_enter,
                deficit: minAxis - this.params.bottom_enter,
            }
        }
        return null
    }

    /**
     * Up->Top: reached Top, check extension quality
     * Uses partial_rom_threshold_up_top
     * 
     * NOTE: This check triggers when transitioning Up->Top.
     * At that moment, axis > top_enter + hysteresis, so upMaxAxis >= top_enter.
     * This means heightPct will always be ~100% (clamped to 1.0).
     * The condition "heightPct < 1.0" will NEVER be true for normal transitions!
     * 
     * TODO: This logic needs to be rethought. Currently it cannot detect
     * "quality" issues because by definition, reaching Top means 100% extension.
     */
    private checkPartialRomUpTop(maxAxis: number): PartialROMEvent | null {
        const threshold = this.params.partial_rom_threshold_up_top
        if (threshold == null) {
            console.log('[PartialROM] up_top: threshold is null/undefined, skipping')
            return null
        }

        // Range from up_enter to top_enter
        const rangeTotal = this.params.top_enter - this.params.up_enter
        if (rangeTotal <= 0) {
            console.log('[PartialROM] up_top: invalid range (top_enter <= up_enter)')
            return null
        }

        // How far we went from up_enter toward top_enter
        const heightAchieved = maxAxis - this.params.up_enter
        let heightPct = Math.max(0, Math.min(1, heightAchieved / rangeTotal))

        console.log('[PartialROM] up_top CHECK:', {
            threshold,
            maxAxis: maxAxis.toFixed(3),
            top_enter: this.params.top_enter,
            up_enter: this.params.up_enter,
            hysteresis: this.params.hysteresis,
            rangeTotal: rangeTotal.toFixed(3),
            heightAchieved: heightAchieved.toFixed(3),
            heightPct: (heightPct * 100).toFixed(1) + '%',
            willTrigger: heightPct >= threshold && heightPct < 1.0,
            NOTE: 'heightPct is always ~100% when reaching Top, so this will never trigger!'
        })

        // Error if achieved >= threshold but < 100% (quality check)
        // BUG: This condition can NEVER be true because when transitioning to Top,
        // maxAxis >= top_enter + hysteresis, so heightPct is always >= 1.0 (clamped to 1.0)
        if (heightPct >= threshold && heightPct < 1.0) {
            return {
                phase_type: 'up_top',
                depth_achieved: heightPct,
                axis_value: maxAxis,
                required_threshold: this.params.top_enter,
                deficit: this.params.top_enter - maxAxis,
            }
        }
        return null
    }
}

