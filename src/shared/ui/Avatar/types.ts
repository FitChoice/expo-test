export interface AvatarProps {
	source: string | null
	size?: number
	editable?: boolean
	onPress?: () => void
	loading?: boolean
}
