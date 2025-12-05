export interface ConfirmModalProps {
	visible: boolean
	title: string
	subtitle?: string
	confirmText: string
	cancelText: string
	confirmVariant?: 'primary' | 'danger'
	onConfirm: () => void
	onCancel: () => void
	isLoading?: boolean
}
