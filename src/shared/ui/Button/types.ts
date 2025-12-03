import { type ReactNode } from 'react'
import { type TouchableOpacityProps } from 'react-native'

// Варианты кнопок
export type ButtonVariant =
	| 'primary' // Зеленая основная кнопка
	| 'secondary' // Белая вторичная кнопка
	| 'special' // Фиолетовая специальная кнопка
	| 'tertiary' // Темная третичная кнопка
	| 'ghost' // Прозрачная ghost кнопка

// Размеры кнопок
export type ButtonSize =
	| 'xs' // Extra small (40px height)
	| 's' // Small (48px height)
	| 'l' // Large (56px height)

// Пропсы компонента Button
export interface ButtonProps extends Omit<TouchableOpacityProps, 'children'> {
	children?: ReactNode
	variant?: ButtonVariant
	size?: ButtonSize
	iconLeft?: ReactNode
	iconRight?: ReactNode
	disabled?: boolean
	iconOnly?: boolean
	fullWidth?: boolean
}
