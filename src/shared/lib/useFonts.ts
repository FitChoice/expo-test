import { useEffect, useState } from 'react'
import { Platform } from 'react-native'
import * as Font from 'expo-font'

/**
 * Хук для проверки загрузки шрифтов
 * Возвращает состояние загрузки и функцию для получения имени шрифта с fallback
 */
export const useFonts = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false)
  const [fontError, setFontError] = useState<string | null>(null)

  useEffect(() => {
    const loadFonts = async () => {
      try {
        // Универсальный подход для всех платформ
        const fontMap = {
          'Rimma_sans': require('../../../assets/fonts/Rimma_sans.ttf'),
          'Rimma_sans-Bold': require('../../../assets/fonts/Rimma_sans.ttf'),
        }
        
        await Font.loadAsync(fontMap)
        
        // Проверяем, что шрифты действительно загружены
        const isFontLoaded = await Font.isLoaded('Rimma_sans')
        
        // Проверяем доступность шрифтов
        try {
          const availableFonts = await Font.getAvailableFontsAsync()
          const rimmaFonts = availableFonts.filter(f => f.includes('Rimma'))
        } catch (fontCheckError) {
          // Игнорируем ошибки проверки шрифтов
        }
        
        setFontsLoaded(true)
      } catch (error) {
        console.error('❌ Font loading failed:', error)
        console.error('❌ Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        })
        setFontError(error instanceof Error ? error.message : 'Unknown error')
        // Продолжаем работу даже если шрифт не загрузился
        setFontsLoaded(true)
      }
    }

    loadFonts()
  }, [])

  /**
   * Получить имя шрифта с fallback
   * @param fontName - имя шрифта
   * @param fallback - fallback шрифт (по умолчанию 'system')
   */
  const getFontName = (fontName: string, fallback: string = 'system') => {
    // На Android используем системные шрифты
    if (Platform.OS === 'android') {
      const androidFont = fallback === 'system' ? 'Roboto' : fallback
      return androidFont
    }
    
    if (fontsLoaded && !fontError) {
      return fontName
    }
    
    return fallback
  }

  return {
    fontsLoaded,
    fontError,
    getFontName,
  }
}
