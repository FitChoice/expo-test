/**
 * User API methods
 */

import { apiClient } from '@/shared/api'
import type { ApiResult } from '@/shared/api/types'

type UpdatePasswordPayload = {
	email: string
	new_password: string
	old_password?: string
}

export const userApi = {
    /**
	 * Update user data
	 */
    async updateUser(
        userId: string,
        data: Record<string, unknown>
    ): Promise<ApiResult<unknown>> {
        return apiClient.post(`/user/update/${userId}`, data)
    },

    /**
	 * Delete user account
	 */
    async deleteUser(userId: string): Promise<ApiResult<unknown>> {
        return apiClient.delete(`/user/delete/${userId}`)
    },

    /**
	 * Change user password
	 */
    async changePassword(
        userId: string,
        oldPassword: string,
        newPassword: string
    ): Promise<ApiResult<unknown>> {
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
    async updatePassword(args: UpdatePasswordPayload): Promise<ApiResult<unknown>> {
        return apiClient.put('/user/update-password', args)
    },
}
