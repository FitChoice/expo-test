import { AuthGuard } from '@/shared/ui'
import { DiariesCountScreen } from '@/pages/stats'

export default function DiariesCountPage() {
	return (
		<AuthGuard>
			<DiariesCountScreen />
		</AuthGuard>
	)
}

