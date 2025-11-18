/**
 * Auth utility functions
 */

import * as SecureStore from 'expo-secure-store'

/**
 * Get user ID from SecureStore
 * @returns User ID or null if not found
 */
export const getUserId = async (): Promise<number | null> => {
	try {
		const userId = await SecureStore.getItemAsync('user_id')
		return userId ? parseInt(userId, 10) : null
	} catch (error) {
		console.error('Failed to get user ID:', error)
		return null
	}
}

/**
 * Save user ID to SecureStore
 * @param userId - User ID to save
 */
export const saveUserId = async (userId: number): Promise<void> => {
	try {
		await SecureStore.setItemAsync('user_id', userId.toString())
	} catch (error) {
		console.error('Failed to save user ID:', error)
	}
}

/**
 * Clear user ID from SecureStore
 */
export const clearUserId = async (): Promise<void> => {
	try {
		await SecureStore.deleteItemAsync('user_id')
	} catch (error) {
		console.error('Failed to clear user ID:', error)
	}
}

/**
 * Save auth token to SecureStore
 * @param token - Auth token to save
 */
export const saveAuthToken = async (token: string): Promise<void> => {
	try {
		await SecureStore.setItemAsync('auth_token', token)
	} catch (error) {
		console.error('Failed to save auth token:', error)
	}
}

/**
 * Get auth token from SecureStore
 * @returns Auth token or null if not found
 */
export const getAuthToken = async (): Promise<string | null> => {
	try {
		return await SecureStore.getItemAsync('auth_token')
	} catch (error) {
		console.error('Failed to get auth token:', error)
		return null
	}
}

/**
 * Clear auth token from SecureStore
 */
export const clearAuthToken = async (): Promise<void> => {
	try {
		await SecureStore.deleteItemAsync('auth_token')
	} catch (error) {
		console.error('Failed to clear auth token:', error)
	}
}

/**
 * Save refresh token to SecureStore
 * @param refreshToken - Refresh token to save
 */
export const saveRefreshToken = async (refreshToken: string): Promise<void> => {
	try {
		await SecureStore.setItemAsync('refresh_token', refreshToken)
	} catch (error) {
		console.error('Failed to save refresh token:', error)
	}
}

/**
 * Clear all auth data from SecureStore
 */
export const clearAuthData = async (): Promise<void> => {
	await Promise.all([clearUserId(), clearAuthToken()])
}

