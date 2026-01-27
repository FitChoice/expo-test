import { AuthGuard } from '@/shared/ui'
import { CalendarTrainingReport } from '@/pages/stats/ui/CalendarTrainingReport'

export default function CalendarTrainingReportPage() {
	return (
		<AuthGuard>
			<CalendarTrainingReport />
		</AuthGuard>
	)
}
