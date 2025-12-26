import type { FeatureMap, PartialROMEvent } from '../types'

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
    // Threshold (0-1) for detecting partial ROM on down phase
    partial_rom_threshold_down?: number
    // Threshold (0-1) for detecting partial ROM on up phase
    partial_rom_threshold_up?: number
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
    // Last detected partial ROM event (reset after reading)
    private pendingPartialRom: PartialROMEvent | null = null

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
        this.pendingPartialRom = null
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
            }
        }

        const [phase, incr] = this.transition(axis)
        this.reps += incr

        // Get pending partial ROM event and reset it
        const partialRom = this.pendingPartialRom
        this.pendingPartialRom = null

        return {
            phase,
            rep_increment: incr,
            axis,
            reps: this.reps,
            yaw_rejected: false,
            frame_dropped: frameDropped,
            transition_recovered: false,
            partial_rom: partialRom,
        }
    }

    private transition(axis: number): [typeof this.state, number] {
        const prev = this.state
        let next = prev
        let increment = 0
        const h = this.params.hysteresis

        // Track minimum axis value while in Down state (for partial ROM down detection)
        if (prev === 'Down') {
            if (this.downMinAxis === null || axis < this.downMinAxis) {
                this.downMinAxis = axis
            }
        }

        // Track maximum axis value while in Up state (for partial ROM up detection)
        if (prev === 'Up') {
            if (this.upMaxAxis === null || axis > this.upMaxAxis) {
                this.upMaxAxis = axis
            }
        }

        if (prev === 'Top') {
            if (axis < this.params.bottom_enter) {
                // Direct transition to Bottom if axis is very low
                next = 'Bottom'
            } else if (axis < this.params.down_enter - h) {
                next = 'Down'
                // Reset tracking when entering Down state
                this.downMinAxis = axis
            }
        } else if (prev === 'Down') {
            if (axis > this.params.up_enter + h) {
                // Direct transition to Up if axis jumps high (missed Bottom)
                // Check for partial ROM (down) before leaving Down state
                if (this.downMinAxis !== null) {
                    this.pendingPartialRom = this.checkPartialRomDown(this.downMinAxis)
                }
                next = 'Up'
                this.downMinAxis = null // Reset after leaving Down
                this.upMaxAxis = axis // Start tracking for Up state
            } else if (axis < this.params.bottom_enter - h) {
                next = 'Bottom'
                this.downMinAxis = null // Reset - we reached Bottom, no partial ROM
            }
        } else if (prev === 'Bottom') {
            if (axis > this.params.up_enter + h) {
                next = 'Up'
                this.upMaxAxis = axis // Start tracking for Up state
            }
        } else if (prev === 'Up') {
            if (axis > this.params.top_enter + h) {
                next = 'Top'
                this.upMaxAxis = null // Reset - we reached Top, no partial ROM
                // Increment phase count for compound exercises
                this.phaseCount += 1
                // Only increment rep counter after completing required phases
                if (this.phaseCount >= this.phasesPerRep) {
                    increment = 1
                    this.phaseCount = 0
                }
            } else if (axis < this.params.down_enter - h) {
                // Going back down without reaching Top - check for partial ROM (up)
                if (this.upMaxAxis !== null) {
                    const partial = this.checkPartialRomUp(this.upMaxAxis)
                    if (partial !== null) {
                        this.pendingPartialRom = partial
                    }
                }
                next = 'Down'
                this.upMaxAxis = null // Reset after leaving Up
                this.downMinAxis = axis // Start tracking for Down state
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

    /**
     * Check if we had partial ROM (incomplete depth) in Down state.
     * Called when leaving Down state without reaching Bottom.
     */
    private checkPartialRomDown(minAxis: number): PartialROMEvent | null {
        // Skip if threshold not configured
        if (this.params.partial_rom_threshold_down == null) {
            return null
        }

        // Calculate the range between down_enter and bottom_enter
        // Note: axis values decrease when going deeper (down_enter > bottom_enter)
        const rangeTotal = this.params.down_enter - this.params.bottom_enter

        // Handle edge case: if range is zero or negative, skip detection
        if (rangeTotal <= 0) {
            return null
        }

        // How much depth was achieved (from down_enter toward bottom_enter)
        const depthAchievedAbs = this.params.down_enter - minAxis

        // Percentage of required depth (0.0 = at down_enter, 1.0 = at bottom_enter)
        let depthPct = depthAchievedAbs / rangeTotal

        // Clamp to valid range
        depthPct = Math.max(0.0, Math.min(1.0, depthPct))

        // Check if we're above threshold but didn't reach Bottom
        if (depthPct >= this.params.partial_rom_threshold_down && depthPct < 1.0) {
            const deficit = minAxis - this.params.bottom_enter
            return {
                phase_type: 'down',
                depth_achieved: depthPct,
                axis_value: minAxis,
                required_threshold: this.params.bottom_enter,
                deficit,
            }
        }

        return null
    }

    /**
     * Check if we had partial ROM (incomplete height) in Up state.
     * Called when leaving Up state without reaching Top.
     */
    private checkPartialRomUp(maxAxis: number): PartialROMEvent | null {
        // Skip if threshold not configured
        if (this.params.partial_rom_threshold_up == null) {
            return null
        }

        // Calculate the range between up_enter and top_enter
        // Note: axis values increase when going up (up_enter < top_enter)
        const rangeTotal = this.params.top_enter - this.params.up_enter

        // Handle edge case: if range is zero or negative, skip detection
        if (rangeTotal <= 0) {
            return null
        }

        // How much height was achieved (from up_enter toward top_enter)
        const heightAchievedAbs = maxAxis - this.params.up_enter

        // Percentage of required height (0.0 = at up_enter, 1.0 = at top_enter)
        let heightPct = heightAchievedAbs / rangeTotal

        // Clamp to valid range
        heightPct = Math.max(0.0, Math.min(1.0, heightPct))

        // Check if we're above threshold but didn't reach Top
        if (heightPct >= this.params.partial_rom_threshold_up && heightPct < 1.0) {
            const deficit = this.params.top_enter - maxAxis
            return {
                phase_type: 'up',
                depth_achieved: heightPct,
                axis_value: maxAxis,
                required_threshold: this.params.top_enter,
                deficit,
            }
        }

        return null
    }
}

