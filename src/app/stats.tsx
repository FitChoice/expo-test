import { AuthGuard } from '@/shared/ui'
import { StatsScreen } from '@/pages/stats'

/**
 * Stats page route (protected)
 */
export default function StatsPage() {
    return (
        <AuthGuard>
            <StatsScreen />
        </AuthGuard>
    )
}
