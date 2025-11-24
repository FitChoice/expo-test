import React from 'react'
import { View, type ViewProps } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

/**
 * SafeAreaContainer - контейнер с отступами для системных элементов
 * Автоматически добавляет padding сверху (status bar) и снизу (navigation bar на Android)
 * Фон прозрачный, чтобы сохранялся фон приложения
 */
interface SafeAreaContainerProps extends ViewProps {
	children: React.ReactNode
	/**
	 * Какие стороны учитывать для safe area
	 * По умолчанию: ['top', 'bottom']
	 */
	edges?: ('top' | 'bottom' | 'left' | 'right')[]
}

export const SafeAreaContainer = ({ 
    children, 
    edges = ['top', 'bottom'],
    style,
    ...props 
}: SafeAreaContainerProps) => {
    const insets = useSafeAreaInsets()

    const paddingStyle = {
        paddingTop: edges.includes('top') ? insets.top : 0,
        paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
        paddingLeft: edges.includes('left') ? insets.left : 0,
        paddingRight: edges.includes('right') ? insets.right : 0,
    }

    return (
        <View 
            style={[{ backgroundColor: 'transparent' }, paddingStyle, style]} 
            {...props}
        >
            {children}
        </View>
    )
}
