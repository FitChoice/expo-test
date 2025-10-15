import '../global.css'
import { Slot } from 'expo-router'
import { AppProvider } from './_providers/AppProvider'

export default function Layout() {
	return (
		<AppProvider>
			<Slot />
		</AppProvider>
	)
}
