import Toast from 'react-native-toast-message'
import type { IconName } from '@/shared/ui/Icon'

/**
 * Global Toast notification helper
 * Uses react-native-toast-message under the hood
 */
export const showToast = {
	success: (message: string, description?: string, iconName?: IconName) => {
		Toast.show({
			type: 'success',
			text1: message,
			text2: description,
			visibilityTime: 5000,
			autoHide: true,
			position: 'top',
			props: {
				iconName
			}
		})
	},
	error: (message: string,description?: string, iconName?: IconName) => {
		Toast.show({
			type: 'error',
			text1: message,
			text2: description,
			visibilityTime: 5000,
			autoHide: true,
			position: 'top',
			props: {
				iconName
			}
		})
	},
	hide: () => Toast.hide(),
}
