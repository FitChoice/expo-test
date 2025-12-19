import { AuthGuard } from '@/shared/ui'
import { TrainingsCountScreen } from '@/pages/stats'

export default function TrainingsCountPage() {
	return (
		<AuthGuard>
			<TrainingsCountScreen />
		</AuthGuard>
	)
}

