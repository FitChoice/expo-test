import MaterialIcons from '@expo/vector-icons/MaterialIcons'

export interface ChipProps {
	icon?: keyof typeof MaterialIcons.glyphMap;
	text: string
	variant?: 'default' | 'accent'
}

