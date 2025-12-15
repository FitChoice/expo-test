/**
 * User API types
 */

export interface UserProfile {
	avatar_url: string | null
	email: string
	experience: number
	name: string
}

export interface NotificationSettings {
	basic: boolean
	progress: boolean
	reports: boolean
	system: boolean
}

export interface UpdateProfileInput {
	name?: string
	avatar_url?: string
}

export interface AvatarPresignUrlResponse {
	url: string
}
