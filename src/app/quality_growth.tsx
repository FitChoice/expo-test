import { AuthGuard } from '@/shared/ui'
import { QualityGrowthScreen } from '@/pages/stats'

export default function QualityGrowthPage() {
	return (
		<AuthGuard>
			<QualityGrowthScreen />
		</AuthGuard>
	)
}

