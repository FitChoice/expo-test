import React from 'react'
import { View, type ViewProps } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

/**
 * Container компонент с безопасной областью
 * Использует SafeAreaView для учета вырезов экрана (notch, home indicator)
 */
interface ContainerProps extends ViewProps {
	children: React.ReactNode
}

export const Container = ({ children, className, ...props }: ContainerProps) => {
	return (
		<SafeAreaView className="flex-1" edges={['top', 'bottom', 'left', 'right']}>
			<View className={`mx-6 flex-1 ${className || ''}`} {...props}>
				{children}
			</View>
		</SafeAreaView>
	)
}
