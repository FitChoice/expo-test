import { AuthGuard } from '@/shared/ui'
import { HomeScreen } from '@/pages/home'

/**
 * Home page route (protected)
 */
export default function HomePage() {
	return (
		<AuthGuard>
			<HomeScreen />
		</AuthGuard>
	)
}
