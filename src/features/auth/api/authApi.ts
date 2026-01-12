/**
 * Authentication API methods
 */

import { apiClient } from '@/shared/api'
import { saveUserId, saveAuthToken, saveRefreshToken } from '@/shared/lib/auth'
import type {
	SendCodeInput,
	SendCodeResponse,
	VerifyCodeInput,
	RegistrationInput,
	LoginRequest,
	RefreshInput,
	TokenResponse,
	ApiResult,
} from '@/shared/api/types'

// Use mocks only in development if explicitly enabled
const MOCK_MODE = __DEV__ && process.env.EXPO_PUBLIC_USE_MOCKS === 'true'

/**
 * Mock function to simulate registration
 */
async function mockRegistration(
	_data: RegistrationInput
): Promise<ApiResult<TokenResponse>> {
	await new Promise((resolve) => setTimeout(resolve, 1000))
	return {
		success: true,
		data: {
			access_token: 'mock_access_token',
			refresh_token: 'mock_refresh_token',
			expires_at: new Date(Date.now() + 3600000).toISOString(),
			id: 1, // Mock user ID
		},
	}
}

/**
 * Mock function to simulate login
 */
async function mockLogin(_data: LoginRequest): Promise<ApiResult<TokenResponse>> {
	await new Promise((resolve) => setTimeout(resolve, 1000))
	return {
		success: true,
		data: {
			access_token: 'mock_access_token',
			refresh_token: 'mock_refresh_token',
			expires_at: new Date(Date.now() + 3600000).toISOString(),
			id: 1, // Mock user ID
		},
	}
}

export const authApi = {
	/**
	 * Send verification code to email
	 */
	async sendCode(
		email: string,
		is_reset_password?: boolean
	): Promise<ApiResult<SendCodeResponse>> {
		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		if (!emailRegex.test(email)) {
			return {
				success: false,
				error: 'Неверный формат email',
			}
		}

		let payload: SendCodeInput = { email }

		if (is_reset_password) {
			payload = { email, is_reset_password: true }
		}

		return await apiClient.post<SendCodeInput, SendCodeResponse>(
			'/auth/sendCode',
			payload,
			{ skipAuthHandler: true }
		)
	},

	/**
	 * Verify email code
	 */
	async verifyCode(email: string, code: number): Promise<ApiResult<void>> {
		const payload: VerifyCodeInput = { email, code }
		return await apiClient.post<VerifyCodeInput, void>('/auth/verifyCode', payload, {
			skipAuthHandler: true,
		})
	},

	/**
	 * Register new user
	 */
	async registration(data: RegistrationInput): Promise<ApiResult<TokenResponse>> {
		const result = await apiClient.post<RegistrationInput, TokenResponse>(
				'/auth/registration',
				data,
				{ skipAuthHandler: true }
			)

		// Save user_id and tokens to SecureStore on successful registration
		if (result.success && result.data) {
			if (result.data.id) {
				await saveUserId(result.data.id)
			}
			if (result.data.access_token) {
				await saveAuthToken(result.data.access_token)
			}
			if (result.data.refresh_token) {
				await saveRefreshToken(result.data.refresh_token)
			}
		}

		return result
	},

	/**
	 * Login user
	 */
	async login(data: LoginRequest): Promise<ApiResult<TokenResponse>> {
		const result = await apiClient.post<LoginRequest, TokenResponse>('/auth/login', data, {
				skipAuthHandler: true,
			})


		// Save user_id and tokens to SecureStore on successful login
		if (result.success && result.data) {
			if (result.data.id) {
				await saveUserId(result.data.id)
			}
			if (result.data.access_token) {
				await saveAuthToken(result.data.access_token)
			}
			if (result.data.refresh_token) {
				await saveRefreshToken(result.data.refresh_token)
			}
		}

		return result
	},

	/**
	 * Refresh access token
	 */
	async refresh(refreshToken: string): Promise<ApiResult<TokenResponse>> {
		const payload: RefreshInput = { refresh_token: refreshToken }
		const result = await apiClient.post<RefreshInput, TokenResponse>(
			'/auth/refresh',
			payload,
			{ skipAuthHandler: true }
		)

		// Save tokens to SecureStore on successful refresh
		if (result.success && result.data) {
			if (result.data.access_token) {
				await saveAuthToken(result.data.access_token)
			}
			if (result.data.refresh_token) {
				await saveRefreshToken(result.data.refresh_token)
			}
		}

		return result
	},
}
