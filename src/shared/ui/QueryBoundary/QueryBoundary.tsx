import { type ReactNode } from 'react'
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native'

interface QueryBoundaryProps {
	isLoading: boolean
	isError: boolean
	error?: Error | null
	onRetry?: () => void
	children: ReactNode
}

export const QueryBoundary = ({
    isLoading,
    isError,
    error,
    onRetry,
    children,
}: QueryBoundaryProps) => {
    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#A172FF" />
                <Text style={styles.loadingText}>Загрузка...</Text>
            </View>
        )
    }

    if (isError) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorTitle}>Произошла ошибка</Text>
                <Text style={styles.errorMessage}>{error?.message || 'Неизвестная ошибка'}</Text>
                {onRetry && (
                    <TouchableOpacity onPress={onRetry} style={styles.retryButton}>
                        <Text style={styles.retryButtonText}>Попробовать снова</Text>
                    </TouchableOpacity>
                )}
            </View>
        )
    }

    return <>{children}</>
}

const styles = StyleSheet.create({
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        color: '#FFFFFF',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorTitle: {
        fontSize: 18,
        color: '#FFFFFF',
        marginBottom: 8,
    },
    errorMessage: {
        fontSize: 14,
        color: '#999999',
        marginBottom: 24,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: '#A172FF',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
})
