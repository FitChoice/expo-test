import { StyleSheet } from 'react-native'

/**
 * Общие стили для компонентов survey
 * Используют шрифт Rimma Sans, который загружается через expo-font
 */
export const sharedStyles = StyleSheet.create({
	title: {
		fontFamily: 'Rimma_sans',
		fontWeight: '700',
		fontSize: 24,
		lineHeight: 31.2,
		color: '#FFFFFF',
		textAlign: 'left',
	},
	titleCenter: {
		fontFamily: 'Rimma_sans',
		fontWeight: '700',
		fontSize: 24,
		lineHeight: 31.2,
		color: '#FFFFFF',
		textAlign: 'center',
	},
	titleLarge: {
		fontFamily: 'Rimma_sans',
		fontWeight: '700',
		fontSize: 64,
		lineHeight: 83,
		color: '#FFFFFF',
		opacity: 0.13,
	},
})
