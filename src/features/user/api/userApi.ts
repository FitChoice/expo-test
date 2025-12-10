/**
 * User API methods
 */

import { apiClient } from '@/shared/api'
import type { ApiResult } from '@/shared/api/types'
import type {
    UserProfile,
    NotificationSettings,
    UpdateProfileInput,
    UpdateAvatarResponse,
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
        userId: number,
        data: UpdateProfileInput
    ): Promise<ApiResult<UserProfile>> {
        return apiClient.patch(`/user/update/${userId}`, data)
    },

    /**
	 * Update user avatar
	 */
    async updateAvatar(
        userId: string,
        imageUri: string
    ): Promise<ApiResult<UpdateAvatarResponse>> {
        const filename = imageUri.split('/').pop() || 'avatar.jpg'
        const match = /\.(\w+)$/.exec(filename)
        const type = match ? `image/${match[1]}` : 'image/jpeg'

        return apiClient.upload(`/user/${userId}/avatar`, {
            uri: imageUri,
            name: filename,
            type,
        })
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

    /**
	 * Get notification settings
	 */
    async getNotifications(userId: string): Promise<ApiResult<NotificationSettings>> {
        return apiClient.get(`/user/${userId}/notifications`)
    },

    /**
	 * Update notification settings
	 */
    async updateNotifications(
        userId: string,
        settings: NotificationSettings
    ): Promise<ApiResult<void>> {
        return apiClient.put(`/user/${userId}/notifications`, settings)
    },

    /**
	 * Logout user
	 */
    async logout(): Promise<ApiResult<void>> {
        return apiClient.post('/auth/logout', {})
    },
}
