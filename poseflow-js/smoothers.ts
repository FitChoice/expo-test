import type { NormalizedKeypoints } from './types'

const clone = (kpts: NormalizedKeypoints): NormalizedKeypoints => kpts.map((kp) => [...kp] as [number, number, number])

export interface Smoother {
    smooth(value: NormalizedKeypoints, timestamp?: number): NormalizedKeypoints
    reset(): void
}

// Lightweight EMA to match the Python smoothing defaults.
export class EMASmoother implements Smoother {
    private readonly alpha: number
    private state: NormalizedKeypoints | null = null

    constructor(alpha: number) {
        this.alpha = alpha
    }

    smooth(value: NormalizedKeypoints): NormalizedKeypoints {
        if (!this.state) {
            this.state = clone(value)
            return clone(value)
        }

        this.state = this.state.map((prev, idx) => {
            const cur = value[idx] ?? prev
            return [
                this.alpha * cur[0] + (1 - this.alpha) * prev[0],
                this.alpha * cur[1] + (1 - this.alpha) * prev[1],
                cur[2],
            ] as [number, number, number]
        })

        return clone(this.state)
    }

    reset(): void {
        this.state = null
    }
}

// OneEuro handles quick changes without letting jitter through.
export class OneEuroFilter implements Smoother {
    private readonly minCutoff: number
    private readonly beta: number
    private readonly dCutoff: number
    private readonly freq: number
    private lastValue: NormalizedKeypoints | null = null
    private lastDerivative: NormalizedKeypoints | null = null
    private lastTimestamp: number | null = null

    constructor(minCutoff: number, beta: number, dCutoff: number, freq: number) {
        this.minCutoff = minCutoff
        this.beta = beta
        this.dCutoff = dCutoff
        this.freq = freq
    }

    smooth(value: NormalizedKeypoints, timestamp?: number): NormalizedKeypoints {
        const now = timestamp ?? Date.now()
        if (!this.lastValue) {
            this.lastValue = clone(value)
            this.lastDerivative = value.map(() => [0, 0, 0])
            this.lastTimestamp = now
            return clone(value)
        }

        const dt = Math.max((now - (this.lastTimestamp ?? now)) / 1000, 1 / this.freq)
        const rawDerivative = value.map((kp, idx) => {
            const prev = this.lastValue![idx]
            return [(kp[0] - prev[0]) / dt, (kp[1] - prev[1]) / dt, kp[2]] as [number, number, number]
        })

        const derivative = this.lowpass(rawDerivative, this.lastDerivative!, this.dCutoff)
        const maxVelocity = derivative.reduce((acc, kp) => Math.max(acc, Math.max(Math.abs(kp[0]), Math.abs(kp[1]))), 0)
        const cutoff = this.minCutoff + this.beta * maxVelocity
        const filtered = this.lowpass(value, this.lastValue, cutoff)

        this.lastValue = clone(filtered)
        this.lastDerivative = clone(derivative)
        this.lastTimestamp = now

        return clone(filtered)
    }

    reset(): void {
        this.lastValue = null
        this.lastDerivative = null
        this.lastTimestamp = null
    }

    private lowpass(value: NormalizedKeypoints, prev: NormalizedKeypoints, cutoff: number): NormalizedKeypoints {
        const te = 1 / this.freq
        const alpha = cutoff <= 0 ? 1 : 1 / (1 + te * cutoff)
        return value.map((kp, idx) => {
            const p = prev[idx] ?? kp
            return [
                alpha * kp[0] + (1 - alpha) * p[0],
                alpha * kp[1] + (1 - alpha) * p[1],
                kp[2],
            ] as [number, number, number]
        })
    }
}

