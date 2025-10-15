import { ReactNode, useEffect, useState } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import * as Font from 'expo-font'
import { QueryProvider } from './QueryProvider'

interface AppProviderProps {
	children: ReactNode
}

/**
 * Main application provider that wraps all other providers
 * Includes:
 * - SafeAreaProvider for safe area handling
 * - QueryProvider for TanStack Query (server state)
 */
export const AppProvider = ({ children }: AppProviderProps) => {
	const [fontsLoaded, setFontsLoaded] = useState(false)

	useEffect(() => {
		const loadFonts = async () => {
			try {
				await Font.loadAsync({
					'Rimma_sans': require('../../../assets/fonts/Rimma_sans.ttf'),
					'Rimma_sans-Bold': require('../../../assets/fonts/Rimma_sans.ttf'),
				})
				setFontsLoaded(true)
			} catch (error) {
				console.warn('Font loading error:', error)
				setFontsLoaded(true) // Continue even if font fails to load
			}
		}

		loadFonts()
	}, [])

	if (!fontsLoaded) {
		return null // Or a loading screen
	}

	return (
		<SafeAreaProvider>
			<QueryProvider>
				{children}
			</QueryProvider>
		</SafeAreaProvider>
	)
}

export default AppProvider

