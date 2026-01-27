import { AuthGuard } from '@/shared/ui'
import { CalendarTrainingAnalytics } from '@/pages/stats/ui/CalendarTrainingAnalytics'

export default function CalendarTrainingAnalyticsPage() {
	return (
		<AuthGuard>
			<CalendarTrainingAnalytics />
		</AuthGuard>
	)
}
