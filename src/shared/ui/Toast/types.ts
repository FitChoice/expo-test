export interface ToastProps {
	visible: boolean
	message: string
	variant?: 'success' | 'error'
	duration?: number
	onHide: () => void
}

export interface ToastState {
	visible: boolean
	message: string
	variant: 'success' | 'error'
}
