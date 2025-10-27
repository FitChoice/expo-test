import React from 'react'
import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

/**
 * Container компонент с безопасной областью
 * Использует SafeAreaView для учета вырезов экрана (notch, home indicator)
 */
export const Container = ({ children }: { children: React.ReactNode }) => {
	return (
		<SafeAreaView className="flex-1" edges={['top', 'bottom', 'left', 'right']}>
			<View className="mx-6 flex-1">{children}</View>
		</SafeAreaView>
	)
}
