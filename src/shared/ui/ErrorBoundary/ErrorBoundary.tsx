import { Component, type ReactNode } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { env } from '@/shared/config'

interface Props {
	children: ReactNode
}

interface State {
	hasError: boolean
	error: Error | null
}

/**
 * Логирует ошибку в зависимости от окружения
 * В production - можно интегрировать Sentry, Crashlytics и т.д.
 */
function logError(error: Error, errorInfo: unknown) {
	// В разработке - подробный лог в консоль
	if (env.isDevelopment) {
		console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
		console.error('🔴 ErrorBoundary caught an error:')
		console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
		console.error('Error:', error)
		console.error('Error Info:', errorInfo)
		console.error('Stack:', error.stack)
		console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
	}

	// В production - отправляем в сервис мониторинга
	if (env.isProduction) {
		// TODO: Интегрировать Sentry
		// Sentry.captureException(error, { contexts: { errorInfo } })

		// Или Firebase Crashlytics
		// crashlytics().recordError(error)

		// Пока просто логируем минимальную информацию
		console.error('ErrorBoundary:', error.message)
	}
}

export class ErrorBoundary extends Component<Props, State> {
	state: State = { hasError: false, error: null }

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error }
	}

	componentDidCatch(error: Error, errorInfo: unknown) {
		logError(error, errorInfo)
	}

	handleReset = () => {
		this.setState({ hasError: false, error: null })
	}

	render() {
		if (this.state.hasError) {
			return (
				<View style={styles.container}>
					<Text style={styles.title}>Что-то пошло не так</Text>
					<Text style={styles.message}>
						{this.state.error?.message || 'Неизвестная ошибка'}
					</Text>
					<TouchableOpacity style={styles.button} onPress={this.handleReset}>
						<Text style={styles.buttonText}>Попробовать снова</Text>
					</TouchableOpacity>
				</View>
			)
		}
		return this.props.children
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
		backgroundColor: '#151515',
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#FFFFFF',
		marginBottom: 16,
	},
	message: {
		fontSize: 16,
		color: '#FFFFFF',
		marginBottom: 24,
		textAlign: 'center',
	},
	button: {
		backgroundColor: '#A172FF',
		paddingHorizontal: 24,
		paddingVertical: 12,
		borderRadius: 8,
	},
	buttonText: {
		color: '#FFFFFF',
		fontSize: 16,
		fontWeight: '600',
	},
})
