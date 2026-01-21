/**
 * API client for HTTP requests
 */

import * as SecureStore from 'expo-secure-store'
import { router } from 'expo-router'
import { type ApiResult } from './types'
import { env } from '@/shared/config'
import { clearAuthData, getRefreshToken } from '@/shared/lib/auth'
import { refreshAccessToken, type RefreshResult } from './refreshToken'

const API_BASE_URL = env.API_URL

let refreshInFlight: Promise<RefreshResult> | null = null

const singleFlightRefresh = async (): Promise<RefreshResult> => {
	if (!refreshInFlight) {
		refreshInFlight = refreshAccessToken().finally(() => {
			refreshInFlight = null
		})
	}
	return refreshInFlight
}

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
		await clearAuthData()
		// Redirect to auth screen
		router.replace('/auth')
	}

	private async request<TResponse>(
		method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE',
		endpoint: string,
		data?: unknown,
		options?: { skipAuthHandler?: boolean }
	): Promise<ApiResult<TResponse>> {
		const doFetch = async () => {
			const authHeaders = await this.getAuthHeaders()
			return fetch(`${this.baseUrl}${endpoint}`, {
				method,
				headers: {
					'Content-Type': 'application/json',
					...authHeaders,
				},
				body: data === undefined || method === 'GET' || method === 'DELETE' ? undefined : JSON.stringify(data),
			})
		}

		try {
			let response = await doFetch()

			// Handle 401 with refresh+retry (unless explicitly skipped)
			if (response.status === 401 && !options?.skipAuthHandler) {
				const refreshResult = await singleFlightRefresh()

				if (refreshResult === 'ok') {
					// Retry original request once with refreshed token
					response = await doFetch()
				} else {
					// If refresh flow already cleared tokens (no refresh / invalid refresh), force logout.
					// Otherwise treat as transient (e.g., network) and don't destroy session.
					const stillHasRefreshToken = await getRefreshToken()
					if (!stillHasRefreshToken) {
						await this.handleUnauthorized()
					}
					return { success: false, error: 'Unauthorized' }
				}
			}

			// Read response body as text first (can only be read once)
			const responseText = await response.text()
			const contentType = response.headers.get('content-type')
			const hasJsonContent = contentType?.includes('application/json')

			let responseData: unknown = null
			if (hasJsonContent && responseText) {
				try {
					responseData = JSON.parse(responseText)
				} catch (jsonError) {
					console.error('Failed to parse JSON response:', jsonError)
					return { success: false, error: `Ошибка сервера: ${response.status}` }
				}
			}

			if (!response.ok) {
				const errorMessage =
					responseData && typeof responseData === 'object' && 'error' in responseData
						? String((responseData as { error?: unknown }).error)
						: responseText || `Ошибка сервера: ${response.status}`

				return { success: false, error: errorMessage }
			}

			return { success: true, data: responseData as TResponse }
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Ошибка сети'
			console.error('API request failed:', err)
			return { success: false, error: errorMessage }
		}
	}

	/**
	 * Perform POST request
	 */
	async post<TRequest, TResponse>(
		endpoint: string,
		data: TRequest,
		options?: { skipAuthHandler?: boolean }
	): Promise<ApiResult<TResponse>> {
		return this.request<TResponse>('POST', endpoint, data, options)
	}

	/**
	 * Perform PATCH request
	 */
	async patch<TRequest, TResponse>(
		endpoint: string,
		data: TRequest,
		options?: { skipAuthHandler?: boolean }
	): Promise<ApiResult<TResponse>> {
		return this.request<TResponse>('PATCH', endpoint, data, options)
	}

	/**
	 * Perform PUT request
	 */
	async put<TRequest, TResponse>(
		endpoint: string,
		data?: TRequest,
		options?: { skipAuthHandler?: boolean }
	): Promise<ApiResult<TResponse>> {
		return this.request<TResponse>('PUT', endpoint, data, options)
	}

	/**
	 * Perform DELETE request
	 */
	async delete<TResponse>(
		endpoint: string,
		options?: { skipAuthHandler?: boolean }
	): Promise<ApiResult<TResponse>> {
		return this.request<TResponse>('DELETE', endpoint, undefined, options)
	}

	/**
	 * Upload file with progress callback
	 * Uses XMLHttpRequest for progress tracking
	 */
	async upload<TResponse>(
		endpoint: string,
		file: {
			uri: string
			name: string
			type: string
		},
		options?: {
			onProgress?: (progress: number) => void
			additionalFields?: Record<string, string>
		}
	): Promise<ApiResult<TResponse>> {
		const authHeaders = await this.getAuthHeaders()

		return new Promise((resolve) => {
			const xhr = new XMLHttpRequest()

			// Track upload progress
			if (options?.onProgress) {
				xhr.upload.onprogress = (event) => {
					if (event.lengthComputable) {
						const percent = Math.round((event.loaded / event.total) * 100)
						options.onProgress?.(percent)
					}
				}
			}

			xhr.onload = async () => {
				// Handle 401
				if (xhr.status === 401) {
					await this.handleUnauthorized()
					resolve({ success: false, error: 'Unauthorized' })
					return
				}

				try {
					const response = JSON.parse(xhr.responseText) as TResponse
					if (xhr.status >= 200 && xhr.status < 300) {
						resolve({ success: true, data: response })
					} else {
						const errorResponse = response as unknown as { error?: string }
						resolve({
							success: false,
							error: errorResponse.error ?? `Ошибка сервера: ${xhr.status}`,
						})
					}
				} catch {
					resolve({ success: false, error: `Ошибка сервера: ${xhr.status}` })
				}
			}

			xhr.onerror = () => {
				resolve({ success: false, error: 'Ошибка сети' })
			}

			xhr.ontimeout = () => {
				resolve({ success: false, error: 'Превышено время ожидания' })
			}

			const formData = new FormData()
			formData.append('file', {
				uri: file.uri,
				name: file.name,
				type: file.type,
			} as unknown as Blob)

			// Add additional fields if any
			if (options?.additionalFields) {
				for (const [key, value] of Object.entries(options.additionalFields)) {
					formData.append(key, value)
				}
			}

			xhr.open('POST', `${this.baseUrl}${endpoint}`)

			// Set auth header
			const authToken = authHeaders.Authorization
			if (authToken) {
				xhr.setRequestHeader('Authorization', authToken)
			}

			xhr.timeout = 60000 // 60 seconds
			xhr.send(formData)
		})
	}

	/**
	 * Perform GET request
	 */
	async get<TResponse>(
		endpoint: string,
		options?: { skipAuthHandler?: boolean }
	): Promise<ApiResult<TResponse>> {
		console.log('Making GET request to:', `${this.baseUrl}${endpoint}`)
		return this.request<TResponse>('GET', endpoint, undefined, options)
	}
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL)


