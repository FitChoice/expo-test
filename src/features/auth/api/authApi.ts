/**
 * Authentication API methods
 */

import { apiClient } from '@/shared/api'
import { saveUserId, saveAuthToken, saveRefreshToken } from '@/shared/lib/auth'
import type {
    SendCodeInput,
    SendCodeResponse,
    RegistrationInput,
    LoginRequest,
    RefreshInput,
    TokenResponse,
    ApiResult,
} from '@/shared/api/types'

// Use mocks only in development if explicitly enabled
const MOCK_MODE = __DEV__ && process.env.EXPO_PUBLIC_USE_MOCKS === 'true'

/**
 * Mock function to simulate sendCode
 */
async function mockSendCode(_email: string): Promise<ApiResult<SendCodeResponse>> {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return {
        success: true,
        data: { message: 'Verification code sent' },
    }
}

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
    async sendCode(email: string): Promise<ApiResult<SendCodeResponse>> {
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return {
                success: false,
                error: 'Неверный формат email',
            }
        }

        if (MOCK_MODE) {
            return mockSendCode(email)
        }
        const payload: SendCodeInput = { email }
        return await apiClient.post<SendCodeInput, SendCodeResponse>(
            '/auth/sendCode', 
            payload,
            { skipAuthHandler: true }
        )
    },

    /**
	 * Register new user
	 */
    async registration(data: RegistrationInput): Promise<ApiResult<TokenResponse>> {
        let result: ApiResult<TokenResponse>
		
        if (MOCK_MODE) {
            result = await mockRegistration(data)
        } else {
            result = await apiClient.post<RegistrationInput, TokenResponse>(
                '/auth/registration', 
                data,
                { skipAuthHandler: true }
            )
        }
		
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
        let result: ApiResult<TokenResponse>
		
        if (MOCK_MODE) {
            result = await mockLogin(data)
        } else {
            result = await apiClient.post<LoginRequest, TokenResponse>(
                '/auth/login', 
                data,
                { skipAuthHandler: true }
            )
        }
		
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
