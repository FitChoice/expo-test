import { AuthGuard } from '@/shared/ui'
import { ProfileScreen } from '@/pages/profile'

/**
 * Profile page route (protected)
 */
export default function ProfilePage() {
    return (
        <AuthGuard>
            <ProfileScreen />
        </AuthGuard>
    )
}
