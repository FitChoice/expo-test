/**
 * Gyroscope Level Screen (2.3, 2.4)
 * Четвертый шаг onboarding - калибровка уровня
 * Показывает текущий угол наклона телефона (вперёд-назад) и подсказку выровнять его
 */

import {
    View,
    Text,
    Animated,
    type StyleProp,
    type ViewStyle,
} from 'react-native'
import { Accelerometer } from 'expo-sensors'
import { useState, useEffect, useRef } from 'react'
import { useIsFocused } from '@react-navigation/native'
import { Button } from '@/shared/ui'
import { DotsProgress } from '@/shared/ui/DotsProgress'
import { CloseBtn } from '@/shared/ui/CloseBtn'
import { router } from 'expo-router'
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake'
import { GradientBg } from '@/shared/ui/GradientBG'

interface GyroscopeLevelScreenProps {
	onNext: () => void;
	isVertical: boolean;
}

export function GyroscopeLevelScreen({ onNext, isVertical }: GyroscopeLevelScreenProps) {
    const [angle, setAngle] = useState(0)
    const [isCalibrated, setIsCalibrated] = useState(false)
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null)

    // Анимация поворота — остаётся в Animated (натив)
    const barRotation = useRef(new Animated.Value(0)).current

    // Цвет — уходим от Animated.Value, используем состояние
    const [barStyle, setBarStyle] = useState<StyleProp<ViewStyle>>({
        width: isVertical ? 170 : 450,
        height: 4,
        backgroundColor: '#FFFFFF',
        borderRadius: 2,
    })

    const isFocused = useIsFocused()

    useEffect(() => {
        let subscription: { remove: () => void } | null = null
        let keepAwakeActivated = false

        const init = async () => {
            try {
                await activateKeepAwakeAsync()
                keepAwakeActivated = true

                const available = await Accelerometer.isAvailableAsync()
                setIsAvailable(available)
                if (!available || !isFocused) return

                Accelerometer.setUpdateInterval(100)

                subscription = Accelerometer.addListener(({ x, y, z }) => {
                    let angleDeg: number
                    let isAligned: boolean

                    if (isVertical) {
                        // Угол наклона вперед-назад, когда телефон стоит вертикально
                        // y ≈ -1 когда телефон вертикален, z показывает наклон вперед/назад
                        const angleRad = Math.atan2(z, Math.abs(y))
                        angleDeg = Math.round((angleRad * 180) / Math.PI)
					
                        // Телефон вертикален, когда angleDeg близок к 0
                        isAligned = Math.abs(angleDeg) <= 5
                    } else {
                        // Для горизонтального положения: проверяем перпендикулярность экрана к поверхности
                        // Когда экран перпендикулярен поверхности, телефон повернут на 90° относительно горизонтали
                        // Используем x и z для расчета угла наклона в горизонтальной плоскости
                        const angleRad = Math.atan2(x, Math.abs(z))
                        angleDeg = Math.round((angleRad * 180) / Math.PI)
					
                        // Экран перпендикулярен поверхности, когда угол близок к 90° или -90°
                        // Проверяем отклонение от 90° (или -90°)
                        const deviationFrom90 = Math.abs(Math.abs(angleDeg) - 90)
                        isAligned = deviationFrom90 <= 5
                    }
			  
                    setAngle(angleDeg)
			  
                    // Анимация полоски
                    // Для горизонтального положения нормализуем угол, чтобы полоска была горизонтальной при 0°
                    const normalizedAngle = isVertical ? angleDeg : (angleDeg >= 0 ? angleDeg - 90 : angleDeg + 90)
                    Animated.timing(barRotation, {
				  toValue: normalizedAngle,
				  duration: 100,
				  useNativeDriver: true,
                    }).start()
			  
                    setIsCalibrated(isAligned)
			  
                    setBarStyle({
                        width: isVertical ? 170 : 450,
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: isAligned ? '#C5F680' : '#FFFFFF',
                    }) 
			  })
				  
            } catch (error) {
                setIsAvailable(false)
                console.error('Accelerometer setup error:', error)
            }
        }

        init()

        return () => {
            if (subscription) subscription.remove()
            if (keepAwakeActivated) {
                deactivateKeepAwake()
            }
        }
    }, [isFocused, isVertical])

    const handleStop = () => {
        router.back()
    }

    return (
        <View className="bg-background-primary flex-1 items-center">

            {/* Gradient Background */}
            <GradientBg  />
            {/* Close Button */}
            <View className={`absolute  ${isVertical ? 'top-12 right-5' : 'top-5 right-16'} z-10`}>
                <CloseBtn handlePress={handleStop} classNames={'h-12 w-12 rounded-2xl'} />
            </View>

            {/* Progress Dots */}
            <View   className={`absolute left-1/2 -translate-x-1/2 ${isVertical ? 'top-20' : 'top-5'} z-10`}>
                <DotsProgress total={4} current={3} variant="onboarding" />
            </View>
            {/* Content */}
            <View className="flex-1 items-center justify-center pt-20 w-full">
                {/* Gyroscope Visualizer */}
                <View className="flex-row items-center justify-center w-full px-6 ">
                    {/* Left side bar */}
                    <View 
                        style={{
                            width: 80,
                            height: 4,
                            backgroundColor: (barStyle as ViewStyle)?.backgroundColor || '#6e6e6e',//!isCalibrated ? 'green' : 'red',
                            borderRadius: 2,
                        }}
                    />
					
                    {/* Main animated bar */}
                    <Animated.View
                        style={[
                            {
                                transform: [
                                    {
                                        rotate: barRotation.interpolate({
                                            inputRange: [-45, 0, 45], // отклонения влево и вправо
                                            outputRange: ['-45deg', '0deg', '45deg'],
                                        }),
                                    },
                                ],
                            },
                            barStyle,
                        ]}
                    />
					
                    {/* Right side bar */}
                    <View 
                        style={{
                            width: 80,
                            height: 4,
                            backgroundColor: (barStyle as ViewStyle)?.backgroundColor || '#6e6e6e',
                            borderRadius: 2,
                        }}
                    />
                </View>

                <Text className={`text-h1 text-center ${isAvailable !== false && !isCalibrated ? 'text-light-text-100' : 'text-brand-green-500'} ${isVertical ? 'mt-4 mb-12' : ''}`}>
                    { isVertical ? angle : angle - 90 }°
                </Text>
		
            </View>

            {/* Text and Button Section */}
            <View className={`px-6 pb-6 ${isVertical ? 'w-full' : 'justify-center items-center w-1/2'}`}>
                {/* Title */}
                <Text className="text-h2 font-bold text-light-text-100 mb-3 text-left">
					Проверьте уровень
                </Text>

                {/* Description */}
                <Text className={`text-t2 text-light-text-500 text-left leading-6 ${isVertical ? 'mb-20' : 'mb-10'}`}>
					Поставьте телефон так, чтобы он стоял ровно и градус наклона был равен 0</Text>

                {/* Button */}

                <Button
                    variant="primary"
                    onPress={onNext}
                    disabled={isAvailable !== false && !isCalibrated}
                    className={isVertical ? 'w-full' : 'w-1/2'}
                >
				Далее
                </Button>
			
            </View>

        </View>
    )
}
