import { AuthGuard } from '@/shared/ui'
import { PhotoProgressScreen } from '@/pages/photo-progress'

export default function PhotoProgressPage() {
	return (
		<AuthGuard>
			<PhotoProgressScreen />
		</AuthGuard>
	)
}

