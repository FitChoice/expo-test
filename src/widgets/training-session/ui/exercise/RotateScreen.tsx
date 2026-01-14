/**
 * RotateScreen
 * Экран для проверки ориентации устройства перед упражнением.
 * Проверяет соответствие текущей ориентации и требуемой для упражнения.
 */

import { View, Text, Alert } from 'react-native'
import { useEffect, useRef, useCallback } from 'react'
import * as ScreenOrientation from 'expo-screen-orientation'
import RotatePhoneIcon from 'src/assets/images/rotate_phone_image.svg'
import { BackgroundLayoutNoSidePadding } from '@/shared/ui/BackgroundLayout'

interface RotateScreenProps {
	isVertical: boolean // true = нужна portrait, false = нужна landscape
	onComplete: () => void
}

export function RotateScreen({ isVertical, onComplete }: RotateScreenProps) {
	const hasTriggeredRef = useRef(false)
	const hasShownAlertRef = useRef(false)

	const checkOrientation = useCallback(async (orientation: ScreenOrientation.Orientation) => {
		if (hasTriggeredRef.current) return

		const isPortrait =
			orientation === ScreenOrientation.Orientation.PORTRAIT_UP ||
			orientation === ScreenOrientation.Orientation.PORTRAIT_DOWN
		const isLandscape =
			orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
			orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT

		// Проверяем соответствие: isVertical === true нужна portrait, isVertical === false нужна landscape
		if ((isVertical && isPortrait) || (!isVertical && isLandscape)) {
			hasTriggeredRef.current = true
			onComplete()
		}
	}, [isVertical, onComplete])

	useEffect(() => {
		let isMounted = true
		let checkTimeout: ReturnType<typeof setTimeout> | null = null

		const setup = async () => {
			try {
				await ScreenOrientation.unlockAsync()
				const current = await ScreenOrientation.getOrientationAsync()
				if (isMounted) await checkOrientation(current)
				
				// Alert if not rotated after 3 seconds
				checkTimeout = setTimeout(async () => {
					if (isMounted && !hasTriggeredRef.current && !hasShownAlertRef.current) {
						hasShownAlertRef.current = true
						Alert.alert('Разблокируйте поворот экрана', 'Для продолжения необходимо повернуть устройство.')
					}
				}, 3000)

			} catch (err) {
				console.warn('ScreenOrientation error:', err)
			}
		}

		setup()

		const subscription = ScreenOrientation.addOrientationChangeListener((event) => {
			if (isMounted) checkOrientation(event.orientationInfo.orientation)
		})

		// Polling as a fallback for some devices where listener might fail
		const interval = setInterval(async () => {
			if (isMounted && !hasTriggeredRef.current) {
				const current = await ScreenOrientation.getOrientationAsync()
				checkOrientation(current)
			}
		}, 500)

		return () => {
			isMounted = false
			if (checkTimeout) clearTimeout(checkTimeout)
			if (subscription) ScreenOrientation.removeOrientationChangeListener(subscription)
			if (interval) clearInterval(interval)
		}
	}, [checkOrientation])

	return (
		<BackgroundLayoutNoSidePadding>
			<View className="flex-1 items-center justify-center gap-10">
				<RotatePhoneIcon />
				<Text className="mb-20 text-center text-h2 leading-6 text-light-text-200">
					{isVertical
						? 'Поверните телефон вертикально'
						: 'Поверните телефон горизонтально'}
				</Text>
			</View>
		</BackgroundLayoutNoSidePadding>
	)
}
