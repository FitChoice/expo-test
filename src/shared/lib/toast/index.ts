import Toast from 'react-native-toast-message'

/**
 * Global Toast notification helper
 * Uses react-native-toast-message under the hood
 */
export const showToast = {
	success: (message: string) => {
		Toast.show({
			type: 'success',
			text1: message,
			visibilityTime: 5000,
			autoHide: true,
			position: 'top',
		})
	},
	error: (message: string) => {
		Toast.show({
			type: 'error',
			text1: message,
			visibilityTime: 5000,
			autoHide: true,
			position: 'top',
		})
	},
	hide: () => Toast.hide(),
}
