
import {
	Dimensions, StyleSheet, Text, useWindowDimensions, View,
} from 'react-native'

import { PoseCamera } from '@/widgets/pose-camera'
import Svg, { Circle } from 'react-native-svg'
import BodySilhouetteDefault from '@/assets/images/body_silhouette_default.svg'
import BodySilhouetteSide from '@/assets/images/body_silhouette_side.svg'
import React, { useRef, useState } from 'react'

import type * as posedetection from '@tensorflow-models/pose-detection'
import { CloseBtn } from '@/shared/ui/CloseBtn'

import { GradientBg } from '@/shared/ui/GradientBG'
import {
	type ProgressCaptureFlowState
} from '@/features/progress-capture/ui/PhonePosition'
import { type ProgressSide } from '@/entities/progress'


interface PositionReadyProps extends ProgressCaptureFlowState {
 	model: posedetection.PoseDetector
	side : ProgressSide
}
export const PositionReady = ({model, setStep, handleStop, side}: PositionReadyProps) => {


	const CAM_PREVIEW_HEIGHT = Dimensions.get('window').height * 0.6

	const { width } = useWindowDimensions()
	const [showSuccess, setShowSuccess] = useState(false)
	const successTimerRef = useRef<NodeJS.Timeout | null>(null)
	const allKeypointsDetectedRef = useRef(false)
	const isLeftSide = side === 'left'

	const handleAllKeypointsDetected = (allDetected: boolean) => {
		if (allDetected && !allKeypointsDetectedRef.current) {
			allKeypointsDetectedRef.current = true

			// Clear any existing timer
			if (successTimerRef.current) {
				clearTimeout(successTimerRef.current)
			}

			// Set success after 2 seconds
			successTimerRef.current = setTimeout(() => {
				setShowSuccess(true)
			}, 2000)
			successTimerRef.current = setTimeout(() => {
				setStep('capture')
			}, 2200)
		}
	}


	return 		<View className="flex-1">
		<View style={styles.background} pointerEvents="none">
			<GradientBg />
		</View>

		<View style={styles.content}>
			<View className="absolute right-4 z-10 top-10">
				<CloseBtn handlePress={handleStop} classNames="h-12 w-12 rounded-2xl" />
			</View>
					<View
						style={{
							height: CAM_PREVIEW_HEIGHT,
							backgroundColor: 'transparent',
							borderBottomLeftRadius: 24,
							borderBottomRightRadius: 24,
							overflow: 'hidden',
						}}
					>
						<PoseCamera
							model={model}
							orientation={1}
							onAllKeypointsDetected={handleAllKeypointsDetected}
						/>

						{/* Grid pattern overlay - inside camera view */}
						<View className="absolute inset-0" style={{ pointerEvents: 'none' }}>
							<Svg
								width={width}
								height={CAM_PREVIEW_HEIGHT}
								viewBox={`0 0 ${width} ${CAM_PREVIEW_HEIGHT}`}
							>
								{Array.from({ length: Math.ceil(width / 20) }, (_, i) =>
									Array.from({ length: Math.ceil(CAM_PREVIEW_HEIGHT / 20) }, (_, j) => (
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
					</View>

					{/* Body Silhouette Overlay */}
						<View className="absolute inset-0 items-center justify-start pt-20">
							{

								side == 'front' || side == 'back' ?
								<BodySilhouetteDefault
									stroke={showSuccess ? '#8BC34A' : 'white'}
									fill={showSuccess ? 'rgba(139,195,74,0.36)' : 'transparent'}
								/> : <BodySilhouetteSide
										style={isLeftSide ? { transform: [{ scaleX: -1 }] } : undefined}
										stroke={showSuccess ? '#8BC34A' : 'white'}
										fill={showSuccess ? 'rgba(139,195,74,0.36)' : 'transparent'}
									/>
							}
						</View>


					<View className=" pt-10 pl-4">
						<Text
							className={'mb-2 text-left text-h2 text-light-text-100'}
						>
							Примите исходное положение
						</Text>

							<Text
								className={'text-left text-t2 text-light-text-200'}
							>
								Встаньте так, чтобы ваше тело полностью помещалось в кадр и входило в контур
							</Text>


						{showSuccess && (
							<View className="mt-6 items-center">
								<Text className="text-h1 text-brand-green-500">Начнём!</Text>
							</View>
						)}


					</View>
		</View>

		</View>

}

		const styles = StyleSheet.create({
		background: {
		...StyleSheet.absoluteFillObject,
		zIndex: 0,
		bottom: -200,
	},

		content: {
		flex: 1,
		position: 'relative',
		zIndex: 1,
	},
	})
