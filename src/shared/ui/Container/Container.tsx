import React, { useState, useEffect } from 'react'
import { View, type ViewProps, StyleSheet, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { BlurView } from 'expo-blur'
import * as ScreenOrientation from 'expo-screen-orientation'

/**
 * Container компонент с безопасной областью
 * Использует SafeAreaView для учета вырезов экрана (notch, home indicator)
 * SafeAreaView имеет размытый фон, который сливается с основным фоном приложения
 * Edges меняются в зависимости от ориентации: портретная - ['top', 'bottom'], горизонтальная - ['top', 'bottom', 'left', 'right']
 */
interface ContainerProps extends ViewProps {
	children: React.ReactNode
}

export const Container = ({ children, className, ...props }: ContainerProps) => {
    const [isLandscape, setIsLandscape] = useState(false)

    useEffect(() => {
        // Пропускаем проверку ориентации на вебе
        if (Platform.OS === 'web') {
            return undefined
        }

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

    const edges: readonly ('top' | 'bottom' | 'left' | 'right')[] = isLandscape
        ? (['top', 'bottom', 'left', 'right'] as const)
        : (['top', 'bottom'] as const)

    return (
        <SafeAreaView className="flex-1" edges={edges} style={styles.safeArea}>
            {/* Blur фон для safe area */}

            <View className={`flex-1 ${className || ''}`} {...props}>
                {children}
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: 'transparent',
    },
})
