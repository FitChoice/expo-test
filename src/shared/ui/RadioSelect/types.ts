import { type SelectOption } from '@/shared/types'

// Варианты размера RadioSelect
export type RadioSelectSize = 'full' | 'half' | 'small'

// Опция для RadioSelect (используем общий тип)
export type RadioSelectOption = SelectOption

// Пропсы компонента RadioSelect
export interface RadioSelectProps {
	options: RadioSelectOption[]
	value: string | null
	onChange: (value: string) => void
	size?: RadioSelectSize
	disabled?: boolean
	className?: string
	isNeedCheckbox?: boolean
}
