import { SelectOption } from '@/shared/types'

// Варианты размера CheckboxSelect
export type CheckboxSelectSize = 'full' | 'half'

// Опция для CheckboxSelect (используем общий тип)
export type CheckboxSelectOption = SelectOption

// Пропсы компонента CheckboxSelect
export interface CheckboxSelectProps {
	options: CheckboxSelectOption[]
	value: string[]
	onChange: (value: string[]) => void
	size?: CheckboxSelectSize
	maxSelected?: number
	minSelected?: number
	disabled?: boolean
	className?: string
}
