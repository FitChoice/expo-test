import type { NormalizedKeypoints, PostureType, PostureResult } from './types'

const clone = (kpts: NormalizedKeypoints): NormalizedKeypoints => kpts.map((kp) => [...kp] as [number, number, number])

// ========== Posture Smoother (Temporal Smoothing) ==========
// Reduces posture classification flickering by using majority vote
// over a sliding window of recent detections.

export interface PostureSmootherConfig {
    // Size of the sliding window (number of frames). Default: 7
    windowSize?: number
    // Minimum votes required to switch posture (hysteresis). Default: 4
    // Must be <= windowSize. Higher value = more stable but slower to react.
    minVotesToSwitch?: number
}

/**
 * Smooths posture detection using majority vote with hysteresis.
 *
 * How it works:
 * 1. Maintains a sliding window of recent posture detections
 * 2. Counts votes for each posture type
 * 3. Keeps current posture unless a new posture has enough votes (hysteresis)
 * 4. Returns smoothed posture with averaged confidence
 *
 * This prevents rapid flickering between postures on borderline cases.
 */
export class PostureSmoother {
    private readonly windowSize: number
    private readonly minVotesToSwitch: number
    // Circular buffer of recent posture results
    private readonly history: PostureResult[]
    private historyIndex: number = 0
    // Current stable posture (with hysteresis)
    private currentPosture: PostureType = 'unknown'

    constructor(config?: PostureSmootherConfig) {
        this.windowSize = config?.windowSize ?? 7
        this.minVotesToSwitch = config?.minVotesToSwitch ?? 4
        // Validate: minVotesToSwitch must be <= windowSize
        if (this.minVotesToSwitch > this.windowSize) {
            this.minVotesToSwitch = Math.ceil(this.windowSize / 2) + 1
        }
        this.history = []
    }

    /**
     * Process a new posture detection and return smoothed result.
     * @param result Raw posture detection result from computePosture()
     * @returns Smoothed posture result with temporal filtering
     */
    smooth(result: PostureResult): PostureResult {
        // Add to circular buffer
        if (this.history.length < this.windowSize) {
            this.history.push(result)
        } else {
            this.history[this.historyIndex] = result
            this.historyIndex = (this.historyIndex + 1) % this.windowSize
        }

        // Count votes for each posture type
        const votes = new Map<PostureType, { count: number; totalConfidence: number }>()

        for (const entry of this.history) {
            const existing = votes.get(entry.posture)
            if (existing) {
                existing.count++
                existing.totalConfidence += entry.confidence
            } else {
                votes.set(entry.posture, { count: 1, totalConfidence: entry.confidence })
            }
        }

        // Find posture with most votes
        let maxVotes = 0
        let winner: PostureType = 'unknown'
        let winnerConfidence = 0

        votes.forEach((data, posture) => {
            if (data.count > maxVotes) {
                maxVotes = data.count
                winner = posture
                winnerConfidence = data.totalConfidence / data.count
            }
        })

        // Apply hysteresis: only switch if winner has enough votes
        // AND winner is different from current posture
        if (winner !== this.currentPosture) {
            if (maxVotes >= this.minVotesToSwitch) {
                // Enough votes to switch
                this.currentPosture = winner
            } else {
                // Not enough votes, keep current posture
                // Return current posture with reduced confidence to signal uncertainty
                const currentData = votes.get(this.currentPosture)
                if (currentData) {
                    winnerConfidence = currentData.totalConfidence / currentData.count
                }
                winner = this.currentPosture
            }
        }

        return {
            posture: winner,
            confidence: winnerConfidence,
        }
    }

    /**
     * Get current stable posture without processing new input.
     */
    getCurrentPosture(): PostureType {
        return this.currentPosture
    }

    /**
     * Reset smoother state (call when exercise changes or user resets).
     */
    reset(): void {
        this.history.length = 0
        this.historyIndex = 0
        this.currentPosture = 'unknown'
    }
}

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

    /**
     * Low-pass filter using correct OneEuro formula.
     * Fixed: proper alpha calculation based on cutoff frequency.
     * Reference: "1€ Filter" by Géry Casiez et al.
     */
    private lowpass(value: NormalizedKeypoints, prev: NormalizedKeypoints, cutoff: number): NormalizedKeypoints {
        const te = 1 / this.freq
        // FIXED: Correct OneEuro formula
        // tau = 1 / (2 * PI * cutoff) is the time constant
        // alpha = 1 / (1 + tau / te) determines smoothing strength
        const tau = 1 / (2 * Math.PI * cutoff)
        const alpha = cutoff <= 0 ? 1 : 1 / (1 + tau / te)

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
