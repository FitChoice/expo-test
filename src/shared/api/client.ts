/**
 * API client for HTTP requests
 */

import * as SecureStore from 'expo-secure-store'
import { router } from 'expo-router'
import { type ApiResult } from './types'
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
        data: TRequest,
        options?: { skipAuthHandler?: boolean }
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

            // Handle 401 - unauthorized (skip for public endpoints like login)
            if (response.status === 401 && !options?.skipAuthHandler) {
                await this.handleUnauthorized()
                return { success: false, error: 'Unauthorized' }
            }

            // Read response body as text first (can only be read once)
            const responseText = await response.text()

            // Try to parse as JSON if content-type indicates JSON
            const contentType = response.headers.get('content-type')
            const hasJsonContent = contentType?.includes('application/json')

            let responseData: unknown = null

            if (hasJsonContent && responseText) {
                try {
                    responseData = JSON.parse(responseText)
                } catch (jsonError) {
                    console.error('Failed to parse JSON response:', jsonError)
                    return {
                        success: false,
                        error: `Ошибка сервера: ${response.status}`,
                    }
                }
            }

            if (!response.ok) {
                // Log non-JSON error responses
                if (!hasJsonContent && responseText) {
                    console.error('Non-JSON response for error status:', responseText)
                }

                const errorMessage =
					responseData && typeof responseData === 'object' && 'error' in responseData
					    ? String(responseData.error)
					    : responseText || `Ошибка сервера: ${response.status}`

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
	 * Perform PATCH request
	 */
    async patch<TRequest, TResponse>(
        endpoint: string,
        data: TRequest,
        options?: { skipAuthHandler?: boolean }
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

            // Handle 401 - unauthorized (skip for public endpoints like login)
            if (response.status === 401 && !options?.skipAuthHandler) {
                await this.handleUnauthorized()
                return { success: false, error: 'Unauthorized' }
            }

            // Read response body as text first (can only be read once)
            const responseText = await response.text()

            // Try to parse as JSON if content-type indicates JSON
            const contentType = response.headers.get('content-type')
            const hasJsonContent = contentType?.includes('application/json')

            let responseData: unknown = null

            if (hasJsonContent && responseText) {
                try {
                    responseData = JSON.parse(responseText)
                } catch (jsonError) {
                    console.error('Failed to parse JSON response:', jsonError)
                    return {
                        success: false,
                        error: `Ошибка сервера: ${response.status}`,
                    }
                }
            }

            if (!response.ok) {
                // Log non-JSON error responses
                if (!hasJsonContent && responseText) {
                    console.error('Non-JSON response for error status:', responseText)
                }

                const errorMessage =
					responseData && typeof responseData === 'object' && 'error' in responseData
					    ? String(responseData.error)
					    : responseText || `Ошибка сервера: ${response.status}`

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
	 * Perform PUT request
	 */
    async put<TRequest, TResponse>(
        endpoint: string,
        data: TRequest,
        options?: { skipAuthHandler?: boolean }
    ): Promise<ApiResult<TResponse>> {
        const authHeaders = await this.getAuthHeaders()

        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...authHeaders,
                },
                body: JSON.stringify(data),
            })

            // Handle 401 - unauthorized (skip for public endpoints)
            if (response.status === 401 && !options?.skipAuthHandler) {
                await this.handleUnauthorized()
                return { success: false, error: 'Unauthorized' }
            }

            // Read response body as text first (can only be read once)
            const responseText = await response.text()

            // Try to parse as JSON if content-type indicates JSON
            const contentType = response.headers.get('content-type')
            const hasJsonContent = contentType?.includes('application/json')

            let responseData: unknown = null

            if (hasJsonContent && responseText) {
                try {
                    responseData = JSON.parse(responseText)
                } catch (jsonError) {
                    console.error('Failed to parse JSON response:', jsonError)
                    return {
                        success: false,
                        error: `Ошибка сервера: ${response.status}`,
                    }
                }
            }

            if (!response.ok) {
                // Log non-JSON error responses
                if (!hasJsonContent && responseText) {
                    console.error('Non-JSON response for error status:', responseText)
                }

                const errorMessage =
					responseData && typeof responseData === 'object' && 'error' in responseData
					    ? String(responseData.error)
					    : responseText || `Ошибка сервера: ${response.status}`

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
	 * Perform DELETE request
	 */
    async delete<TResponse>(
        endpoint: string,
        options?: { skipAuthHandler?: boolean }
    ): Promise<ApiResult<TResponse>> {
        const authHeaders = await this.getAuthHeaders()

        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    ...authHeaders,
                },
            })

            // Handle 401 - unauthorized
            if (response.status === 401 && !options?.skipAuthHandler) {
                await this.handleUnauthorized()
                return { success: false, error: 'Unauthorized' }
            }

            // Read response body as text first (can only be read once)
            const responseText = await response.text()

            // Try to parse as JSON if content-type indicates JSON
            const contentType = response.headers.get('content-type')
            const hasJsonContent = contentType?.includes('application/json')

            let responseData: unknown = null

            if (hasJsonContent && responseText) {
                try {
                    responseData = JSON.parse(responseText)
                } catch (jsonError) {
                    console.error('Failed to parse JSON response:', jsonError)
                    return {
                        success: false,
                        error: `Ошибка сервера: ${response.status}`,
                    }
                }
            }

            if (!response.ok) {
                const errorMessage =
					responseData && typeof responseData === 'object' && 'error' in responseData
					    ? String(responseData.error)
					    : responseText || `Ошибка сервера: ${response.status}`

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
                // Only log as error for non-successful responses (except 404 which is expected for missing resources)
                if (!response.ok && response.status !== 404) {
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
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL)
