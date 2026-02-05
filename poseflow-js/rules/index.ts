/**
 * Exercise rules loader.
 * 
 * Uses new rule configs with support for:
 * - Multi-axis FSM
 * - Posture Guard
 * - Timing error detection
 * - Body ready state
 */
import type { ExerciseRule } from '../types'
import { getRule, getRuleOptions, ruleIds, type RuleOption } from './rulesNew'

// Re-export everything from rulesNew
export { getRule, getRuleOptions, hasRules, ruleIds } from './rulesNew'
export type { RuleOption } from './rulesNew'

// Legacy exports for backward compatibility
export { getRulesNewOptions, getRulesNewRule, hasRulesNew, rulesNewIds } from './rulesNew'
export type { RulesNewOption } from './rulesNew'

export type ExerciseOption = RuleOption

/**
 * Get all available exercise options for UI selection.
 */
export const exerciseOptions: ExerciseOption[] = getRuleOptions()

/**
 * Get exercise rule by ID or exercise name.
 * Falls back to default rule if not found.
 * 
 * @param id Exercise ID or name
 * @param currentSide Optional side for bilateral exercises
 */
export const getExerciseRule = (id: string, currentSide?: 'left' | 'right'): ExerciseRule => {
    // Try to find exact match first
    // const exactMatch = getRule(id)
    // if (exactMatch) {
    //     return exactMatch
    // }
		//
    // // Try to find by exercise name (partial match)
    // for (const ruleId of ruleIds) {
    //     if (id.includes(ruleId) || ruleId.includes(id)) {
    //         const rule = getRule(ruleId)
    //         if (rule) return rule
    //     }
    // }

    // Default fallback based on exercise type
    if (id.toLowerCase().includes('присед') || id.toLowerCase().includes('squat')) {
        // Classic squat
        return getRule('0001-pr') || getDefaultRule('squat')
    }

    if (id.toLowerCase().includes('мост') || id.toLowerCase().includes('bridge')) {
        // Hip bridge
        return getRule('0010-pr') || getDefaultRule('hip_bridge')
    }

    if (id.toLowerCase().includes('выпад') || id.toLowerCase().includes('lunge')) {
        // Lunges - use side-specific rules
        const suffix = currentSide === 'left' ? '-l' : '-r'
        return getRule(`0005-pr${suffix}`) || getDefaultRule('lunge')
    }

    if (id.toLowerCase().includes('отведение') || id.toLowerCase().includes('abduction')) {
        // Leg abduction - use side-specific rules
        const suffix = currentSide === 'left' ? '-l' : '-r'
        return getRule(`0006-pr${suffix}`) || getDefaultRule('abduction')
    }

    // Final fallback - first available rule
    const firstRule = getRule(ruleIds[0])
    if (firstRule) {
        console.warn(`[rules] No rule found for "${id}", using fallback: ${ruleIds[0]}`)
        return firstRule
    }

    // Emergency fallback - return minimal valid rule
    console.error(`[rules] No rules available! Using emergency fallback for "${id}"`)
    return getDefaultRule('fallback')
}

/**
 * Create a default rule for fallback scenarios.
 */
function getDefaultRule(type: string): ExerciseRule {
    return {
        exercise: `default_${type}`,
        axis: 'squat_knee_angle',
        thresholds: {
            down_enter: 120,
            bottom_enter: 90,
            up_enter: 140,
            top_enter: 160,
            min_dwell_ms: 100,
        },
        hysteresis: 2,
    }
}
