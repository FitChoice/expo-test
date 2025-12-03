/**
 * Survey data validation
 */

import { type SurveyData } from '../model/types'

/**
 * Validate survey data
 */
export function validateSurveyData(data: Partial<SurveyData>): boolean {
    if (data.name && data.name.length < 2) return false
    if (data.height && (data.height < 100 || data.height > 250)) return false
    if (data.weight && (data.weight < 30 || data.weight > 300)) return false
    return true
}
