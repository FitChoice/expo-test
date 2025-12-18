import { AuthGuard } from '@/shared/ui'
import { ChatScreen } from '@/pages/chat'

/**
 * Chat page route (protected)
 */
export default function ChatPage() {
	return (
		<AuthGuard>
			<ChatScreen />
		</AuthGuard>
	)
}
