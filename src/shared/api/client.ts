/**
 * API client for HTTP requests
 */

import * as SecureStore from 'expo-secure-store'
import { router } from 'expo-router'
import { ApiResult } from './types'
import { env } from '@/shared/config'

const API_BASE_URL = env.API_URL

/**
 * API client configuration
 */
class ApiClient {
	private baseUrl: string

	constructor(baseUrl: string) {
		this.baseUrl = baseUrl
	}

	/**
	 * Get authorization headers from secure storage
	 */
	private async getAuthHeaders(): Promise<Record<string, string>> {
		const token = await SecureStore.getItemAsync('auth_token')
		return token ? { Authorization: `Bearer ${token}` } : {}
	}

	/**
	 * Handle unauthorized response (401)
	 */
	private async handleUnauthorized(): Promise<void> {
		await SecureStore.deleteItemAsync('auth_token')
		// Redirect to auth screen
		router.replace('/auth')
	}

	/**
	 * Perform POST request
	 */
	async post<TRequest, TResponse>(
		endpoint: string,
		data: TRequest
	): Promise<ApiResult<TResponse>> {
		const authHeaders = await this.getAuthHeaders()

		try {
			const response = await fetch(`${this.baseUrl}${endpoint}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					...authHeaders,
				},
				body: JSON.stringify(data),
			})

			// Handle 401 - unauthorized
			if (response.status === 401) {
				await this.handleUnauthorized()
				return { success: false, error: 'Unauthorized' }
			}

			// Check if response has content
			const contentType = response.headers.get('content-type')
			const hasJsonContent = contentType?.includes('application/json')

			let responseData: unknown = null

			if (hasJsonContent) {
				try {
					responseData = await response.json()
				} catch (jsonError) {
					console.error('Failed to parse JSON response:', jsonError)
					const text = await response.text()
					return {
						success: false,
						error: `Ошибка сервера: ${response.status}`,
					}
				}
			} else {
				// For successful responses, non-JSON content is acceptable (e.g., 204 No Content, plain text success)
				// Only log as error for non-successful responses
				if (!response.ok) {
					const text = await response.text()
					console.error('Non-JSON response for error status:', text)
				}
			}

			if (!response.ok) {
				// Handle error response
				const errorMessage =
					responseData && typeof responseData === 'object' && 'error' in responseData
						? String(responseData.error)
						: `Ошибка сервера: ${response.status}`

				return {
					success: false,
					error: errorMessage,
				}
			}

			return {
				success: true,
				data: responseData as TResponse,
			}
		} catch (err) {
			// Handle network errors
			const errorMessage = err instanceof Error ? err.message : 'Ошибка сети'
			console.error('API request failed:', err)

			return {
				success: false,
				error: errorMessage,
			}
		}
	}

	/**
	 * Perform GET request
	 */
	async get<TResponse>(endpoint: string): Promise<ApiResult<TResponse>> {
		const authHeaders = await this.getAuthHeaders()

		try {
			const response = await fetch(`${this.baseUrl}${endpoint}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					...authHeaders,
				},
			})

			// Handle 401 - unauthorized
			if (response.status === 401) {
				await this.handleUnauthorized()
				return { success: false, error: 'Unauthorized' }
			}

			// Check if response has content
			const contentType = response.headers.get('content-type')
			const hasJsonContent = contentType?.includes('application/json')

			let responseData: unknown = null

			if (hasJsonContent) {
				try {
					responseData = await response.json()
				} catch (jsonError) {
					console.error('Failed to parse JSON response:', jsonError)
					const text = await response.text()
					return {
						success: false,
						error: `Ошибка сервера: ${response.status}`,
					}
				}
			} else {
				// For successful responses, non-JSON content is acceptable (e.g., 204 No Content, plain text success)
				// Only log as error for non-successful responses
				if (!response.ok) {
					const text = await response.text()
					console.error('Non-JSON response for error status:', text)
				}
			}

			if (!response.ok) {
				const errorMessage =
					responseData && typeof responseData === 'object' && 'error' in responseData
						? String(responseData.error)
						: `Ошибка сервера: ${response.status}`

				return {
					success: false,
					error: errorMessage,
				}
			}

			return {
				success: true,
				data: responseData as TResponse,
			}
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Ошибка сети'
			console.error('API request failed:', err)

			return {
				success: false,
				error: errorMessage,
			}
		}
	}

	/**
	 * Perform PATCH request
	 */
	async patch<TRequest, TResponse>(
		endpoint: string,
		data: TRequest
	): Promise<ApiResult<TResponse>> {
		const authHeaders = await this.getAuthHeaders()

		try {
			const response = await fetch(`${this.baseUrl}${endpoint}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					...authHeaders,
				},
				body: JSON.stringify(data),
			})

			// Handle 401 - unauthorized
			if (response.status === 401) {
				await this.handleUnauthorized()
				return { success: false, error: 'Unauthorized' }
			}

			// Check if response has content
			const contentType = response.headers.get('content-type')
			const hasJsonContent = contentType?.includes('application/json')

			let responseData: unknown = null

			if (hasJsonContent) {
				try {
					responseData = await response.json()
				} catch (jsonError) {
					console.error('Failed to parse JSON response:', jsonError)
					const text = await response.text()
					return {
						success: false,
						error: `Ошибка сервера: ${response.status}`,
					}
				}
			} else {
				// For successful responses, non-JSON content is acceptable (e.g., 204 No Content, plain text success)
				// Only log as error for non-successful responses
				if (!response.ok) {
					const text = await response.text()
					console.error('Non-JSON response for error status:', text)
				}
			}

			if (!response.ok) {
				// Handle error response
				const errorMessage =
					responseData && typeof responseData === 'object' && 'error' in responseData
						? String(responseData.error)
						: `Ошибка сервера: ${response.status}`

				return {
					success: false,
					error: errorMessage,
				}
			}

			return {
				success: true,
				data: responseData as TResponse,
			}
		} catch (err) {
			// Handle network errors
			const errorMessage = err instanceof Error ? err.message : 'Ошибка сети'
			console.error('API request failed:', err)

			return {
				success: false,
				error: errorMessage,
			}
		}
	}
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL)
