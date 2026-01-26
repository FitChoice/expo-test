import React from 'react'
import { Toast } from './Toast'
import { type ToastConfig } from 'react-native-toast-message'

export const toastConfig: ToastConfig = {
	success: ({ text1, text2, iconName }: any) =>(
		<Toast variant="success" message={text1} description={text2} iconName={iconName} />
	),
	error: ({ text1, text2, iconName }: any) => (
		<Toast variant="error" message={text1} description={text2} iconName={iconName} />
	),
}
