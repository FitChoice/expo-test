import type { FeatureMap } from '../types'

export interface FSMParams {
    down_enter: number
    bottom_enter: number
    up_enter: number
    top_enter: number
    hysteresis: number
    min_dwell_ms: number
    anti_yaw_max?: number
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

    constructor(axisName: string, params: FSMParams, fps: number) {
        this.axisName = axisName
        this.params = params
        this.fps = fps
        this.minDwellFrames = Math.max(1, Math.floor(((params.min_dwell_ms ?? 100) / 1000) * fps))
    }

    reset(): void {
        this.state = 'Top'
        this.reps = 0
        this.stateHistory = ['Top']
        this.axisHistory = []
        this.lastAxis = null
        this.missingFrames = 0
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
            }
        }

        const missed = this.checkMissedCritical(axis)
        if (missed && frameDropped && this.state === 'Up' && axis > this.params.top_enter + this.params.hysteresis) {
            this.state = 'Top'
            this.reps += 1
            this.pushState('Top')
            return {
                phase: this.state,
                rep_increment: 1,
                axis,
                reps: this.reps,
                yaw_rejected: false,
                frame_dropped: true,
                transition_recovered: true,
            }
        }

        const [phase, incr] = this.transition(axis)
        this.reps += incr

        return {
            phase,
            rep_increment: incr,
            axis,
            reps: this.reps,
            yaw_rejected: false,
            frame_dropped: frameDropped,
            transition_recovered: false,
        }
    }

    private transition(axis: number): [typeof this.state, number] {
        const prev = this.state
        let next = prev
        let increment = 0
        const h = this.params.hysteresis

        if (prev === 'Top') {
            if (axis < this.params.bottom_enter) next = 'Bottom'
            else if (axis < this.params.down_enter - h) next = 'Down'
        } else if (prev === 'Down') {
            if (axis > this.params.up_enter + h) next = 'Up'
            else if (axis < this.params.bottom_enter - h) next = 'Bottom'
        } else if (prev === 'Bottom') {
            if (axis > this.params.up_enter + h) next = 'Up'
        } else if (prev === 'Up') {
            if (axis > this.params.top_enter + h) {
                next = 'Top'
                increment = 1
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
}

