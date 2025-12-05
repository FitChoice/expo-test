/**
 * User API types
 */

export interface UserProfile {
	id: number
	name: string
	email: string
	avatar: string | null
	level: number
	experience: number
	experienceToNextLevel: number
}

export interface NotificationSettings {
	basic: boolean
	progress: boolean
	reports: boolean
	system: boolean
}

export interface UpdateProfileInput {
	name?: string
}

export interface UpdateAvatarResponse {
	avatar: string
}
