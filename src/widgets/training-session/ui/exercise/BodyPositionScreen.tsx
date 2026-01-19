import { PoseCamera } from '@/widgets/pose-camera'
import {
	View, Text, Dimensions, useWindowDimensions, Platform,
} from 'react-native'
import { useState, useEffect, useRef, useCallback } from 'react'
import type * as posedetection from '@tensorflow-models/pose-detection'
import * as ScreenOrientation from 'expo-screen-orientation'
import Svg, { Circle } from 'react-native-svg'
import BodySilhouetteDefault from '@/assets/images/body_silhouette_default.svg'
import BodySilhouetteSideVertical from '@/assets/images/body_silhouette_side.svg'
import { BackgroundLayoutNoSidePadding } from '@/shared/ui'

const IS_ANDROID = Platform.OS === 'android'

type BodyPositionScreenProps = {
	isVertical?: boolean
	onComplete: () => void
	model: posedetection.PoseDetector
	orientation: ScreenOrientation.Orientation
	title?: string
	subtitle?: string
	titleClassName?: string
	subtitleClassName?: string
	successText?: string
	/** Для side_switch: целевая сторона (left/right) — показывает боковой силуэт */
	targetSide?: 'left' | 'right'
}


export const BodyPositionScreen = ({
	isVertical,
	onComplete,
	model,
	orientation,
	title = 'Примите исходное положение',
	subtitle = 'Встаньте так, чтобы ваше тело полностью попадало в кадр и входило в контур',
	titleClassName,
	subtitleClassName,
	successText = 'Вперёд!',
	targetSide,
}: BodyPositionScreenProps) => {
	const [showSuccess, setShowSuccess] = useState(false)
	const isCompletedRef = useRef(false)
	const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const completionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	const isPortrait = useCallback(() => {
		return (
			orientation === ScreenOrientation.Orientation.PORTRAIT_UP ||
			orientation === ScreenOrientation.Orientation.PORTRAIT_DOWN
		)
	}, [orientation])

	const { width } = useWindowDimensions()
	const CAM_PREVIEW_HEIGHT = isPortrait()
		? Dimensions.get('window').height * 0.6
		: Dimensions.get('window').height

	const handleAllKeypointsDetected = useCallback((allDetected: boolean) => {
		if (allDetected && !showSuccess && !isCompletedRef.current) {
			if (successTimerRef.current) return // Already counting

			successTimerRef.current = setTimeout(() => {
				setShowSuccess(true)
				completionTimerRef.current = setTimeout(() => {
					if (!isCompletedRef.current) {
						isCompletedRef.current = true
						onComplete()
					}
				}, 500) // Small delay after success text shows
			}, 1500)
		} else if (!allDetected && !showSuccess) {
			// Reset if lost during countdown
			if (successTimerRef.current) {
				clearTimeout(successTimerRef.current)
				successTimerRef.current = null
			}
		}
	}, [onComplete, showSuccess])

	useEffect(() => {
		return () => {
			if (successTimerRef.current) clearTimeout(successTimerRef.current)
			if (completionTimerRef.current) clearTimeout(completionTimerRef.current)
		}
	}, [])


	const renderSilhouette = () => {
		let res = <></>
		const stroke = showSuccess ? '#8BC34A' : 'white'
		const fill = showSuccess ? 'rgba(139,195,74,0.36)' : 'transparent'

		if (isVertical && targetSide) {
			res = 	<View>
				<BodySilhouetteSideVertical
					width={650}
					height={650}
					style={targetSide === 'left' ? { transform: [{ scaleX: -1 }] } : undefined}
					stroke={stroke}
					fill={fill}
				/>
			</View>
		}
	if (isVertical && !targetSide) {
			res = 		<View>
				<BodySilhouetteDefault
					height={CAM_PREVIEW_HEIGHT}
					stroke={stroke}
					fill={fill}
				/>
			</View>
		}

		 if (!isVertical && targetSide) {
			res =  <View style={{ transform: [{ rotate: '90deg' }] }}>
				<BodySilhouetteDefault
					style={targetSide === 'left' ? { transform: [{ scaleX: -1 }] } : undefined}
					height={CAM_PREVIEW_HEIGHT}
					stroke={stroke}
					fill={fill}
				/>
			</View>
		}

	 if (!isVertical && !targetSide) {
			res =  <View style={{ transform: [{ rotate: '90deg' }] }}>
				<BodySilhouetteDefault
					height={CAM_PREVIEW_HEIGHT}
					stroke={stroke}
					fill={fill}
				/>
			</View>
		}

		return res
	}

	return (
		<View className="flex-1 bg-transparent">
			<BackgroundLayoutNoSidePadding edges={IS_ANDROID ? ['right'] : []} hasSidePadding={false}>
				<View
					style={{
						height: isVertical ? CAM_PREVIEW_HEIGHT : '100%',
						width: '100%',
						backgroundColor: 'transparent',
						borderRadius: 24,
						overflow: 'hidden',
					}}
				>
					<PoseCamera
						model={model}
						orientation={orientation}
						onAllKeypointsDetected={handleAllKeypointsDetected}
					/>

					{/* Grid pattern overlay */}
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
				<View className="absolute inset-0 items-center justify-start" style={{ pointerEvents: 'none', top: 0 }}>
					{renderSilhouette()}
				</View>

				<View className={`${isVertical ? 'mt-10' : 'absolute  bottom-10  left-1/2 -translate-x-1/2'}`}>
					<Text className={titleClassName ?? 'mb-2 text-center text-h2 text-light-text-100'}>
						{title}
					</Text>
					{subtitle && (
						<Text className={subtitleClassName ?? 'text-center text-t2 text-light-text-200'}>
							{subtitle}
						</Text>
					)}

					{showSuccess && (
						<View className="mt-6 items-center">
							<Text className="text-h1 text-brand-green-500">{successText}</Text>
						</View>
					)}
				</View>
			</BackgroundLayoutNoSidePadding>
		</View>
	)
}
