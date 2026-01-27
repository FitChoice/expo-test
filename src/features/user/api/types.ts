/**
 * User API types
 */

export interface UserProfile {
	avatar_url: string | null
	email: string
	experience: number
	name: string
	gender: 'male' | 'female'
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
	promocode?: string
	gender?: 'male' | 'female'
	age?: number
	height?: number
	weight?: number
	train_days?: number
	train_frequency?: number
	train_goals?: number
	main_direction?: number
	secondary_direction?: number | null
}

export interface AvatarPresignUrlResponse {
	url: string
}
