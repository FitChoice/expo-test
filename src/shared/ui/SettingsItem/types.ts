import type { ReactNode } from 'react'

export interface SettingsItemProps {
	label: string
	description?: string
	rightElement?: ReactNode
	onPress?: () => void
	showDivider?: boolean
}
