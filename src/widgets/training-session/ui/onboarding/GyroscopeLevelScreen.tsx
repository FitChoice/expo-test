/**
 * Gyroscope Level Screen (2.3, 2.4)
 * Четвертый шаг onboarding - калибровка уровня
 * Показывает текущий угол наклона телефона (вперёд-назад) и подсказку выровнять его
 */
import * as ScreenOrientation from 'expo-screen-orientation'
import {
	View,
	Text,
	Animated,
	type StyleProp,
	type ViewStyle,
} from 'react-native'
import { Accelerometer, DeviceMotion } from 'expo-sensors'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useIsFocused } from '@react-navigation/native'
import { Button } from '@/shared/ui'
import { DotsProgress } from '@/shared/ui/DotsProgress'
import { CloseBtn } from '@/shared/ui/CloseBtn'
import { router } from 'expo-router'
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake'

type MotionOrientation = 0 | 90 | 180 | -90

const toMotionOrientation = (
	orientation: ScreenOrientation.Orientation | null
): MotionOrientation | null => {
	switch (orientation) {
		case ScreenOrientation.Orientation.PORTRAIT_UP:
			return 0
		case ScreenOrientation.Orientation.LANDSCAPE_RIGHT:
			return 90
		case ScreenOrientation.Orientation.PORTRAIT_DOWN:
			return 180
		case ScreenOrientation.Orientation.LANDSCAPE_LEFT:
			return -90
		default:
			return null
	}
}

const normalizeToPortrait = (
	x: number,
	y: number,
	z: number,
	orientation: MotionOrientation | null
) => {
	if (orientation === 90) {
		return { x: y, y: -x, z }
	}
	if (orientation === -90) {
		return { x: -y, y: x, z }
	}
	if (orientation === 180) {
		return { x: -x, y: -y, z }
	}
	return { x, y, z }
}

const computeTiltAngle = (x: number, y: number, z: number) => {
	const angleRad = Math.atan2(z, Math.abs(y))
	return Math.round((angleRad * 180) / Math.PI)
}

interface GyroscopeLevelScreenProps {
	onNext: () => void
	isVertical: boolean
}

export function GyroscopeLevelScreen({ onNext, isVertical }: GyroscopeLevelScreenProps) {
	const [angle, setAngle] = useState(0)
	const [isCalibrated, setIsCalibrated] = useState(false)
	const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
	const orientationRef = useRef<ScreenOrientation.Orientation | null>(null)

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

	const updateCalibration = useCallback((angleDeg: number) => {
		const isAligned = Math.abs(angleDeg) <= 5

		setAngle(angleDeg)

		Animated.timing(barRotation, {
			toValue: angleDeg,
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
	}, [barRotation, isVertical])

	useEffect(() => {
		let subscription: { remove: () => void } | null = null
		let orientationSubscription: { remove: () => void } | null = null
		let keepAwakeActivated = false

		const init = async () => {
			try {
				await activateKeepAwakeAsync()
				keepAwakeActivated = true

				const deviceMotionAvailable = await DeviceMotion.isAvailableAsync()
				if (deviceMotionAvailable && isFocused) {
					setIsAvailable(true)
					DeviceMotion.setUpdateInterval(100)
					subscription = DeviceMotion.addListener((measurement) => {
						const accel = measurement.accelerationIncludingGravity
						if (!accel) return

						const motionOrientation =
							typeof measurement.orientation === 'number'
								? (measurement.orientation as MotionOrientation)
								: null
						const oriented = normalizeToPortrait(
							accel.x,
							accel.y,
							accel.z,
							motionOrientation
						)
						updateCalibration(computeTiltAngle(oriented.x, oriented.y, oriented.z))
					})
					return
				}

				const available = await Accelerometer.isAvailableAsync()
				setIsAvailable(available)
				if (!available || !isFocused) return

				orientationRef.current = await ScreenOrientation.getOrientationAsync()
				orientationSubscription = ScreenOrientation.addOrientationChangeListener((event) => {
					orientationRef.current = event.orientationInfo.orientation
				})

				Accelerometer.setUpdateInterval(100)
				subscription = Accelerometer.addListener(({ x, y, z }) => {
					const motionOrientation = toMotionOrientation(orientationRef.current)
					const oriented = normalizeToPortrait(x, y, z, motionOrientation)
					updateCalibration(computeTiltAngle(oriented.x, oriented.y, oriented.z))
				})
			} catch (error) {
				setIsAvailable(false)
				console.error('Accelerometer setup error:', error)
			}
		}

		init()

		return () => {
			if (subscription) subscription.remove()
			if (orientationSubscription) {
				ScreenOrientation.removeOrientationChangeListener(orientationSubscription)
			}
			if (keepAwakeActivated) {
				deactivateKeepAwake()
			}
		}
	}, [isFocused, isVertical, updateCalibration])

	const handleStop = () => {
		router.back()
	}

	return (
		<View className="flex-1 items-center">
			{/* Close Button */}
			<View className={`absolute ${isVertical ? 'right-5' : 'right-16 top-5'} z-10`}>
				<CloseBtn handlePress={handleStop} classNames={'h-12 w-12 rounded-2xl'} />
			</View>

			{/* Progress Dots */}
			<View
				className={`absolute left-1/2 -translate-x-1/2 ${isVertical ? 'top-10' : 'top-5'} z-10`}
			>
				<DotsProgress total={4} current={3} variant="onboarding" />
			</View>
			{/* Content */}
			<View className="w-full flex-1 items-center justify-center pt-20">
				{/* Gyroscope Visualizer */}
				<View className="w-full flex-row items-center justify-center px-6">
					{/* Left side bar */}
					<View
						style={{
							width: 80,
							height: 4,
							backgroundColor: (barStyle as ViewStyle)?.backgroundColor || '#6e6e6e', //!isCalibrated ? 'green' : 'red',
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

				<Text
					className={`text-center text-h1 ${isAvailable !== false && !isCalibrated ? 'text-light-text-100' : 'text-brand-green-500'} ${isVertical ? 'mb-12 mt-4' : ''}`}
				>
				{angle}°
				</Text>
			</View>

			{/* Text and Button Section */}
			<View
				className={`px-6 pb-10 ${isVertical ? 'w-full' : 'w-1/2 items-center justify-center'}`}
			>
				{/* Title */}
				<Text className="mb-3 text-left text-h2 font-bold text-light-text-100">
					Проверьте уровень
				</Text>

				{/* Description */}
				<Text
					className={`text-left text-t2 leading-6 text-light-text-500 ${isVertical ? 'mb-20' : 'mb-10'}`}
				>
					Поставьте телефон так, чтобы он стоял ровно и градус наклона был равен 0
				</Text>

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
