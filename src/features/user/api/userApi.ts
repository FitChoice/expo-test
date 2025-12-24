/**
 * User API methods
 */

import { apiClient } from '@/shared/api'
import type { ApiResult } from '@/shared/api/types'
import type {
	UserProfile,
	NotificationSettings,
	UpdateProfileInput,
	AvatarPresignUrlResponse,
} from './types'

type UpdatePasswordPayload = {
	email: string
	new_password: string
	old_password?: string
}

export const userApi = {
	/**
	 * Get user profile
	 */
	async getProfile(userId: string): Promise<ApiResult<UserProfile>> {
		return apiClient.get(`/user/${userId}`)
	},

	/**
	 * Update user data
	 */
	async updateUser(
		userId: string | number,
		data: UpdateProfileInput
	): Promise<ApiResult<UserProfile>> {
		return apiClient.patch(`/user/update/${userId}`, data)
	},

	/**
	 * Get presigned URL for avatar upload
	 */
	async getImagePresignUrl(filename: string): Promise<ApiResult<AvatarPresignUrlResponse>> {
		const safeName = filename.trim() || 'avatar.jpg'

		console.log('filename')
		console.log(filename)

		// Backend presign endpoint expects POST with JSON body { filename }
		return apiClient.put<{ filename: string }, AvatarPresignUrlResponse>(`/user/presign-url?filename=${filename}`)
	},

	/**
	 * Delete user account
	 */
	async deleteUser(userId: string): Promise<ApiResult<void>> {
		return apiClient.delete(`/user/delete/${userId}`)
	},

	/**
	 * Change user password
	 */
	async changePassword(
		userId: string,
		oldPassword: string,
		newPassword: string
	): Promise<ApiResult<void>> {
		return apiClient.put('/user/update-password', {
			oldPassword,
			newPassword,
		})
	},

	/**
	 * Update user password
	 * If old_password is provided, it will be verified before updating.
	 * If old_password is null, password will be updated directly.
	 */
	async updatePassword(args: UpdatePasswordPayload): Promise<ApiResult<void>> {
		return apiClient.put('/user/update-password', args)
	},



}
