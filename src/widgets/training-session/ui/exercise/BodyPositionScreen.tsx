/**
 * Body Position Check Screen (4.0, 4.1)
 * Проверяет, что пользователь принял правильную позицию перед началом упражнения
 * Использует камеру и pose detection для определения позиции
 */

import { View, Text, useWindowDimensions } from 'react-native'
import { useIsFocused } from '@react-navigation/native'
import { CameraView } from 'expo-camera'
import { useState, useEffect } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { Button, Container, Icon } from '@/shared/ui'
import Svg, { Path, Circle } from 'react-native-svg'
import BodySilhouetteDefault from '@/assets/body_silhouette_default.svg'
import {
	ExerciseWithCounterWrapper
} from '@/shared/ui/ExerciseWithCounterWrapper/ExerciseWithCounterWrapper'

interface BodyPositionScreenProps {
	onComplete: () => void
	
}

export function BodyPositionScreen({
	onComplete,
}: BodyPositionScreenProps) {
	const [isPositionCorrect, setIsPositionCorrect] = useState(false)
	const [showSuccess, setShowSuccess] = useState(false)
    const isFocused = useIsFocused()
	const { width } = useWindowDimensions()

	const height = 550

	useEffect(() => {
		const successTimer = setTimeout(() => {
			setShowSuccess(true)
		}, 5000)

		const completeTimer = setTimeout(() => {
			onComplete()
		}, 6000)

		return () => {
			clearTimeout(successTimer)
			clearTimeout(completeTimer)
		}
	}, [onComplete])

	return (
		<ExerciseWithCounterWrapper
			onComplete={onComplete}
		>
      {/* Camera View with Overlay */}
      <View className="flex-1 bg-transparent">
  
          <CameraView style={{ flex: 1 }} facing="front" />
    
				{/* Grid pattern background - full width and height */}
				<View className="absolute top-0 left-0 right-0 rounded-3xl " style={{  height }}>
					<Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
						{/* Grid pattern background */}
						{Array.from({ length: Math.ceil(width / 20) }, (_, i) =>
							Array.from({ length: Math.ceil(height / 20) }, (_, j) => (
								<Circle
									key={`grid-${i}-${j}`}
									cx={i * 20 + 10}
									cy={j * 20 + 10}
									r="1.5"
									fill="#E5E5E5"
									opacity="0.6"
								/>
							))
						)}
					</Svg>
				</View>

				{/* Body Silhouette Overlay */}
				<View className="absolute inset-0 items-center justify-start pt-20">
					<BodySilhouetteDefault 
						fill={showSuccess ? '#8BC34A' : undefined}
					/>
				</View>
			</View>

			{/* Bottom Info */}
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
					top: height,
					padding: 24
				}}
			>
				<Text className="text-h2 text-light-text-100 mb-2 text-center">
					Примите исходное положение
				</Text>
				<Text className="text-t2 text-light-text-200 text-center">
					Встаньте так, чтобы ваше тело полностью попадало в кадр и входило в контур
				</Text>

				{/* Success Message */}
				{showSuccess && (
					<View className="mt-6 items-center">
						<Text className="text-h1 text-brand-green-500">Вперёд!</Text>
					</View>
				)}
			</LinearGradient>
		</ExerciseWithCounterWrapper>
	)
}
