import { type ReactNode } from 'react'
import {
    type TextInputProps,
    type ViewStyle,
    type ImageSourcePropType,
} from 'react-native'
import { type IconName } from '../Icon/types'

// Типы: text, password, dropdown, textarea
export type InputVariant = 'text' | 'password' | 'dropdown' | 'textarea'

// Состояния: default, focused, error, disabled
export type InputState = 'default' | 'focused' | 'error' | 'disabled'

// Размеры: default (16px radius), settings (8px radius)
export type InputSize = 'default' | 'settings'

// Пропсы компонента Input
// Используем TextInputProps напрямую без переопределения onFocus/onBlur
export interface InputProps extends Omit<TextInputProps, 'style'> {
	variant?: InputVariant
	size?: InputSize
	label?: string
	error?: string
	helperText?: string
	forceHelperText?: boolean
	leftIcon?: ReactNode | IconName
	rightIcon?: ReactNode | IconName
	leftImage?: ImageSourcePropType
	forgotPassword?: boolean
	onForgotPassword?: () => void
	showTooltip?: boolean
	disabled?: boolean
	dropdownOptions?: Array<{ label: string; value: string }>
	onDropdownSelect?: (value: string) => void
	containerStyle?: ViewStyle
	className?: string
	inputClassName?: string
	labelClassName?: string
}
