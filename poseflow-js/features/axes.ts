import type { FeatureMap, NormalizedKeypoints } from '../types'
import { COCO_17_INDICES } from '../cocoIndices'

const mean = (values: number[]): number => values.reduce((acc, v) => acc + v, 0) / values.length

// Converts normalized geometry into the axes consumed by the FSM thresholds.
export const computeProgressAxes = (
    nkpts: NormalizedKeypoints,
    feats: FeatureMap,
    angleFeats: FeatureMap,
    minConfidence: number,
    jointMinConfidence: Record<string, number>
): FeatureMap => {
    const axes: FeatureMap = {}
    const idx = COCO_17_INDICES
    const thr = (name: string): number => jointMinConfidence[name] ?? minConfidence

    if ('left_knee_y' in feats && 'right_knee_y' in feats) {
        axes.squat_depth = -mean([feats.left_knee_y, feats.right_knee_y])
    } else if ('left_knee_y' in feats) {
        axes.squat_depth = -feats.left_knee_y
    } else if ('right_knee_y' in feats) {
        axes.squat_depth = -feats.right_knee_y
    } else if ('hip_y' in feats) {
        axes.squat_depth = -feats.hip_y
    }

    // Single-leg depth proxies (for unilateral squats/lunges)
    if ('left_knee_y' in feats) {
        axes.left_knee_depth = -feats.left_knee_y
    }
    if ('right_knee_y' in feats) {
        axes.right_knee_depth = -feats.right_knee_y
    }

    if ('sternum_y' in feats) {
        axes.pushup_depth = feats.sternum_y
    }

    if ('left_knee_angle' in angleFeats && 'right_knee_angle' in angleFeats) {
        axes.squat_knee_angle = mean([angleFeats.left_knee_angle, angleFeats.right_knee_angle])
    } else if ('left_knee_angle' in angleFeats) {
        axes.squat_knee_angle = angleFeats.left_knee_angle
    } else if ('right_knee_angle' in angleFeats) {
        axes.squat_knee_angle = angleFeats.right_knee_angle
    }

    if ('squat_knee_angle' in axes) {
        axes.squat_knee_angle_inv = 180 - axes.squat_knee_angle
    }

    // Hip extension angles for hip bridge and quadruped exercises
    const hipAngles = computeHipExtensionAngles(nkpts, minConfidence, jointMinConfidence)
    Object.assign(axes, hipAngles)

    const crunch = computeCrunchAngle(nkpts, minConfidence)
    if (crunch != null) {
        axes.crunch_angle = crunch
    }

    const legAbduction = computeLegAbduction(nkpts, thr)
    Object.assign(axes, legAbduction)

    const quad = computeQuadrupedExtension(nkpts, thr)
    Object.assign(axes, quad)

    // Hip delta X (normalized) for hip swings exercises
    const hipDeltaX = computeHipDeltaX(nkpts, thr)
    Object.assign(axes, hipDeltaX)

    // Torso lean angle for exercises requiring torso tracking
    const torsoLean = computeTorsoLeanAngle(nkpts, minConfidence)
    Object.assign(axes, torsoLean)

    // Wrist and elbow heights for arm exercises (arm raises, overhead press)
    const armHeights = computeArmHeights(nkpts, thr)
    Object.assign(axes, armHeights)

    // Ankle angles for calf raises
    const ankleAngles = computeAnkleAngles(nkpts, thr)
    Object.assign(axes, ankleAngles)

    // Stance width for squat/lunge form control
    const stanceWidth = computeStanceWidth(nkpts, thr)
    Object.assign(axes, stanceWidth)

    // Arm spread distance for lateral arm exercises
    const armSpread = computeArmSpread(nkpts, thr)
    Object.assign(axes, armSpread)

    // Side-lying leg lift axes for lying leg abduction exercises
    const sideLyingLegLift = computeSideLyingLegLift(nkpts, thr)
    Object.assign(axes, sideLyingLegLift)

    return axes
}

/**
 * Compute hip extension angles for hip bridge and quadruped exercises.
 * Returns both individual (left/right) and combined angles.
 */
const computeHipExtensionAngles = (
    nkpts: NormalizedKeypoints,
    minConfidence: number,
    thrMap: Record<string, number>
): FeatureMap => {
    const idx = COCO_17_INDICES
    const feats: FeatureMap = {}

    const leftThr = Math.min(thrMap.left_knee ?? minConfidence, thrMap.left_hip ?? minConfidence, thrMap.left_shoulder ?? minConfidence)
    const rightThr = Math.min(
        thrMap.right_knee ?? minConfidence,
        thrMap.right_hip ?? minConfidence,
        thrMap.right_shoulder ?? minConfidence
    )

    const left = computeAngleSafe(nkpts[idx.left_knee], nkpts[idx.left_hip], nkpts[idx.left_shoulder], leftThr)
    const right = computeAngleSafe(nkpts[idx.right_knee], nkpts[idx.right_hip], nkpts[idx.right_shoulder], rightThr)

    // Individual angles for unilateral exercises
    if (left != null) {
        feats.hip_extension_angle_l = left
        // Quadruped progress: higher value = more extension
        feats.quadruped_hip_extension_progress_l = Math.max(0, 180 - left)
    }
    if (right != null) {
        feats.hip_extension_angle_r = right
        feats.quadruped_hip_extension_progress_r = Math.max(0, 180 - right)
    }

    // Combined angle for bilateral exercises
    if (left != null && right != null) {
        feats.hip_extension_angle = mean([left, right])
    } else if (left != null) {
        feats.hip_extension_angle = left
    } else if (right != null) {
        feats.hip_extension_angle = right
    }

    return feats
}

const computeCrunchAngle = (nkpts: NormalizedKeypoints, minConfidence: number): number | null => {
    const idx = COCO_17_INDICES
    const nose = nkpts[idx.nose]
    const sternum = [(nkpts[idx.left_shoulder][0] + nkpts[idx.right_shoulder][0]) / 2, (nkpts[idx.left_shoulder][1] + nkpts[idx.right_shoulder][1]) / 2, (nkpts[idx.left_shoulder][2] + nkpts[idx.right_shoulder][2]) / 2] as [
        number,
        number,
        number,
    ]
    const hip = [(nkpts[idx.left_hip][0] + nkpts[idx.right_hip][0]) / 2, (nkpts[idx.left_hip][1] + nkpts[idx.right_hip][1]) / 2, (nkpts[idx.left_hip][2] + nkpts[idx.right_hip][2]) / 2] as [
        number,
        number,
        number,
    ]
    if (nose[2] < minConfidence || sternum[2] < minConfidence || hip[2] < minConfidence) return null
    return computeAngleSafe(nose, sternum, hip, minConfidence)
}

const computeLegAbduction = (
    nkpts: NormalizedKeypoints,
    thr: (name: string) => number
): FeatureMap => {
    const idx = COCO_17_INDICES
    const feats: FeatureMap = {}

    if (nkpts[idx.left_knee][2] >= thr('left_knee') && nkpts[idx.left_ankle][2] >= thr('left_ankle')) {
        const dx = nkpts[idx.left_knee][0] - nkpts[idx.left_ankle][0]
        const dy = nkpts[idx.left_knee][1] - nkpts[idx.left_ankle][1]
        feats.leg_abduction_distance_l = Math.hypot(dx, dy)
    }

    if (nkpts[idx.right_knee][2] >= thr('right_knee') && nkpts[idx.right_ankle][2] >= thr('right_ankle')) {
        const dx = nkpts[idx.right_knee][0] - nkpts[idx.right_ankle][0]
        const dy = nkpts[idx.right_knee][1] - nkpts[idx.right_ankle][1]
        feats.leg_abduction_distance_r = Math.hypot(dx, dy)
    }

    return feats
}

const computeQuadrupedExtension = (
    nkpts: NormalizedKeypoints,
    thr: (name: string) => number
): FeatureMap => {
    const idx = COCO_17_INDICES
    const feats: FeatureMap = {}

    if (nkpts[idx.left_hip][2] >= thr('left_hip') && nkpts[idx.left_knee][2] >= thr('left_knee')) {
        const dx = nkpts[idx.left_hip][0] - nkpts[idx.left_knee][0]
        const dy = nkpts[idx.left_hip][1] - nkpts[idx.left_knee][1]
        feats.quadruped_hip_extension_distance_l = Math.hypot(dx, dy)
    }

    if (nkpts[idx.right_hip][2] >= thr('right_hip') && nkpts[idx.right_knee][2] >= thr('right_knee')) {
        const dx = nkpts[idx.right_hip][0] - nkpts[idx.right_knee][0]
        const dy = nkpts[idx.right_hip][1] - nkpts[idx.right_knee][1]
        feats.quadruped_hip_extension_distance_r = Math.hypot(dx, dy)
    }

    return feats
}

/**
 * Compute hip delta X (normalized) for hip swings exercises.
 * Difference in X coordinate of left hip relative to mid-hip.
 * For hip_swings_l: negative = left swing, positive = right/neutral.
 * We use negative of left_hip X so that left swing (negative X) becomes positive (top).
 */
const computeHipDeltaX = (
    nkpts: NormalizedKeypoints,
    thr: (name: string) => number
): FeatureMap => {
    const idx = COCO_17_INDICES
    const feats: FeatureMap = {}

    if (nkpts[idx.left_hip][2] >= thr('left_hip')) {
        feats.hip_delta_x_norm = -nkpts[idx.left_hip][0]
    }

    return feats
}

/**
 * Compute torso lean angle: angle between torso vector and vertical.
 * 0° = vertical (straight), 90° = horizontal (lying).
 * When leaning forward (bottom): angle increases.
 * When straightening up (top): angle decreases.
 * For FSM: bottom < down < up < top, so we invert: 90 - angle.
 * This makes: larger lean (larger angle) -> smaller value (bottom).
 */
const computeTorsoLeanAngle = (
    nkpts: NormalizedKeypoints,
    minConfidence: number
): FeatureMap => {
    const idx = COCO_17_INDICES
    const feats: FeatureMap = {}

    // Mid-shoulder
    const midShoulderX = (nkpts[idx.left_shoulder][0] + nkpts[idx.right_shoulder][0]) / 2
    const midShoulderY = (nkpts[idx.left_shoulder][1] + nkpts[idx.right_shoulder][1]) / 2
    const midShoulderConf = (nkpts[idx.left_shoulder][2] + nkpts[idx.right_shoulder][2]) / 2

    // Mid-hip
    const midHipX = (nkpts[idx.left_hip][0] + nkpts[idx.right_hip][0]) / 2
    const midHipY = (nkpts[idx.left_hip][1] + nkpts[idx.right_hip][1]) / 2
    const midHipConf = (nkpts[idx.left_hip][2] + nkpts[idx.right_hip][2]) / 2

    if (midHipConf >= minConfidence && midShoulderConf >= minConfidence) {
        // Torso vector from hip to shoulder
        const torsoX = midShoulderX - midHipX
        const torsoY = midShoulderY - midHipY
        const torsoLength = Math.hypot(torsoX, torsoY)

        if (torsoLength > 1e-6) {
            // Vertical is up: (0, -1) in normalized space where Y increases downward
            const verticalX = 0
            const verticalY = -1

            // Normalize torso vector
            const torsoNormX = torsoX / torsoLength
            const torsoNormY = torsoY / torsoLength

            // Dot product
            const dotProduct = torsoNormX * verticalX + torsoNormY * verticalY

            // Clamp and compute angle
            const angleDeg = (Math.acos(Math.min(1, Math.max(-1, dotProduct))) * 180) / Math.PI

            // Invert: 90 - angle so that larger lean becomes smaller value
            feats.torso_lean_angle = 90 - angleDeg
        }
    }

    return feats
}

const computeAngleSafe = (
    p1: [number, number, number],
    p2: [number, number, number],
    p3: [number, number, number],
    thr: number
): number | null => {
    if (p1[2] < thr || p2[2] < thr || p3[2] < thr) return null
    const v1x = p1[0] - p2[0]
    const v1y = p1[1] - p2[1]
    const v2x = p3[0] - p2[0]
    const v2y = p3[1] - p2[1]
    const norm1 = Math.hypot(v1x, v1y)
    const norm2 = Math.hypot(v2x, v2y)
    if (norm1 < 1e-6 || norm2 < 1e-6) return null
    const dot = (v1x / norm1) * (v2x / norm2) + (v1y / norm1) * (v2y / norm2)
    return (Math.acos(Math.min(1, Math.max(-1, dot))) * 180) / Math.PI
}

/**
 * Compute wrist and elbow heights for arm exercises.
 * Useful for: lateral raises, front raises, overhead press, etc.
 * Values are normalized Y coordinates (inverted so higher = larger value).
 */
const computeArmHeights = (
    nkpts: NormalizedKeypoints,
    thr: (name: string) => number
): FeatureMap => {
    const idx = COCO_17_INDICES
    const feats: FeatureMap = {}

    // Wrist heights (inverted: higher arm = larger value)
    if (nkpts[idx.left_wrist][2] >= thr('left_wrist')) {
        feats.wrist_height_l = -nkpts[idx.left_wrist][1]
    }
    if (nkpts[idx.right_wrist][2] >= thr('right_wrist')) {
        feats.wrist_height_r = -nkpts[idx.right_wrist][1]
    }
    // Combined wrist height (average of both)
    if ('wrist_height_l' in feats && 'wrist_height_r' in feats) {
        feats.wrist_height = mean([feats.wrist_height_l, feats.wrist_height_r])
    } else if ('wrist_height_l' in feats) {
        feats.wrist_height = feats.wrist_height_l
    } else if ('wrist_height_r' in feats) {
        feats.wrist_height = feats.wrist_height_r
    }

    // Elbow heights (inverted: higher elbow = larger value)
    if (nkpts[idx.left_elbow][2] >= thr('left_elbow')) {
        feats.elbow_height_l = -nkpts[idx.left_elbow][1]
    }
    if (nkpts[idx.right_elbow][2] >= thr('right_elbow')) {
        feats.elbow_height_r = -nkpts[idx.right_elbow][1]
    }
    // Combined elbow height
    if ('elbow_height_l' in feats && 'elbow_height_r' in feats) {
        feats.elbow_height = mean([feats.elbow_height_l, feats.elbow_height_r])
    } else if ('elbow_height_l' in feats) {
        feats.elbow_height = feats.elbow_height_l
    } else if ('elbow_height_r' in feats) {
        feats.elbow_height = feats.elbow_height_r
    }

    return feats
}

/**
 * Compute ankle angles for calf raise exercises.
 * Angle between knee-ankle-toe line (approximated with ankle Y relative to knee).
 * Higher value = more plantarflexion (standing on toes).
 */
const computeAnkleAngles = (
    nkpts: NormalizedKeypoints,
    thr: (name: string) => number
): FeatureMap => {
    const idx = COCO_17_INDICES
    const feats: FeatureMap = {}

    // For calf raises we track ankle height relative to knee
    // Higher ankle (less negative Y diff) = more plantarflexion
    if (nkpts[idx.left_ankle][2] >= thr('left_ankle') && nkpts[idx.left_knee][2] >= thr('left_knee')) {
        const ankleY = nkpts[idx.left_ankle][1]
        const kneeY = nkpts[idx.left_knee][1]
        // Inverted: higher ankle position = larger value
        feats.calf_raise_progress_l = -(ankleY - kneeY)
    }

    if (nkpts[idx.right_ankle][2] >= thr('right_ankle') && nkpts[idx.right_knee][2] >= thr('right_knee')) {
        const ankleY = nkpts[idx.right_ankle][1]
        const kneeY = nkpts[idx.right_knee][1]
        feats.calf_raise_progress_r = -(ankleY - kneeY)
    }

    // Combined progress
    if ('calf_raise_progress_l' in feats && 'calf_raise_progress_r' in feats) {
        feats.calf_raise_progress = mean([feats.calf_raise_progress_l, feats.calf_raise_progress_r])
    } else if ('calf_raise_progress_l' in feats) {
        feats.calf_raise_progress = feats.calf_raise_progress_l
    } else if ('calf_raise_progress_r' in feats) {
        feats.calf_raise_progress = feats.calf_raise_progress_r
    }

    return feats
}

/**
 * Compute stance width: horizontal distance between ankles.
 * Useful for squat/lunge form control.
 * Normalized by hip width for consistency.
 */
const computeStanceWidth = (
    nkpts: NormalizedKeypoints,
    thr: (name: string) => number
): FeatureMap => {
    const idx = COCO_17_INDICES
    const feats: FeatureMap = {}

    const leftAnkleOk = nkpts[idx.left_ankle][2] >= thr('left_ankle')
    const rightAnkleOk = nkpts[idx.right_ankle][2] >= thr('right_ankle')
    const leftHipOk = nkpts[idx.left_hip][2] >= thr('left_hip')
    const rightHipOk = nkpts[idx.right_hip][2] >= thr('right_hip')

    if (leftAnkleOk && rightAnkleOk) {
        // Raw stance width (horizontal distance between ankles)
        const stanceX = Math.abs(nkpts[idx.left_ankle][0] - nkpts[idx.right_ankle][0])
        feats.stance_width_raw = stanceX

        // Normalized by hip width (if available)
        if (leftHipOk && rightHipOk) {
            const hipWidth = Math.abs(nkpts[idx.left_hip][0] - nkpts[idx.right_hip][0])
            if (hipWidth > 1e-6) {
                feats.stance_width_ratio = stanceX / hipWidth
            }
        }
    }

    return feats
}

/**
 * Compute arm spread distance: horizontal distance between wrists.
 * Useful for: lateral arm raises, chest fly, arm circles.
 * Normalized by shoulder width for consistency.
 */
const computeArmSpread = (
    nkpts: NormalizedKeypoints,
    thr: (name: string) => number
): FeatureMap => {
    const idx = COCO_17_INDICES
    const feats: FeatureMap = {}

    const leftWristOk = nkpts[idx.left_wrist][2] >= thr('left_wrist')
    const rightWristOk = nkpts[idx.right_wrist][2] >= thr('right_wrist')
    const leftShoulderOk = nkpts[idx.left_shoulder][2] >= thr('left_shoulder')
    const rightShoulderOk = nkpts[idx.right_shoulder][2] >= thr('right_shoulder')

    if (leftWristOk && rightWristOk) {
        // Raw arm spread (distance between wrists)
        const dx = nkpts[idx.left_wrist][0] - nkpts[idx.right_wrist][0]
        const dy = nkpts[idx.left_wrist][1] - nkpts[idx.right_wrist][1]
        feats.arm_spread_distance = Math.hypot(dx, dy)

        // Horizontal spread only
        feats.arm_spread_horizontal = Math.abs(dx)

        // Normalized by shoulder width (if available)
        if (leftShoulderOk && rightShoulderOk) {
            const shoulderWidth = Math.abs(nkpts[idx.left_shoulder][0] - nkpts[idx.right_shoulder][0])
            if (shoulderWidth > 1e-6) {
                feats.arm_spread_ratio = feats.arm_spread_distance / shoulderWidth
            }
        }
    }

    return feats
}

/**
 * Compute axes for side-lying leg lift (отведение ноги лежа на боку).
 * Person lies on side, camera views from side, top leg lifts up like scissors.
 *
 * Provides multiple axis options:
 * 1. side_lying_leg_lift_l/r - Ankle height (inverted Y). Higher leg = larger value.
 * 2. hip_abduction_angle_l/r - Angle between hip->knee vector and horizontal.
 * 3. leg_vertical_spread - Vertical distance between ankles (scissors spread).
 * 4. ankle_to_hip_vertical_l/r - Vertical distance from ankle to hip.
 * 5. knee_to_hip_vertical_l/r - Vertical distance from knee to hip.
 *
 * NORMALIZED axes (recommended for side-lying exercises):
 * 6. knee_spread_norm - Distance between knees / hip width
 * 7. ankle_spread_norm - Distance between ankles / hip width
 * 8. knee_vertical_spread_norm - Vertical distance between knees / hip width
 * 9. ankle_vertical_spread_norm - Vertical distance between ankles / hip width
 * 10. knee_to_ankle_relative_l/r - Knee-to-ankle vector relative to hip width
 */
const computeSideLyingLegLift = (
    nkpts: NormalizedKeypoints,
    thr: (name: string) => number
): FeatureMap => {
    const idx = COCO_17_INDICES
    const feats: FeatureMap = {}

    const leftAnkleOk = nkpts[idx.left_ankle][2] >= thr('left_ankle')
    const rightAnkleOk = nkpts[idx.right_ankle][2] >= thr('right_ankle')
    const leftKneeOk = nkpts[idx.left_knee][2] >= thr('left_knee')
    const rightKneeOk = nkpts[idx.right_knee][2] >= thr('right_knee')
    const leftHipOk = nkpts[idx.left_hip][2] >= thr('left_hip')
    const rightHipOk = nkpts[idx.right_hip][2] >= thr('right_hip')

    // Compute hip width for normalization (used in multiple axes)
    let hipWidth = 0
    if (leftHipOk && rightHipOk) {
        hipWidth = Math.hypot(
            nkpts[idx.left_hip][0] - nkpts[idx.right_hip][0],
            nkpts[idx.left_hip][1] - nkpts[idx.right_hip][1]
        )
    }
    const hasHipWidth = hipWidth > 1e-6

    // --- Axis 1: Side-lying leg lift (ankle height, inverted Y) ---
    // Higher leg position = larger value (good for FSM where top > bottom)
    if (leftAnkleOk) {
        feats.side_lying_leg_lift_l = -nkpts[idx.left_ankle][1]
    }
    if (rightAnkleOk) {
        feats.side_lying_leg_lift_r = -nkpts[idx.right_ankle][1]
    }

    // --- Axis 2: Hip abduction angle (angle from horizontal) ---
    // Angle between hip->knee vector and horizontal axis.
    // When leg is horizontal: angle ≈ 0. When leg lifts up: angle increases.
    if (leftHipOk && leftKneeOk) {
        const dx = nkpts[idx.left_knee][0] - nkpts[idx.left_hip][0]
        const dy = nkpts[idx.left_knee][1] - nkpts[idx.left_hip][1]
        // atan2 gives angle from horizontal. We invert Y because Y grows downward.
        // When leg lifts up (knee Y < hip Y), dy is negative, angle becomes positive.
        const angleRad = Math.atan2(-dy, Math.abs(dx))
        feats.hip_abduction_angle_l = (angleRad * 180) / Math.PI
    }
    if (rightHipOk && rightKneeOk) {
        const dx = nkpts[idx.right_knee][0] - nkpts[idx.right_hip][0]
        const dy = nkpts[idx.right_knee][1] - nkpts[idx.right_hip][1]
        const angleRad = Math.atan2(-dy, Math.abs(dx))
        feats.hip_abduction_angle_r = (angleRad * 180) / Math.PI
    }

    // --- Axis 3: Leg vertical spread (vertical distance between ankles) ---
    // Useful for tracking scissors-like movement. Larger spread = larger value.
    if (leftAnkleOk && rightAnkleOk) {
        const verticalDist = Math.abs(nkpts[idx.left_ankle][1] - nkpts[idx.right_ankle][1])
        feats.leg_vertical_spread = verticalDist
    }

    // --- Axis 4: Ankle to hip vertical distance ---
    // Vertical distance from ankle to hip. When leg lifts, ankle goes above hip level.
    // Positive = ankle above hip, Negative = ankle below hip.
    if (leftAnkleOk && leftHipOk) {
        // Invert because Y grows downward: hip_y - ankle_y
        // When ankle is higher (smaller Y), result is positive.
        feats.ankle_to_hip_vertical_l = nkpts[idx.left_hip][1] - nkpts[idx.left_ankle][1]
    }
    if (rightAnkleOk && rightHipOk) {
        feats.ankle_to_hip_vertical_r = nkpts[idx.right_hip][1] - nkpts[idx.right_ankle][1]
    }

    // --- Axis 5: Knee to hip vertical distance ---
    // Similar to ankle, but tracks knee. Good if leg is bent.
    if (leftKneeOk && leftHipOk) {
        feats.knee_to_hip_vertical_l = nkpts[idx.left_hip][1] - nkpts[idx.left_knee][1]
    }
    if (rightKneeOk && rightHipOk) {
        feats.knee_to_hip_vertical_r = nkpts[idx.right_hip][1] - nkpts[idx.right_knee][1]
    }

    // ========== NORMALIZED AXES (relative to hip width) ==========
    // These are scale-invariant and work better across different camera distances

    // --- Axis 6: Knee spread normalized ---
    // Euclidean distance between knees / hip width
    if (leftKneeOk && rightKneeOk && hasHipWidth) {
        const kneeDist = Math.hypot(
            nkpts[idx.left_knee][0] - nkpts[idx.right_knee][0],
            nkpts[idx.left_knee][1] - nkpts[idx.right_knee][1]
        )
        feats.knee_spread_norm = kneeDist / hipWidth
    }

    // --- Axis 7: Ankle spread normalized ---
    // Euclidean distance between ankles / hip width
    if (leftAnkleOk && rightAnkleOk && hasHipWidth) {
        const ankleDist = Math.hypot(
            nkpts[idx.left_ankle][0] - nkpts[idx.right_ankle][0],
            nkpts[idx.left_ankle][1] - nkpts[idx.right_ankle][1]
        )
        feats.ankle_spread_norm = ankleDist / hipWidth
    }

    // --- Axis 8: Knee vertical spread normalized ---
    // Vertical distance between knees / hip width (best for side-lying)
    if (leftKneeOk && rightKneeOk && hasHipWidth) {
        const kneeVerticalDist = Math.abs(nkpts[idx.left_knee][1] - nkpts[idx.right_knee][1])
        feats.knee_vertical_spread_norm = kneeVerticalDist / hipWidth
    }

    // --- Axis 9: Ankle vertical spread normalized ---
    // Vertical distance between ankles / hip width (best for side-lying)
    if (leftAnkleOk && rightAnkleOk && hasHipWidth) {
        const ankleVerticalDist = Math.abs(nkpts[idx.left_ankle][1] - nkpts[idx.right_ankle][1])
        feats.ankle_vertical_spread_norm = ankleVerticalDist / hipWidth
    }

    // --- Axis 10: Knee-to-ankle vector length normalized ---
    // Length of the lower leg (knee to ankle) / hip width
    // Useful for tracking leg extension with normalization
    if (leftKneeOk && leftAnkleOk && hasHipWidth) {
        const legLength = Math.hypot(
            nkpts[idx.left_knee][0] - nkpts[idx.left_ankle][0],
            nkpts[idx.left_knee][1] - nkpts[idx.left_ankle][1]
        )
        feats.lower_leg_length_norm_l = legLength / hipWidth
    }
    if (rightKneeOk && rightAnkleOk && hasHipWidth) {
        const legLength = Math.hypot(
            nkpts[idx.right_knee][0] - nkpts[idx.right_ankle][0],
            nkpts[idx.right_knee][1] - nkpts[idx.right_ankle][1]
        )
        feats.lower_leg_length_norm_r = legLength / hipWidth
    }

    // --- Axis 11: Thigh (hip-to-knee) vertical position normalized ---
    // How much the knee is above/below hip level, normalized by hip width
    if (leftHipOk && leftKneeOk && hasHipWidth) {
        const kneeRelativeY = nkpts[idx.left_hip][1] - nkpts[idx.left_knee][1]
        feats.thigh_vertical_norm_l = kneeRelativeY / hipWidth
    }
    if (rightHipOk && rightKneeOk && hasHipWidth) {
        const kneeRelativeY = nkpts[idx.right_hip][1] - nkpts[idx.right_knee][1]
        feats.thigh_vertical_norm_r = kneeRelativeY / hipWidth
    }

    // --- Axis 12: Ankle vertical position relative to hip, normalized ---
    // How much the ankle is above/below hip level, normalized by hip width
    if (leftHipOk && leftAnkleOk && hasHipWidth) {
        const ankleRelativeY = nkpts[idx.left_hip][1] - nkpts[idx.left_ankle][1]
        feats.ankle_vertical_norm_l = ankleRelativeY / hipWidth
    }
    if (rightHipOk && rightAnkleOk && hasHipWidth) {
        const ankleRelativeY = nkpts[idx.right_hip][1] - nkpts[idx.right_ankle][1]
        feats.ankle_vertical_norm_r = ankleRelativeY / hipWidth
    }

    // --- Axis 13: Full leg spread (hip-to-ankle distance between legs) normalized ---
    // Total distance from left ankle to right ankle, normalized
    if (leftAnkleOk && rightAnkleOk && hasHipWidth) {
        const fullSpread = Math.hypot(
            nkpts[idx.left_ankle][0] - nkpts[idx.right_ankle][0],
            nkpts[idx.left_ankle][1] - nkpts[idx.right_ankle][1]
        )
        feats.full_leg_spread_norm = fullSpread / hipWidth
    }

    // --- Axis 14: Thigh vertical position normalized by THIGH LENGTH (more stable) ---
    // Vertical distance from knee to hip / Thigh length.
    // This is effectively sin(elevation_angle) if the user is side-lying.
    // Positive = Knee is ABOVE Hip (up).
    if (leftHipOk && leftKneeOk) {
        const dy = nkpts[idx.left_hip][1] - nkpts[idx.left_knee][1]
        const thighLen = Math.hypot(
            nkpts[idx.left_hip][0] - nkpts[idx.left_knee][0],
            nkpts[idx.left_hip][1] - nkpts[idx.left_knee][1]
        )
        if (thighLen > 1e-6) {
            feats.thigh_lift_ratio_l = dy / thighLen
        }
    }
    if (rightHipOk && rightKneeOk) {
        const dy = nkpts[idx.right_hip][1] - nkpts[idx.right_knee][1]
        const thighLen = Math.hypot(
            nkpts[idx.right_hip][0] - nkpts[idx.right_knee][0],
            nkpts[idx.right_hip][1] - nkpts[idx.right_knee][1]
        )
        if (thighLen > 1e-6) {
            feats.thigh_lift_ratio_r = dy / thighLen
        }
    }

    // --- Axis 15: Knee vertical spread normalized by THIGH LENGTH ---
    // Vertical distance between knees / Average thigh length.
    // Robust to hip stack issues.
    if (leftKneeOk && rightKneeOk && leftHipOk && rightHipOk) {
        const leftThigh = Math.hypot(
            nkpts[idx.left_hip][0] - nkpts[idx.left_knee][0],
            nkpts[idx.left_hip][1] - nkpts[idx.left_knee][1]
        )
        const rightThigh = Math.hypot(
            nkpts[idx.right_hip][0] - nkpts[idx.right_knee][0],
            nkpts[idx.right_hip][1] - nkpts[idx.right_knee][1]
        )
        const avgThigh = (leftThigh + rightThigh) / 2

        if (avgThigh > 1e-6) {
            const kneeVerticalDist = Math.abs(nkpts[idx.left_knee][1] - nkpts[idx.right_knee][1])
            feats.knee_vertical_sep_ratio = kneeVerticalDist / avgThigh
        }
    }

    return feats
}

