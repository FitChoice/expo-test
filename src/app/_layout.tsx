import '../global.css'
import { Slot } from 'expo-router'
import { AppProvider } from './_providers/AppProvider'
import { ErrorBoundary } from '@/shared/ui'
import { LogBox } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import Toast from 'react-native-toast-message'
import { toastConfig } from '@/shared/ui/Toast/config'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

// Подавляем предупреждение о deprecated SafeAreaView из expo-router
LogBox.ignoreLogs(['SafeAreaView has been deprecated'])

function RootLayoutContent() {
	const insets = useSafeAreaInsets()

	return (
		<>
			{/* Глобальная настройка статус-бара - светлые иконки по умолчанию */}
			<StatusBar style="light" />
			<Slot />
			<Toast config={toastConfig} topOffset={insets.top + 10} />
		</>
	)
}

export default function Layout() {
	return (
		<ErrorBoundary>
			<AppProvider>
				<RootLayoutContent />
			</AppProvider>
		</ErrorBoundary>
	)
}
