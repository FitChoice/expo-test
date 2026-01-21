import { router } from 'expo-router'
import type { RefreshInput, TokenResponse } from './types'
import {
	clearAuthData,
	getRefreshToken,
	saveAuthToken,
	saveRefreshToken,
} from '@/shared/lib/auth'
import { env } from '@/shared/config'

export type RefreshResult = 'ok' | 'no-refresh' | 'failed'

/**
 * Refresh access token using stored refresh token.
 * Redirects to auth on failure to keep session consistent.
 */
export const refreshAccessToken = async (): Promise<RefreshResult> => {
	const storedRefreshToken = await getRefreshToken()
	if (!storedRefreshToken) {
		await clearAuthData()
		router.replace('/auth')
		return 'no-refresh'
	}

	const payload: RefreshInput = { refresh_token: storedRefreshToken }
	try {
		const response = await fetch(`${env.API_URL}/auth/refresh`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		})

		// If refresh token is invalid/expired, treat as logout
		if (response.status === 401) {
			await clearAuthData()
			router.replace('/auth')
			return 'failed'
		}

		const contentType = response.headers.get('content-type')
		const hasJsonContent = contentType?.includes('application/json')
		const data = hasJsonContent ? ((await response.json()) as TokenResponse) : null

		if (!response.ok || !data) {
			await clearAuthData()
			router.replace('/auth')
			return 'failed'
		}

		if (data.access_token) await saveAuthToken(data.access_token)
		if (data.refresh_token) await saveRefreshToken(data.refresh_token)
		return 'ok'
	} catch {
		// Network errors: don't destroy session; let callers decide how to recover
		return 'failed'
	}
}





