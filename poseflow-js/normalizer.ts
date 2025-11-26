import { getMidHip, getMidShoulder } from './cocoIndices'
import type { NormalizedKeypoints } from './types'

const clone = (kpts: NormalizedKeypoints): NormalizedKeypoints => kpts.map((kp) => [...kp] as [number, number, number])

/**
 * Centers keypoints around the mid hip, scales by torso length
 * and rotates so that the torso vector points up.
 */
export class PoseNormalizer {
    private readonly minConf: number

    constructor(minConf: number = 0.3) {
        this.minConf = minConf
    }

    normalize(kpts: NormalizedKeypoints): NormalizedKeypoints {
        if (!kpts.length) return kpts

        const midHip = getMidHip(kpts)
        const midShoulder = getMidShoulder(kpts)

        if (midHip[2] < this.minConf || midShoulder[2] < this.minConf) {
            return this.fallbackNormalize(kpts)
        }

        const torsoVec: [number, number] = [midShoulder[0] - midHip[0], midShoulder[1] - midHip[1]]
        const torsoLen = Math.hypot(torsoVec[0], torsoVec[1])
        if (torsoLen < 1e-6) {
            return this.fallbackNormalize(kpts)
        }

        const centered = kpts.map((kp) => [kp[0] - midHip[0], kp[1] - midHip[1], kp[2]] as [number, number, number])
        const scaled = centered.map((kp) => [kp[0] / torsoLen, kp[1] / torsoLen, kp[2]] as [number, number, number])

        const targetVec: [number, number] = [0, -1]
        const currentVec: [number, number] = [torsoVec[0] / torsoLen, torsoVec[1] / torsoLen]
        const currentAngle = Math.atan2(currentVec[1], currentVec[0])
        const targetAngle = Math.atan2(targetVec[1], targetVec[0])
        const rotation = targetAngle - currentAngle
        const cos = Math.cos(rotation)
        const sin = Math.sin(rotation)

        const rotated = scaled.map(
            (kp) =>
                [kp[0] * cos - kp[1] * sin, kp[0] * sin + kp[1] * cos, kp[2]] as [number, number, number]
        )

        return rotated
    }

    private fallbackNormalize(kpts: NormalizedKeypoints): NormalizedKeypoints {
        if (!kpts.length) return kpts

        // When torso landmarks fail we still want roughly centered coordinates.
        const points = clone(kpts)
        const avg = points.reduce(
            (acc, kp) => {
                acc[0] += kp[0]
                acc[1] += kp[1]
                return acc
            },
            [0, 0]
        )
        const inv = 1 / points.length
        const center: [number, number] = [avg[0] * inv, avg[1] * inv]

        const centered = points.map((kp) => [kp[0] - center[0], kp[1] - center[1], kp[2]] as [number, number, number])
        const distances = centered.map((kp) => Math.hypot(kp[0], kp[1]))
        const positive = distances.filter((d) => d > 0)
        const scale = positive.length ? positive.reduce((s, d) => s + d, 0) / positive.length : 1
        if (scale < 1e-6) return centered

        return centered.map((kp) => [kp[0] / scale, kp[1] / scale, kp[2]] as [number, number, number])
    }
}

