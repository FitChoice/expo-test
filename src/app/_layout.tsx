import '../global.css'
import { Slot } from 'expo-router'
import { AppProvider } from './_providers/AppProvider'
import { ErrorBoundary } from '@/shared/ui'
import { LogBox } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import Toast from 'react-native-toast-message'
import { toastConfig } from '@/shared/ui/Toast/config'

// Подавляем предупреждение о deprecated SafeAreaView из expo-router
LogBox.ignoreLogs(['SafeAreaView has been deprecated'])

export default function Layout() {
    return (
        <ErrorBoundary>
            <AppProvider>
                {/* Глобальная настройка статус-бара - светлые иконки по умолчанию */}
                <StatusBar style="light" />
                <Slot />
                <Toast config={toastConfig} />
            </AppProvider>
        </ErrorBoundary>
    )
}
