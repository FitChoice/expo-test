import type { StyleProp, ViewStyle } from 'react-native'

export interface BackButtonProps {
	/**
	 * Handler for button press
	 */
	onPress: () => void

	/**
	 * Icon color
	 * @default '#FFFFFF'
	 */
	color?: string

	/**
	 * Additional button style
	 */
	style?: StyleProp<ViewStyle>

	/**
	 * Background color or style preset
	 * @default 'translucent'
	 */
	variant?: 'translucent' | 'transparent'

	/**
	 * Position mode: 'absolute' for floating button, 'relative' for in-flow positioning
	 * @default 'absolute'
	 */
	position?: 'absolute' | 'relative'
}
