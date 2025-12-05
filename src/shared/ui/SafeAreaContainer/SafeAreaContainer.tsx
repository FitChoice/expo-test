import React from 'react'
import { type ViewProps, StatusBar } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'

/**
 * SafeAreaContainer - контейнер с отступами для системных элементов
 * Автоматически добавляет padding сверху (status bar) и снизу (navigation bar на Android)
 * Фон прозрачный, чтобы сохранялся фон приложения
 */
interface SafeAreaContainerProps extends ViewProps {
	children: React.ReactNode
}

export const SafeAreaContainer = ({ children }: SafeAreaContainerProps) => {
    return (
        <SafeAreaProvider>
            <StatusBar barStyle="light-content" />
            <SafeAreaView style={{ flex: 1 }}>{children}</SafeAreaView>
        </SafeAreaProvider>
    )
}
