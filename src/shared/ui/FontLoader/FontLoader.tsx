import React, { useEffect } from 'react'
import { View, Text, ActivityIndicator } from 'react-native'
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import rimmaSansFont from '../../../../assets/fonts/Rimma_sans.ttf'
import rimmaSansAndroidFont from '../../../../assets/fonts/Rimma_sans_android.ttf'

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync()

interface FontLoaderProps {
	children: React.ReactNode
}

/**
 * Компонент для загрузки шрифтов через useFonts
 * Работает с Expo Go и Development builds
 */
export const FontLoader = ({ children }: FontLoaderProps) => {
	const [loaded, error] = useFonts({
		// На Android используем имя файла без расширения
		// На iOS используем PostScript name
		Rimma_sans_android: rimmaSansAndroidFont,
		Rimma_sans: rimmaSansFont,
	})

	useEffect(() => {
		if (loaded || error) {
			SplashScreen.hideAsync()
		}
	}, [loaded, error])

	if (!loaded && !error) {
		return null
	}

	// Показываем fallback UI только если есть ошибка
	if (error) {
		return (
			<View
				style={{
					flex: 1,
					justifyContent: 'center',
					alignItems: 'center',
					backgroundColor: '#151515',
				}}
			>
				<ActivityIndicator size="large" color="#8BC34A" />
				<Text
					style={{
						color: '#FFFFFF',
						marginTop: 16,
						fontFamily: 'System',
					}}
				>
					Загрузка...
				</Text>
				<Text
					style={{
						color: '#FF514F',
						marginTop: 8,
						fontSize: 12,
						textAlign: 'center',
						fontFamily: 'System',
					}}
				>
					Ошибка загрузки шрифтов
				</Text>
			</View>
		)
	}

	return <>{children}</>
}
