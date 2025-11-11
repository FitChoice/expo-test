import type { IconName } from '../Icon/types'

export interface CircleIconButtonProps {
	icon?: IconName
	size?: 'small' | 'medium' | 'large'
	onPress: () => void
	disabled?: boolean
}

