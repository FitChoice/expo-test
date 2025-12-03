/**
 * Утилита для получения правильного имени шрифта
 * Теперь загрузка происходит через FontLoader с официальным expo-font
 * Этот хук просто возвращает правильное имя шрифта для использования
 */
export const useFonts = () => {
    /**
	 * Получить имя шрифта с fallback
	 * @param fontName - имя шрифта
	 * @param _fallback - fallback шрифт (не используется, для обратной совместимости)
	 */
    const getFontName = (fontName: string, _fallback: string = 'system') => {
        // Всегда возвращаем имя кастомного шрифта
        // Если шрифт не загружен, система автоматически использует fallback
        return fontName
    }

    return {
        fontsLoaded: true, // Всегда true, так как загрузка происходит в FontLoader
        fontError: null,
        getFontName,
    }
}
