import { AuthGuard } from '@/shared/ui'
import { ChangeTrainingProgramScreen } from '@/pages/profile'

export default function ChangeTrainingProgramPage() {
	return (
		<AuthGuard>
			<ChangeTrainingProgramScreen />
		</AuthGuard>
	)
}
