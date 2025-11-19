import React from 'react'
import { View, StyleSheet } from 'react-native'
import { RadialGradientBackground } from './RadialGradientBackground'

/**
 * Компонент контентного контейнера
 * Используется для создания общего фона для страниц с радиальным градиентом
 */
export const BackgroundLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <View style={styles.container}>
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
        borderRadius: 32,
        paddingHorizontal: '4%',
        position: 'relative', // Для позиционирования элементов
        zIndex: 3, // Поверх браслета и заголовка
        overflow: 'hidden', // Для корректного отображения градиента
    },
})
