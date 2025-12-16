import { AuthGuard } from '@/shared/ui'
import { DayDetailsScreen } from '@/pages/stats'

export default function StatsDayPage() {
    return (
        <AuthGuard>
            <DayDetailsScreen />
        </AuthGuard>
    )
}
