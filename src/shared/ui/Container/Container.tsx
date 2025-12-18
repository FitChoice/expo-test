import React, { useState, useEffect } from 'react'
import { View, type ViewProps } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as ScreenOrientation from 'expo-screen-orientation'

/**
 * Container компонент с безопасной областью
 * Использует useSafeAreaInsets для учета вырезов экрана (notch, home indicator)
 * Edges меняются в зависимости от ориентации: портретная - ['top', 'bottom'], горизонтальная - ['top', 'bottom', 'left', 'right']
 */
interface ContainerProps extends ViewProps {
	children: React.ReactNode
}

export const Container = ({ children, className, style, ...props }: ContainerProps) => {
	const [isLandscape, setIsLandscape] = useState(false)
	const insets = useSafeAreaInsets()

	useEffect(() => {
		const checkOrientation = async () => {
			try {
				const orientation = await ScreenOrientation.getOrientationAsync()
				const landscape =
					orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
					orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT
				setIsLandscape(landscape)
			} catch (err) {
				console.warn('Error reading orientation:', err)
			}
		}

		checkOrientation()

		const subscription = ScreenOrientation.addOrientationChangeListener(async () => {
			await checkOrientation()
		})

		return () => {
			ScreenOrientation.removeOrientationChangeListener(subscription)
		}
	}, [])

	const paddingStyle = {
		paddingTop: isLandscape ? insets.top : insets.top,
		paddingBottom: isLandscape ? insets.bottom : insets.bottom,
		paddingLeft: isLandscape ? insets.left : 0,
		paddingRight: isLandscape ? insets.right : 0,
	}

	return (
		<View
			className="flex-1"
			style={[{ backgroundColor: 'transparent' }, paddingStyle, style]}
			{...props}
		>
			<View className={`flex-1 ${className || ''}`}>{children}</View>
		</View>
	)
}
