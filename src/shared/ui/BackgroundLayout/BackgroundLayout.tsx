import React from 'react'
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native'
import { RadialGradientBackground } from './RadialGradientBackground'

/**
 * Компонент контентного контейнера
 * Используется для создания общего фона для страниц с радиальным градиентом
 */
export const BackgroundLayout = ({
    children,
    styles: containerStyle,
}: {
    children: React.ReactNode
    styles?: StyleProp<ViewStyle>
}) => {
    return (
        <View style={[styles.container, containerStyle]}>
            {/* Радиальный градиент с blur-эффектом */}
            <RadialGradientBackground />

            {/* Контент */}
            {children}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1E1E1E', // BG/Dark 500 BG - контентный контейнер
        paddingHorizontal: '4%',
        position: 'relative', // Для позиционирования элементов
        zIndex: 3, // Поверх браслета и заголовка
        overflow: 'hidden', // Для корректного отображения градиента

    },
})
