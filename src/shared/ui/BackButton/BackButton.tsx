import React from 'react'
import { TouchableOpacity } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Icon } from '../Icon'
import type { BackButtonProps } from './types'

/**
 * Reusable back button with safe area support
 * Automatically positions itself below the status bar
 * Supports both absolute (floating) and relative (in-flow) positioning
 */
export const BackButton: React.FC<BackButtonProps> = ({
	onPress,
	color = '#FFFFFF',
	style,
	variant = 'translucent',
	position = 'absolute',
}) => {
	const insets = useSafeAreaInsets()

	const backgroundClass =
		variant === 'translucent' ? 'bg-[rgba(244,244,244,0.2)]' : 'bg-transparent'

	const positionClass = position === 'absolute' ? 'absolute left-2' : 'relative'

	// For absolute positioning, use top offset from safe area
	// For relative positioning, use marginTop to maintain spacing
	const spacingStyle =
		position === 'absolute' ? { top: insets.top + 14 } : { marginTop: insets.top + 14 }

	return (
		<TouchableOpacity
			className={`z-10 p-3 items-center justify-center rounded-2xl ${backgroundClass} ${positionClass}`}
			style={[spacingStyle, style]}
			onPress={onPress}
			activeOpacity={0.8}
			accessibilityRole="button"
			accessibilityLabel="Go back"
			accessibilityHint="Navigate to the previous screen"
		>
			<Icon name="chevron-left" size={24} color={color} />
		</TouchableOpacity>
	)
}
