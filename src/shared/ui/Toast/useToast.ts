/**
 * useToast - хук для управления Toast уведомлениями
 */

import { useState, useCallback } from 'react'
import type { ToastState } from './types'

export const useToast = () => {
    const [toast, setToast] = useState<ToastState>({
        visible: false,
        message: '',
        variant: 'success',
    })

    const showToast = useCallback(
        (message: string, variant: 'success' | 'error' = 'success') => {
            setToast({ visible: true, message, variant })
        },
        []
    )

    const hideToast = useCallback(() => {
        setToast((prev) => ({ ...prev, visible: false }))
    }, [])

    const showSuccess = useCallback(
        (message: string) => {
            showToast(message, 'success')
        },
        [showToast]
    )

    const showError = useCallback(
        (message: string) => {
            showToast(message, 'error')
        },
        [showToast]
    )

    return {
        toast,
        showToast,
        hideToast,
        showSuccess,
        showError,
    }
}
