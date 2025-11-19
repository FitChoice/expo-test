import { View, Text, Animated, Easing, useWindowDimensions } from 'react-native';

import { useEffect, useRef, useState } from 'react'
import * as ScreenOrientation from 'expo-screen-orientation'
import { GradientBg } from '@/shared/ui/GradientBG'
import { CloseBtn } from '@/shared/ui/CloseBtn'
import { router } from 'expo-router'
import RotatePhoneIcon from 'src/assets/images/rotate_phone_image.svg'

interface RotatePhoneScreenProps {
	onNext: () => void
}

export function RotatePhoneScreen({ onNext }: RotatePhoneScreenProps) {

	const { width, height } = useWindowDimensions();
	const handleStop = () => {
		router.back()
	}




	// // Анимация мерцания
	// const opacity = useRef(new Animated.Value(0.5)).current
	//
	// useEffect(() => {
	// 	Animated.loop(
	// 		Animated.sequence([
	// 			Animated.timing(opacity, {
	// 				toValue: 1,
	// 				duration: 500,
	// 				easing: Easing.inOut(Easing.ease),
	// 				useNativeDriver: true,
	// 			}),
	// 			Animated.timing(opacity, {
	// 				toValue: 0.3,
	// 				duration: 500,
	// 				easing: Easing.inOut(Easing.ease),
	// 				useNativeDriver: true,
	// 			}),
	// 		])
	// 	).start()
	// }, [opacity])


	// 🔓 Разблокируем ориентацию при входе
	useEffect(() => {
		ScreenOrientation.unlockAsync().catch((err) =>
			console.warn('Не удалось разблокировать ориентацию:', err)
		);

		return () => {
			ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT).catch(() => {});
		};
	}, []);

	// ✅ Отслеживаем ориентацию через слушатель (более надёжно, чем width/height)
	useEffect(() => {
		let hasTriggered = false; // Защита от дублирования вызова

		const handler = (event: ScreenOrientation.OrientationChangeEvent) => {
			if (hasTriggered) return;

			const { orientationLock } = event.orientationInfo;

			const isLandscape =
				orientationLock === ScreenOrientation.OrientationLock.LANDSCAPE_LEFT ||
				orientationLock === ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT;

			if (isLandscape) {
				hasTriggered = true;
				onNext();
			}
		};

		const subscription = ScreenOrientation.addOrientationChangeListener(handler);

		return () => {
			ScreenOrientation.removeOrientationChangeListener(subscription);
		};
	}, [onNext]);


	useEffect(() => {
		let mounted = true;
		let interval: ReturnType<typeof setInterval> | null = null;

		const startChecking = async () => {
			interval = setInterval(async () => {
				if (!mounted) {
					return;
				}

				try {
					const orientation = await ScreenOrientation.getOrientationAsync();

					if (
						orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
						orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT
					) {
						if (mounted) {
							onNext();
						}
						if (interval) {
							clearInterval(interval);
						}
					}
				} catch (err) {        console.warn('Error reading orientation:', err);
					// Если ошибка — напр. из-за permissions или unmount
				}
			}, 300);
		};

		startChecking();

		return () => {
			mounted = false;
			if (interval) {
				clearInterval(interval);
			}
		};
	}, [onNext]);


	return (
		<View className="flex-1 bg-black">
			{/* Gradient Background */}
			<GradientBg />

			{/* Close Button */}
			<View className="absolute right-4 top-12 z-10">
				<CloseBtn handlePress={handleStop} classNames="h-12 w-12 rounded-2xl" />
			</View>

			{/* Content */}
			<View className="flex-1 justify-center items-center gap-10">
				<Animated.View
					//style={{ opacity }}
				>
					<RotatePhoneIcon />
				</Animated.View>

				{/* Description */}
				<Text className="text-h2 text-light-text-200 text-center leading-6 mb-20">
					Поверните телефон горизонтально
				</Text>
			</View>
		</View>
	)
}
