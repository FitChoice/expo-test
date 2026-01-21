/**
 * Survey entity - business logic and data types only
 */

// Types
export type {
	SurveyData,
	Gender,
	AgeGroup,
	DayOfWeek,
	Frequency,
	Goal,
	Direction,
} from './model/types'

// Business logic
export { calculateBMI, getBMICategory, type BMICategory } from './lib/calculator'

export { validateSurveyData } from './lib/validator'
export {
	daysToMasks,
	masksToDays,
	goalsToMasks,
	masksToGoals,
	dayBitmaskToMasks,
	goalBitmaskToMasks,
	masksToNumber,
} from './lib/converters'

// Constants (UI options for forms)
export {
	GENDER_OPTIONS,
	DAYS_OF_WEEK_OPTIONS,
	FREQUENCY_OPTIONS,
	GOAL_OPTIONS,
	DIRECTION_OPTIONS,
	AGE_GROUP_OPTIONS,
} from './config/constants'
