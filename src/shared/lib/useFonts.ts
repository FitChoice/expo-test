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
        console.log('🔄 Loading fonts...')
        console.log('📱 Platform:', Platform.OS)
        
        // Универсальный подход для всех платформ
        const fontMap = {
          'Rimma_sans': require('../../../assets/fonts/Rimma_sans.ttf'),
          'Rimma_sans-Bold': require('../../../assets/fonts/Rimma_sans.ttf'),
        }
        
        console.log('📋 Font map:', fontMap)
        console.log('📱 Platform:', Platform.OS)
        
        await Font.loadAsync(fontMap)
        
        // Проверяем, что шрифты действительно загружены
        const isFontLoaded = await Font.isLoaded('Rimma_sans')
        console.log('🔍 Font isLoaded check:', isFontLoaded)
        
        if (!isFontLoaded) {
          console.warn('⚠️ Font loaded but not available, using fallback')
        }
        
        console.log('✅ Fonts loaded successfully')
        
        // Проверяем доступность шрифтов
        try {
          const availableFonts = await Font.getAvailableFontsAsync()
          const rimmaFonts = availableFonts.filter(f => f.includes('Rimma'))
          console.log('📝 Available Rimma fonts:', rimmaFonts)
          
          if (rimmaFonts.length === 0) {
            console.warn('⚠️ Rimma fonts not found in available fonts list')
          }
        } catch (fontCheckError) {
          console.warn('⚠️ Font check failed:', fontCheckError)
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
    console.log(`🔍 getFontName called: ${fontName}, platform: ${Platform.OS}, loaded: ${fontsLoaded}, error: ${fontError}`)
    
    // На Android используем системные шрифты
    if (Platform.OS === 'android') {
      const androidFont = fallback === 'system' ? 'Roboto' : fallback
      console.log(`🤖 Android: Using system font ${androidFont} for ${fontName}`)
      return androidFont
    }
    
    if (fontsLoaded && !fontError) {
      console.log(`✅ Using custom font: ${fontName}`)
      return fontName
    }
    
    console.log(`⚠️ Using fallback font: ${fallback}`)
    return fallback
  }

  return {
    fontsLoaded,
    fontError,
    getFontName,
  }
}
