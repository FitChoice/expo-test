import type { IconName } from '@/shared/ui/Icon'

export interface ToastProps {
	message: string
	variant: 'success' | 'error' | 'info'
	description?: string,
	iconName?: IconName
}
