import type { ReactNode } from 'react'
import type { ViewStyle } from 'react-native'

export interface GlowButtonProps {
	/**
	 * Контент кнопки (обычно текст, но может быть любой компонент)
	 */
	children: ReactNode

	/**
	 * Выбрана ли кнопка
	 */
	isSelected: boolean

	/**
	 * Обработчик нажатия
	 */
	onPress: () => void

	/**
	 * Отключена ли кнопка
	 */
	disabled?: boolean

	/**
	 * Дополнительные стили контейнера
	 */
	style?: ViewStyle

	/**
	 * Дополнительные стили для контента
	 */
	contentStyle?: ViewStyle
}
