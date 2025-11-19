import { AuthGuard } from '@/shared/ui'
import { SurveyScreen } from '@/pages/survey'

/**
 * Survey page route (protected)
 */
export default function SurveyPage() {
    return (
        <AuthGuard>
            <SurveyScreen />
        </AuthGuard>
    )
}
