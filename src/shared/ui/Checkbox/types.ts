export interface CheckboxProps {
	checked: boolean
	onChange: (checked: boolean) => void
	size?: 'sm' | 'md' | 'lg'
	disabled?: boolean
	className?: string
}
