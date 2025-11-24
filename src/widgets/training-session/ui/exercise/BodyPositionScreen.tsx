import {
    ExerciseWithCounterWrapper
} from '@/shared/ui/ExerciseWithCounterWrapper/ExerciseWithCounterWrapper'
import { PoseCamera } from '@/widgets/pose-camera'
import { View, Text, Dimensions } from 'react-native'
import { useState, useEffect } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { useStatusBar } from '@/shared/lib'
import type * as posedetection from '@tensorflow-models/pose-detection'
import type * as ScreenOrientation from 'expo-screen-orientation'

type BodyPositionScreenProps = {
	isVertical?: boolean,
	onComplete: () => void,
	model: posedetection.PoseDetector
	orientation: ScreenOrientation.Orientation
}

const CAM_PREVIEW_HEIGHT = Dimensions.get('window').height - 180

export  const BodyPositionScreen = ({ isVertical, onComplete, model, orientation }: BodyPositionScreenProps) => {

    const [showSuccess, setShowSuccess] = useState(false)

    // Настройка статус-бара: светлые иконки для темного градиента
    useStatusBar({
        style: 'light',
        backgroundColor: '#BA9BF7', // Цвет фона статус-бара на Android (совпадает с градиентом)
    })

    useEffect(() => {
        // Reset state when component mounts
        setShowSuccess(false)
    
        const successTimer = setTimeout(() => {
            setShowSuccess(true)
        }, 7000)
    
        const completeTimer = setTimeout(() => {
            onComplete()
        }, 8000)
    
        return () => {
            clearTimeout(successTimer)
            clearTimeout(completeTimer)
        }
    }, [onComplete])

    return <ExerciseWithCounterWrapper
        onComplete={onComplete}
    >
        <View>
            <PoseCamera model={model} orientation={orientation} />
        </View>

        {/*/!* Grid pattern background - full width and height *!/*/}
        {/*<View className="absolute top-0 left-0 right-0 rounded-3xl " style={{ height: screenHeight }}>*/}
        {/*    <Svg width={width} height={screenHeight} viewBox={`0 0 ${width} ${screenHeight}`}>*/}
        {/*        /!* Grid pattern background *!/*/}
        {/*        {Array.from({ length: Math.ceil(width / 20) }, (_, i) =>*/}
        {/*            Array.from({ length: Math.ceil(screenHeight / 20) }, (_, j) => (*/}
        {/*                <Circle*/}
        {/*                    key={`grid-${i}-${j}`}*/}
        {/*                    cx={i * 20 + 10}*/}
        {/*                    cy={j * 20 + 10}*/}
        {/*                    r="1.5"*/}
        {/*                    fill="#E5E5E5"*/}
        {/*                    opacity="0.6"*/}
        {/*                />*/}
        {/*            ))*/}
        {/*        )}*/}
        {/*    </Svg>*/}
        {/*</View>*/}

        <LinearGradient
            colors={['#BA9BF7', '#000000']}
            locations={[0, 0.8]}
            start={{ x: -0.5, y: 0.9 }}
            end={{ x: 0.5, y: 1 }}
            style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                top: CAM_PREVIEW_HEIGHT,
                padding: 24
            }}
        >

            <Text className="text-h2 text-light-text-100 mb-2 text-center">
				Примите исходное положение
            </Text>
            <Text className="text-t2 text-light-text-200 text-center">
				Встаньте так, чтобы ваше тело полностью попадало в кадр и входило в
				контур
            </Text>

            {showSuccess && (<View className="mt-6 items-center">
                <Text className="text-h1 text-brand-green-500">Вперёд!</Text>
            </View>)}
        </LinearGradient>

    </ExerciseWithCounterWrapper>
}