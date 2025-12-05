import { useQuery } from '@tanstack/react-query'
import { userApi } from '../api'
import type { UserProfile } from '../api/types'

export const useProfileQuery = (userId: number | null) => {
    return useQuery<UserProfile>({
        queryKey: ['profile', userId],
        queryFn: async () => {
            if (!userId) throw new Error('User ID required')
            const result = await userApi.getProfile(userId.toString())
            if (!result.success) throw new Error(result.error)
            return result.data
        },
        enabled: !!userId,
    })
}
