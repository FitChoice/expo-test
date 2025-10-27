import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'

/**
 * Query client configuration
 */
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			// Stale time: 5 minutes
			staleTime: 1000 * 60 * 5,
			// Cache time: 10 minutes
			gcTime: 1000 * 60 * 10,
			// Retry failed requests 3 times
			retry: 3,
			// Don't refetch on window focus by default
			refetchOnWindowFocus: false,
		},
	},
})

interface QueryProviderProps {
	children: ReactNode
}

/**
 * TanStack Query provider for server state management
 */
export const QueryProvider = ({ children }: QueryProviderProps) => {
	return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

export default QueryProvider
