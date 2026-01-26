import React from 'react'
import { Toast } from './Toast'
import { type ToastConfig } from 'react-native-toast-message'

export const toastConfig: ToastConfig = {
	success: ({ text1, text2, props }: any) => (
		<Toast
			variant="success"
			message={text1}
			description={text2}
			iconName={props?.iconName}
		/>
	),
	error: ({ text1, text2, props }: any) => (
		<Toast
			variant="error"
			message={text1}
			description={text2}
			iconName={props?.iconName}
		/>
	),
}
