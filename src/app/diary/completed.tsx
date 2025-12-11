import { AuthGuard } from '@/shared/ui'
import { DiaryCompletedScreen } from '@/pages/diary'

export default function DiaryCompletedPage() {
    return (
        <AuthGuard>
            <DiaryCompletedScreen />
        </AuthGuard>
    )
}
