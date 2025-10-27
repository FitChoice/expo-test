/**
 * Shared UI types used across different layers
 */

import { ReactNode } from 'react'

/**
 * Generic select option type
 * Used by RadioSelect, CheckboxSelect and other selection components
 */
export interface SelectOption {
	value: string
	label: string
	icon?: ReactNode
}
