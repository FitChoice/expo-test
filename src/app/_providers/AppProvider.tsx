import { ReactNode } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { QueryProvider } from './QueryProvider'
import { FontLoader } from '@/shared/ui'

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
	return (
		<SafeAreaProvider>
			<FontLoader>
				<QueryProvider>
					{children}
				</QueryProvider>
			</FontLoader>
		</SafeAreaProvider>
	)
}

export default AppProvider

