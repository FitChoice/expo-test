import { type ButtonVariant, type ButtonSize } from './types'

// Стили для вариантов кнопок
export const buttonVariantStyles: Record<
	ButtonVariant,
	{
		default: string
		pressed: string
		disabled: string
		textDefault: string
		textPressed: string
		textDisabled: string
		iconDefault: string
		iconPressed: string
		iconDisabled: string
	}
> = {
	primary: {
		default: 'bg-brand-green-500',
		pressed: 'bg-brand-green-900',
		disabled: 'bg-brand-green-500 opacity-50',
		textDefault: 'text-light-text-900',
		textPressed: 'text-light-text-900',
		textDisabled: 'text-light-text-900',
		iconDefault: '#161616',
		iconPressed: '#161616',
		iconDisabled: '#161616',
	},
	secondary: {
		default: 'bg-color-pure-white',
		pressed: 'bg-fill-300',
		disabled: 'bg-fill-200 opacity-50',
		textDefault: 'text-light-text-900',
		textPressed: 'text-light-text-900',
		textDisabled: 'text-light-text-900',
		iconDefault: '#161616',
		iconPressed: '#161616',
		iconDisabled: '#161616',
	},
	special: {
		default: 'bg-brand-purple-500',
		pressed: 'bg-brand-purple-900',
		disabled: 'bg-brand-purple-300 opacity-50',
		textDefault: 'text-color-pure-white',
		textPressed: 'text-color-pure-white',
		textDisabled: 'text-color-pure-white',
		iconDefault: '#FFFFFF',
		iconPressed: '#FFFFFF',
		iconDisabled: '#FFFFFF',
	},
	tertiary: {
		default: 'bg-fill-700',
		pressed: 'bg-fill-800',
		disabled: 'bg-fill-700 opacity-50',
		textDefault: 'text-color-pure-white',
		textPressed: 'text-color-pure-white',
		textDisabled: 'text-light-text-200',
		iconDefault: '#FFFFFF',
		iconPressed: '#FFFFFF',
		iconDisabled: '#C1C1C1',
	},
	ghost: {
		default: 'bg-transparent',
		pressed: 'bg-fill-200',
		disabled: 'bg-transparent opacity-50',
		textDefault: 'text-light-text-500',
		textPressed: 'text-light-text-900',
		textDisabled: 'text-light-text-200',
		iconDefault: '#949494',
		iconPressed: '#161616',
		iconDisabled: '#C1C1C1',
	},
}

// Стили для размеров кнопок
export const buttonSizeStyles: Record<
	ButtonSize,
	{
		container: string
		text: string
		icon: number
		padding: string
		paddingIconLeft: string
		paddingIconRight: string
		paddingIconOnly: string
	}
> = {
	xs: {
		container: 'h-10 min-h-[40px] rounded-2xl',
		text: 'text-t3 font-medium',
		icon: 20,
		padding: 'px-6 py-2',
		paddingIconLeft: 'pl-4 pr-6 py-2',
		paddingIconRight: 'pl-6 pr-4 py-2',
		paddingIconOnly: 'p-2',
	},
	s: {
		container: 'h-12 min-h-[48px] rounded-2xl',
		text: 'text-t2-bold',
		icon: 24,
		padding: 'px-6 py-2',
		paddingIconLeft: 'pl-4 pr-6 py-2',
		paddingIconRight: 'pl-6 pr-4 py-2',
		paddingIconOnly: 'p-2',
	},
	m: {
		container: 'h-13 min-h-[52px] rounded-2xl',
		text: 'text-t2-bold',
		icon: 28,
		padding: 'px-6 py-2',
		paddingIconLeft: 'pl-4 pr-6 py-2',
		paddingIconRight: 'pl-6 pr-4 py-2',
		paddingIconOnly: 'p-2',
	},
	l: {
		container: 'h-14 min-h-[56px] rounded-2xl',
		text: 'text-t2-bold',
		icon: 32,
		padding: 'px-6 py-2',
		paddingIconLeft: 'pl-4 pr-6 py-2',
		paddingIconRight: 'pl-6 pr-4 py-2',
		paddingIconOnly: 'p-2',
	},
}

// Базовые стили кнопки
export const baseButtonStyles = 'flex-row items-center justify-center gap-2'

// Базовые стили текста кнопки
export const baseButtonTextStyles = 'font-inter font-semibold'
