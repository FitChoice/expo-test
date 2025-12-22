import { AuthGuard } from '@/shared/ui'
import { WarmUpsScreen } from '@/pages/stats'

export default function QualityGrowthPage() {
	return (
		<AuthGuard>
			<WarmUpsScreen />
		</AuthGuard>
	)
}

