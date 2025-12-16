import { useQuery } from '@tanstack/react-query'
import { userApi } from '../api'
import type { UserProfile } from '../api/types'

export const useProfileQuery = (userId: number | null) => {
    return useQuery<UserProfile>({
        queryKey: ['profile', userId],
        queryFn: async () => {
            if (!userId) throw new Error('User ID required')
            const profileResponse = await userApi.getProfile(userId.toString())
            console.log('profileResponse')
            console.log(profileResponse)
            if (!profileResponse.success) throw new Error(profileResponse.error)
            return profileResponse.data
        },
        enabled: !!userId,
    })
}
