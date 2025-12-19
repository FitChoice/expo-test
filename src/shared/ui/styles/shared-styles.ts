import { Platform, StyleSheet } from 'react-native'

/**
 * Общие стили для UI (типографика).
 * Используют шрифт Rimma Sans, который загружается через expo-font.
 */
export const sharedStyles = StyleSheet.create({
	title: {
		fontFamily: Platform.select({
			ios: 'Rimma_sans',
			android: 'Rimma_sans_android',
		}),
		fontSize: 24,
		lineHeight: 31.2,
		color: '#FFFFFF',
		textAlign: 'left',
	},
	formLabel: {
		fontFamily: 'Inter',
		fontSize: 24,
		lineHeight: 1.2,
		color: '#FFFFFF',
	},
	titleCenter: {
		fontFamily: Platform.select({
			ios: 'Rimma_sans',
			android: 'Rimma_sans_android',
		}),
		fontSize: 24,
		lineHeight: 31.2,
		color: '#FFFFFF',
		textAlign: 'center',
	},
	titleLarge: {
		fontFamily: Platform.select({
			ios: 'Rimma_sans',
			android: 'Rimma_sans_android',
		}),
		fontSize: 64,
		lineHeight: 83,
		color: '#FFFFFF',
		opacity: 0.13,
	},
})
