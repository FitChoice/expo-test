import { AuthGuard } from '@/shared/ui'
import { DiaryScreen } from '@/pages/diary'

export default function DiaryPage() {
    return (
        <AuthGuard>
            <DiaryScreen />
        </AuthGuard>
    )
}
