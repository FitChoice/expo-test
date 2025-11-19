import React from 'react'
import { View, StyleSheet, Platform } from 'react-native'
import { BlurView } from 'expo-blur'
import Svg, {
    Defs,
    RadialGradient as SvgRadialGradient,
    Stop,
    Rect,
} from 'react-native-svg'

/**
 * Компонент радиального градиента с blur-эффектом для фона
 * Используется в auth flow экранах (landing, auth, register, verification)
 * Содержит два градиента: зеленый (верхний правый) и фиолетовый (центр левый)
 */
export const RadialGradientBackground: React.FC = () => {
    return (
        <View style={styles.container}>
            <BlurView
                intensity={80}
                tint="dark"
                style={styles.blurContainer}
                experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
                blurReductionFactor={Platform.OS === 'android' ? 4 : undefined}
            >
                <Svg
                    width="100%"
                    height="100%"
                    style={StyleSheet.absoluteFill}
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                >
                    <Defs>
                        {/* Зеленый градиент - верхний правый (сдвинут ниже на 10%) */}
                        <SvgRadialGradient
                            id="greenGradient"
                            cx="0.8"
                            cy="0.38"
                            r="0.6"
                            fx="0.8"
                            fy="0.38"
                            gradientUnits="objectBoundingBox"
                            gradientTransform="scale(1.2, 0.6)"
                        >
                            {/* Яркое ядро - зеленый brand цвет */}
                            <Stop offset="0%" stopColor="rgb(197, 246, 128)" stopOpacity="0.4" />
                            <Stop offset="15%" stopColor="rgb(197, 246, 128)" stopOpacity="0.32" />
                            <Stop offset="30%" stopColor="rgb(197, 246, 128)" stopOpacity="0.24" />

                            {/* Плавное затухание к краям */}
                            <Stop offset="50%" stopColor="rgb(197, 246, 128)" stopOpacity="0.14" />
                            <Stop offset="70%" stopColor="rgb(197, 246, 128)" stopOpacity="0.07" />
                            <Stop offset="85%" stopColor="rgb(197, 246, 128)" stopOpacity="0.03" />
                            <Stop offset="100%" stopColor="rgb(197, 246, 128)" stopOpacity="0" />
                        </SvgRadialGradient>

                        {/* Фиолетовый градиент - центр левый (еще ниже и левее) */}
                        <SvgRadialGradient
                            id="purpleGradient"
                            cx="0"
                            cy="0.85"
                            r="0.6"
                            fx="0"
                            fy="0.85"
                            gradientUnits="objectBoundingBox"
                            gradientTransform="scale(1.2, 0.6)"
                        >
                            {/* Яркое ядро - фиолетовый brand цвет */}
                            <Stop offset="0%" stopColor="rgb(186, 155, 247)" stopOpacity="0.35" />
                            <Stop offset="15%" stopColor="rgb(186, 155, 247)" stopOpacity="0.28" />
                            <Stop offset="30%" stopColor="rgb(186, 155, 247)" stopOpacity="0.2" />

                            {/* Плавное затухание к краям */}
                            <Stop offset="50%" stopColor="rgb(186, 155, 247)" stopOpacity="0.12" />
                            <Stop offset="70%" stopColor="rgb(186, 155, 247)" stopOpacity="0.06" />
                            <Stop offset="85%" stopColor="rgb(186, 155, 247)" stopOpacity="0.03" />
                            <Stop offset="100%" stopColor="rgb(186, 155, 247)" stopOpacity="0" />
                        </SvgRadialGradient>
                    </Defs>

                    {/* Рендерим оба градиента */}
                    <Rect x="0" y="0" width="100" height="100" fill="url(#greenGradient)" />
                    <Rect x="0" y="0" width="100" height="100" fill="url(#purpleGradient)" />
                </Svg>
            </BlurView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 32,
        overflow: 'hidden',
    },
    blurContainer: {
        flex: 1,
        borderRadius: 32,
        overflow: 'hidden',
    },
})
