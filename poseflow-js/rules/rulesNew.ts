/**
 * Loader for exercise rule configs from rules directory.
 *
 * Direct static imports for reliability.
 * Uses exerciseLabels.json for human-readable Russian names in UI.
 */
import type { ExerciseRule } from '../types'

// Import label mapping for human-readable names
import exerciseLabels from '../../rules/exerciseLabels.json'

// Direct static import of rule configs
// Add new configs here as they are added to rules/
import pr_0001 from '../../rules/0001-pr.json'
import pr_0002 from '../../rules/0002-pr.json'
import pr_0005_l from '../../rules/0005-pr-l.json'
import pr_0005_r from '../../rules/0005-pr-r.json'
import pr_0006_l from '../../rules/0006-pr-l.json'
import pr_0006_r from '../../rules/0006-pr-r.json'
import pr_0009_l from '../../rules/0009-pr-l.json'
import pr_0009_r from '../../rules/0009-pr-r.json'
import pr_0010 from '../../rules/0010-pr.json'
import pr_0011 from '../../rules/0011-pr.json'
import pr_0012 from '../../rules/0012-pr.json'
import pr_0112 from '../../rules/0112-pr.json'
import pr_0113 from '../../rules/0113-pr.json'
import pr_0114_l from '../../rules/0114-pr-l.json'
import pr_0114_r from '../../rules/0114-pr-r.json'
import pr_0115_l from '../../rules/0115-pr-l.json'
import pr_0115_r from '../../rules/0115-pr-r.json'
import pr_0121_l from '../../rules/0121-pr-l.json'
import pr_0121_r from '../../rules/0121-pr-r.json'
import pr_0122 from '../../rules/0122-pr.json'

// All rule configs
const RULES: Record<string, ExerciseRule> = {
  '0001-pr': pr_0001 as ExerciseRule,
  '0002-pr': pr_0002 as ExerciseRule,
  '0005-pr-l': pr_0005_l as ExerciseRule,
  '0005-pr-r': pr_0005_r as ExerciseRule,
  '0006-pr-l': pr_0006_l as ExerciseRule,
  '0006-pr-r': pr_0006_r as ExerciseRule,
  '0009-pr-l': pr_0009_l as ExerciseRule,
  '0009-pr-r': pr_0009_r as ExerciseRule,
  '0010-pr': pr_0010 as ExerciseRule,
  '0011-pr': pr_0011 as ExerciseRule,
  '0012-pr': pr_0012 as ExerciseRule,
  '0112-pr': pr_0112 as ExerciseRule,
  '0113-pr': pr_0113 as ExerciseRule,
  '0114-pr-l': pr_0114_l as ExerciseRule,
  '0114-pr-r': pr_0114_r as ExerciseRule,
  '0115-pr-l': pr_0115_l as ExerciseRule,
  '0115-pr-r': pr_0115_r as ExerciseRule,
  '0121-pr-l': pr_0121_l as ExerciseRule,
  '0121-pr-r': pr_0121_r as ExerciseRule,
  '0122-pr': pr_0122 as ExerciseRule,
}

// Debug: log loaded rules
console.log('[rules] Loaded configs:', Object.keys(RULES))

export interface RuleOption {
  id: string
  label: string
  rule: ExerciseRule
}

// Type for the labels JSON (Record<string, string> with $comment)
const labelMap = exerciseLabels as Record<string, string>

/**
 * Get human-readable label for config ID.
 * First checks exerciseLabels.json, then falls back to formatLabel().
 */
function getLabelForId(id: string): string {
  // Check if there's a mapping in exerciseLabels.json
  if (labelMap[id] && id !== '$comment') {
    return labelMap[id]
  }
  // Fall back to auto-generated label
  return formatLabel(id)
}

/**
 * Get all available rule configs.
 * Uses exerciseLabels.json for human-readable Russian names.
 */
export function getRuleOptions(): RuleOption[] {
  return Object.entries(RULES).map(([id, rule]) => ({
    id,
    label: getLabelForId(id),
    rule
  }))
}

/**
 * Get a specific rule by ID.
 */
export function getRule(id: string): ExerciseRule | null {
  return RULES[id] || null
}

/**
 * Check if rules are loaded.
 */
export function hasRules(): boolean {
  return Object.keys(RULES).length > 0
}

/**
 * Format ID into human-readable label.
 */
function formatLabel(id: string): string {
  // Remove numeric prefix like "0001-"
  let label = id.replace(/^\d+-/, '')

  // Remove "pr" suffix
  label = label.replace(/^pr-?/, '')

  // Replace hyphens with spaces
  label = label.replace(/-/g, ' ')

  // Capitalize first letter
  return label.charAt(0).toUpperCase() + label.slice(1)
}

// Export for debugging
export const ruleIds = Object.keys(RULES)

// Legacy exports for backward compatibility
export const getRulesNewOptions = getRuleOptions
export const getRulesNewRule = getRule
export const hasRulesNew = hasRules
export const rulesNewIds = ruleIds
export type RulesNewOption = RuleOption
