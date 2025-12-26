import squat from '../../rules/squat.json'
import squatCalfRaise from '../../rules/squat_calf_raise.json'
import squatAssisted from '../../rules/squat_assisted.json'
import squatGluteus from '../../rules/squat_gluteus.json'
import crunch from '../../rules/crunch.json'
import hipBridge from '../../rules/hip_bridge.json'
import hipBridgeRubber from '../../rules/hip_bridge_rubber.json'
import hipBridgeFromHill from '../../rules/hip_bridge_from_hill.json'
import hipBridgeFromHillOnLegL from '../../rules/hip_bridge_from_hill_on_leg_l.json'
import hipBridgeFromHillOnLegR from '../../rules/hip_bridge_from_hill_on_leg_r.json'
import legAbductionL from '../../rules/leg_abduction_l.json'
import legAbductionR from '../../rules/leg_abduction_r.json'
import quadrupedHipExtensionL from '../../rules/quadruped_hip_extension_l.json'
import quadrupedHipExtensionR from '../../rules/quadruped_hip_extension_r.json'
import quadrupedBackHipExtensionL from '../../rules/quadruped_back_hip_extension_l.json'
import quadrupedBackHipExtensionR from '../../rules/quadruped_back_hip_extension_r.json'
import quadrupedSideHipExtensionL from '../../rules/quadruped_side_hip_extension_l.json'
import quadrupedSideHipExtensionR from '../../rules/quadruped_side_hip_extension_r.json'
import hipExtensionFloorL from '../../rules/hip_extension_floor_l.json'
import hipExtensionFloorR from '../../rules/hip_extension_floor_r.json'
import reverseLundgeL from '../../rules/reverse_lundge_l.json'
import reverseLundgeR from '../../rules/reverse_lundge_r.json'
import bulgarianSplitSquatsL from '../../rules/bulgarian_split_squats_l.json'
import bulgarianSplitSquatsR from '../../rules/bulgarian_split_squats_r.json'
import bulgarianSplitSquatsRubberL from '../../rules/bulgarian_split_squats_rubber_l.json'
import bulgarianSplitSquatsRubberR from '../../rules/bulgarian_split_squats_rubber_r.json'
import butterfly from '../../rules/butterfly.json'
import armsRotateOnStomach from '../../rules/arms_rotate_on_stomach.json'
import shoulderBladeRotation from '../../rules/shoulder_blade_rotation.json'
import breastStretch from '../../rules/breast_stretch.json'
import horizontalThrust from '../../rules/horizontal_thrust.json'
import hipSwingsL from '../../rules/hip_swings_l.json'
// Pigeon pose exercises
import pigeonPoseHold from '../../rules/pigeon_pose_hold.json'
import pigeonPoseHoldL from '../../rules/pigeon_pose_hold_l.json'
import pigeonPoseBendsToLegL from '../../rules/pigeon_pose_bends_to_leg_l.json'
import pigeonPoseBendsToLegR from '../../rules/pigeon_pose_bends_to_leg_r.json'
import pigeonPoseBendBodyThroughWaveL from '../../rules/pigeon_pose_bend_body_through_wave_l.json'
import pigeonPoseBendBodyThroughWaveR from '../../rules/pigeon_pose_bend_body_through_wave_r.json'
import pigeonPoseLeanOnElbowsL from '../../rules/pigeon_pose_lean_on_elbows_l.json'
import pigeonPoseLeanOnElbowsR from '../../rules/pigeon_pose_lean_on_elbows_r.json'
import pigeonPoseStretchFrontThigh from '../../rules/pigeon_pose_stretch_front_thigh.json'
import pigeonPoseStretchBackThigh from '../../rules/pigeon_pose_stretch_back_thigh.json'
import pigeonPoseHipMobility from '../../rules/pigeon_pose_hip_mobility.json'
import type { ExerciseRule } from '../types'

// Preload static JSON assets so Metro can bundle them deterministically.
const RULES = {
    squat,
    squat_calf_raise: squatCalfRaise,
    squat_assisted: squatAssisted,
    squat_gluteus: squatGluteus,
    crunch,
    hip_bridge: hipBridge,
    hip_bridge_rubber: hipBridgeRubber,
    hip_bridge_from_hill: hipBridgeFromHill,
    hip_bridge_from_hill_on_leg_l: hipBridgeFromHillOnLegL,
    hip_bridge_from_hill_on_leg_r: hipBridgeFromHillOnLegR,
    leg_abduction_l: legAbductionL,
    leg_abduction_r: legAbductionR,
    quadruped_hip_extension_l: quadrupedHipExtensionL,
    quadruped_hip_extension_r: quadrupedHipExtensionR,
    quadruped_back_hip_extension_l: quadrupedBackHipExtensionL,
    quadruped_back_hip_extension_r: quadrupedBackHipExtensionR,
    quadruped_side_hip_extension_l: quadrupedSideHipExtensionL,
    quadruped_side_hip_extension_r: quadrupedSideHipExtensionR,
    hip_extension_floor_l: hipExtensionFloorL,
    hip_extension_floor_r: hipExtensionFloorR,
    reverse_lundge_l: reverseLundgeL,
    reverse_lundge_r: reverseLundgeR,
    bulgarian_split_squats_l: bulgarianSplitSquatsL,
    bulgarian_split_squats_r: bulgarianSplitSquatsR,
    bulgarian_split_squats_rubber_l: bulgarianSplitSquatsRubberL,
    bulgarian_split_squats_rubber_r: bulgarianSplitSquatsRubberR,
    butterfly,
    arms_rotate_on_stomach: armsRotateOnStomach,
    shoulder_blade_rotation: shoulderBladeRotation,
    breast_stretch: breastStretch,
    horizontal_thrust: horizontalThrust,
    hip_swings_l: hipSwingsL,
    // Pigeon pose exercises
    pigeon_pose_hold: pigeonPoseHold,
    pigeon_pose_hold_l: pigeonPoseHoldL,
    pigeon_pose_bends_to_leg_l: pigeonPoseBendsToLegL,
    pigeon_pose_bends_to_leg_r: pigeonPoseBendsToLegR,
    pigeon_pose_bend_body_through_wave_l: pigeonPoseBendBodyThroughWaveL,
    pigeon_pose_bend_body_through_wave_r: pigeonPoseBendBodyThroughWaveR,
    pigeon_pose_lean_on_elbows_l: pigeonPoseLeanOnElbowsL,
    pigeon_pose_lean_on_elbows_r: pigeonPoseLeanOnElbowsR,
    pigeon_pose_stretch_front_thigh: pigeonPoseStretchFrontThigh,
    pigeon_pose_stretch_back_thigh: pigeonPoseStretchBackThigh,
    pigeon_pose_hip_mobility: pigeonPoseHipMobility,
} satisfies Record<string, ExerciseRule>

export type ExerciseOption = {
    id: string
    label: string
}

export const exerciseOptions: ExerciseOption[] = Object.keys(RULES).map((id) => ({
    id,
    label: toLabel(id),
}))

export const getExerciseRule = (id: string): ExerciseRule => {
    if (id in RULES) {
        return RULES[id as keyof typeof RULES]
    }
    return RULES.squat
}

function toLabel(value: string): string {
    return value
        .split('_')
        .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
        .join(' ')
}

