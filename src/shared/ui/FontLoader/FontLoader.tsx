import React from 'react'
import { View, Text, ActivityIndicator } from 'react-native'
import { useFonts } from '@/shared/lib'

interface FontLoaderProps {
  children: React.ReactNode
}

/**
 * Компонент для загрузки шрифтов с индикатором загрузки
 * Показывает спиннер пока шрифты не загружены
 */
export const FontLoader = ({ children }: FontLoaderProps) => {
  const { fontsLoaded, fontError } = useFonts()

  if (!fontsLoaded) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#151515'
      }}>
        <ActivityIndicator size="large" color="#8BC34A" />
        <Text style={{ 
          color: '#FFFFFF', 
          marginTop: 16,
          fontFamily: 'system'
        }}>
          Загрузка шрифтов...
        </Text>
        {fontError && (
          <Text style={{ 
            color: '#FF514F', 
            marginTop: 8,
            fontSize: 12,
            textAlign: 'center',
            fontFamily: 'system'
          }}>
            Ошибка: {fontError}
          </Text>
        )}
      </View>
    )
  }

  return <>{children}</>
}
