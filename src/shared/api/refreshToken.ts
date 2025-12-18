import { router } from 'expo-router'
import { apiClient } from './client'
import type { RefreshInput, TokenResponse } from './types'
import {
	clearAuthData,
	getRefreshToken,
	saveAuthToken,
	saveRefreshToken,
} from '@/shared/lib/auth'

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
	const result = await apiClient.post<RefreshInput, TokenResponse>(
		'/auth/refresh',
		payload,
		{ skipAuthHandler: true }
	)

	if (result.success && result.data) {
		if (result.data.access_token) {
			await saveAuthToken(result.data.access_token)
		}
		if (result.data.refresh_token) {
			await saveRefreshToken(result.data.refresh_token)
		}
		return 'ok'
	}

	await clearAuthData()
	router.replace('/auth')
	return 'failed'
}


