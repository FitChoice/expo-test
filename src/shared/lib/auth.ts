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

