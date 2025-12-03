/**
 * API types for authentication and user endpoints
 */

// SendCode request and response
export interface SendCodeInput {
	email: string
	is_reset_password?: boolean
}

export interface SendCodeResponse {
	message: string
}

// VerifyCode
export interface VerifyCodeInput {
	email: string
	code: number
}

// Registration
export interface RegistrationInput {
	code: number
	email: string
	password: string
}

// Login
export interface LoginRequest {
	email: string
	password: string
}

// Token refresh
export interface RefreshInput {
	refresh_token: string
}

// Token response (used in registration, login, refresh)
export interface TokenResponse {
	access_token: string
	refresh_token: string
	expires_at: string // ISO 8601 date-time
	id: number
}

// Training
export interface TrainingResponse {
	id: number
	user_id: number
	period_id: number
	date: string // ISO 8601 date-time
	activities: Array<{
		type: string
		progress: number[]
	}>
}

// Error response
export interface ErrorResponse {
	error: string
}

// API result wrapper
export type ApiResult<T> = { success: true; data: T } | { success: false; error: string }
