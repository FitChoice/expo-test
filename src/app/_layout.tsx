import '../global.css'
import { Slot } from 'expo-router'
import { AppProvider } from './_providers/AppProvider'
import { ErrorBoundary } from '@/shared/ui'

export default function Layout() {
    return (
        <ErrorBoundary>
            <AppProvider>
                <Slot />
            </AppProvider>
        </ErrorBoundary>
    )
}
