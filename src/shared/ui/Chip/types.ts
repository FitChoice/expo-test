import type MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'

export interface ChipProps {
	icon?: keyof typeof MaterialCommunityIcons.glyphMap
	text: string
	variant?: 'default' | 'accent'
}
