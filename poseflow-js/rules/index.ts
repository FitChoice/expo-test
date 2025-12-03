import squat from '../../rules/squat.json'
import squatCalfRaise from '../../rules/squat_calf_raise.json'
import squatAssisted from '../../rules/squat_assisted.json'
import crunch from '../../rules/crunch.json'
import hipBridge from '../../rules/hip_bridge.json'
import legAbductionL from '../../rules/leg_abduction_l.json'
import legAbductionR from '../../rules/leg_abduction_r.json'
import quadrupedHipExtensionL from '../../rules/quadruped_hip_extension_l.json'
import quadrupedHipExtensionR from '../../rules/quadruped_hip_extension_r.json'
import type { ExerciseRule } from '../types'

// Preload static JSON assets so Metro can bundle them deterministically.
const RULES = {
    squat,
    squat_calf_raise: squatCalfRaise,
    squat_assisted: squatAssisted,
    crunch,
    hip_bridge: hipBridge,
    leg_abduction_l: legAbductionL,
    leg_abduction_r: legAbductionR,
    quadruped_hip_extension_l: quadrupedHipExtensionL,
    quadruped_hip_extension_r: quadrupedHipExtensionR,
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

