import { useEffect, useState } from 'react'
import {
    StatusBar as RNStatusBar,
    Platform,
    Appearance,
    type ColorSchemeName,
} from 'react-native'

type StatusBarStyle = 'light' | 'dark' | 'auto'

interface UseStatusBarOptions {
	/**
	 * Стиль контента статус-бара
	 * - 'light': светлые иконки (для темного фона)
	 * - 'dark': темные иконки (для светлого фона)
	 * - 'auto': автоматически в зависимости от системной темы
	 */
	style?: StatusBarStyle
	/**
	 * Цвет фона статус-бара (только Android)
	 */
	backgroundColor?: string
	/**
	 * Показывать ли статус-бар
	 */
	hidden?: boolean
	/**
	 * Анимация при изменении (только Android)
	 */
	animated?: boolean
}

/**
 * Хук для управления статус-баром
 * Позволяет менять стиль контента и цвет фона (Android)
 */
export const useStatusBar = ({
    style = 'auto',
    backgroundColor,
    hidden = false,
    animated = true,
}: UseStatusBarOptions = {}) => {
    // Используем Appearance API для получения темы
    const [systemColorScheme, setSystemColorScheme] = useState<ColorSchemeName>(
        Appearance.getColorScheme()
    )

    useEffect(() => {
        const subscription = Appearance.addChangeListener(({ colorScheme }) => {
            setSystemColorScheme(colorScheme)
        })

        return () => subscription.remove()
    }, [])

    useEffect(() => {
        try {
            if (hidden) {
                RNStatusBar.setHidden(true, animated ? 'fade' : 'none')
                return
            }

            RNStatusBar.setHidden(false, animated ? 'fade' : 'none')

            // Определяем стиль контента
            let barStyle: 'light-content' | 'dark-content' = 'light-content'

            if (style === 'auto') {
                // По умолчанию светлые иконки, если тема не определена
                barStyle = systemColorScheme === 'dark' ? 'light-content' : 'dark-content'
            } else if (style === 'light') {
                barStyle = 'light-content'
            } else if (style === 'dark') {
                barStyle = 'dark-content'
            }

            RNStatusBar.setBarStyle(barStyle, animated)

            // На Android можно менять цвет фона
            if (Platform.OS === 'android' && backgroundColor) {
                RNStatusBar.setBackgroundColor(backgroundColor, animated)
            }
        } catch (error) {
            // Игнорируем ошибки при установке статус-бара
            console.warn('Failed to set status bar style:', error)
        }
    }, [style, backgroundColor, hidden, animated, systemColorScheme])
}
