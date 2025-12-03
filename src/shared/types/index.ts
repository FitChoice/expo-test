/**
 * Shared types used across the application
 */

// API related types
export interface ApiResponse<T = unknown> {
	data: T
	status: number
	message?: string
}

export interface ApiError {
	message: string
	status: number
	code?: string
}

// Common utility types
export type Nullable<T> = T | null
export type Optional<T> = T | undefined

// ID types
export type ID = string | number

// UI types
export type { SelectOption } from './ui'
