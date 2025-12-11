import React from 'react'
import { Toast } from './Toast'
import { type ToastConfig } from 'react-native-toast-message'

export const toastConfig: ToastConfig = {
    success: ({ text1, hide }: any) => (
        <Toast variant="success" message={text1} onHide={hide} />
    ),
    error: ({ text1, hide }: any) => (
        <Toast variant="error" message={text1} onHide={hide} />
    ),
}
