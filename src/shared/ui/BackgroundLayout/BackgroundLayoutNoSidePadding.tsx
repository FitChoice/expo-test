import React from 'react'
import { StyleSheet, Dimensions, View } from 'react-native'
import { SafeAreaContainer } from '@/shared/ui'
import { GradientBg } from '@/shared/ui/GradientBG'

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('screen')

/**
 * Компонент контентного контейнера без боковых отступов
 * Используется для создания общего фона для страниц с радиальным градиентом
 */
export const BackgroundLayoutNoSidePadding = ({ children }: { children: React.ReactNode }) => {

    return ( <View style={styles.container}>
        {/* Радиальный градиент с blur-эффектом */}
        {/*<RadialGradientBackground />*/}

        <View style={styles.gradientContainer}>
            <GradientBg />
        </View>

        {/* Контент */}
        <SafeAreaContainer style={styles.contentContainer}>
            {children}
        </SafeAreaContainer>
  
    </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative', // Для позиционирования элементов
        zIndex: 3, // Поверх браслета и заголовка
        overflow: 'hidden', // Для корректного отображения градиента
    },
    gradientContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 14,
    },
})
