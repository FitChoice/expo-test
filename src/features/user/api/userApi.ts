/**
 * User API methods
 */

import { apiClient } from '@/shared/api'
import type { ApiResult } from '@/shared/api/types'

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
        return apiClient.post(`/user/change-password/${userId}`, {
            oldPassword,
            newPassword,
        })
    },
}
