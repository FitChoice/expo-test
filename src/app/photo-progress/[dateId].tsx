import { AuthGuard } from '@/shared/ui'
import { PhotoSetShow } from '@/pages/photo-progress/ui/PhotoSetShow'

export default function PhotoSetShowPage() {
	return (
		<AuthGuard>
			<PhotoSetShow />
		</AuthGuard>
	)
}

