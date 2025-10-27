import { CheckboxSelectSize } from './types'

// Стили для размеров CheckboxSelect
export const checkboxSelectSizeStyles: Record<
	CheckboxSelectSize,
	{
		text: string
		padding: string
		iconSize: number
	}
> = {
	full: {
		text: 'text-sm font-medium', // Text/t3
		padding: 'px-4 py-8',
		iconSize: 40,
	},
	half: {
		text: 'text-sm font-medium', // Text/t3
		padding: 'px-4 py-8',
		iconSize: 24,
	},
}
