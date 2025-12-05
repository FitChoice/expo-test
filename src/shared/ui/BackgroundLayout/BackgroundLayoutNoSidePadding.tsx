import React from 'react'
import { StyleSheet, View, useWindowDimensions } from 'react-native'
import { SafeAreaContainer } from '@/shared/ui'
import { GradientBg } from '@/shared/ui/GradientBG'

/**
 * Компонент контентного контейнера без боковых отступов
 * Используется для создания общего фона для страниц с радиальным градиентом
 */

type Props = { children: React.ReactNode; hasSidePadding?: boolean }
export const BackgroundLayoutNoSidePadding = ({
    children,
    hasSidePadding = true,
}: Props) => {
    const { width: SCREEN_WIDTH } = useWindowDimensions()

    return (
        <View style={styles.container}>
            {/* Радиальный градиент с blur-эффектом */}
            {/*<RadialGradientBackground />*/}

            <View style={[styles.gradientContainer, { width: SCREEN_WIDTH }]}>
                <GradientBg />
            </View>

            {/* Контент */}
            <SafeAreaContainer
                style={[styles.contentContainer, hasSidePadding && styles.paddingContent]}
            >
                {children}
            </SafeAreaContainer>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
        zIndex: 3,
        overflow: 'hidden',
    },
    gradientContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    contentContainer: {
        flex: 1,
    },
    paddingContent: {
        paddingHorizontal: 14,
    },
})
