export interface ToastProps {
	message: string
	variant: 'success' | 'error'
	onHide: () => void
}
