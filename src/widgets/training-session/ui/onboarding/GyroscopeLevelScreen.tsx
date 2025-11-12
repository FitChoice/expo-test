/**
 * Gyroscope Level Screen (2.3, 2.4)
 * Четвертый шаг onboarding - калибровка уровня
 * Показывает текущий угол наклона телефона (вперёд-назад) и подсказку выровнять его
 */

import {
	View,
	Text,
	Animated,
	Platform,
	StyleProp,
	ViewStyle,
} from 'react-native';
import { Accelerometer } from 'expo-sensors';
import { useState, useEffect, useRef } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { Button } from '@/shared/ui';
import { DotsProgress } from '@/shared/ui/DotsProgress';
import { CloseBtn } from '@/shared/ui/CloseBtn';
import { router } from 'expo-router';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { GradientBg } from '@/shared/ui/GradientBG'

interface GyroscopeLevelScreenProps {
	onNext: () => void;
}

export function GyroscopeLevelScreen({ onNext }: GyroscopeLevelScreenProps) {
	const [angle, setAngle] = useState(0);
	const [isCalibrated, setIsCalibrated] = useState(false);
	const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

	// Анимация поворота — остаётся в Animated (натив)
	const barRotation = useRef(new Animated.Value(0)).current;

	// Цвет — уходим от Animated.Value, используем состояние
	const [barStyle, setBarStyle] = useState<StyleProp<ViewStyle>>({
		width: 200,
		height: 4,
		backgroundColor: '#FFFFFF',
		borderRadius: 2,
	});

	const isFocused = useIsFocused();

	useEffect(() => {
		let subscription: { remove: () => void } | null = null;
		let keepAwakeActivated = false;

		const init = async () => {
			try {
				await activateKeepAwakeAsync();
				keepAwakeActivated = true;

				const available = await Accelerometer.isAvailableAsync();
				setIsAvailable(available);
				if (!available || !isFocused) return;

				Accelerometer.setUpdateInterval(100);

			subscription = Accelerometer.addListener(({ x, y, z }) => {
				// Угол наклона вперед-назад, когда телефон стоит вертикально
				// y ≈ -1 когда телефон вертикален, z показывает наклон вперед/назад
				const angleRad = Math.atan2(z, Math.abs(y));
				const angleDeg = Math.round((angleRad * 180) / Math.PI);
			  
				setAngle(angleDeg);
			  
				// Анимация полоски — линия горизонтальна при angleDeg=0 (вертикальный телефон)
				Animated.timing(barRotation, {
				  toValue: angleDeg,
				  duration: 100,
				  useNativeDriver: true,
				}).start();
			  
				// Телефон вертикален, когда angleDeg близок к 0
				const isAligned = Math.abs(angleDeg) <= 5;
				setIsCalibrated(isAligned);
			  
				setBarStyle({
				  width: 200,
				  height: 4,
				  backgroundColor: isAligned ? '#C5F680' : '#FFFFFF',
				  borderRadius: 2,
				});
			  });
				  
			} catch (error) {
				setIsAvailable(false);
				console.error('Accelerometer setup error:', error);
			}
		};

		init();

		return () => {
			if (subscription) subscription.remove();
			if (keepAwakeActivated) {
				deactivateKeepAwake();
			}
		};
	}, [isFocused]);

	const handleStop = () => {
		router.back();
	};

	return (
		<View className="bg-background-primary flex-1  ">

			{/* Gradient Background */}
			<GradientBg  />
			{/* Close Button */}
			<View className="absolute right-4 top-12 z-10">
				<CloseBtn handlePress={handleStop} classNames={"h-12 w-12 rounded-2xl"} />
			</View>

			{/* Progress Dots */}
			<View className="absolute left-1/2 -translate-x-1/2 top-20 z-10">
				<DotsProgress total={4} current={3} variant="onboarding" />
			</View>
			{/* Content */}
			<View className="flex-1 items-center justify-center px-6">
				{/* Gyroscope Visualizer */}
				<View className="w-full items-center justify-center">
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
				</View>

			{/* Угол или fallback для веба */}
			{isAvailable === false && Platform.OS === 'web' ? (
				<Text className="text-body-regular text-text-secondary mt-4 mb-12 text-center">
					Датчик акселерометра недоступен в веб. Нажмите «Далее», чтобы продолжить.
				</Text>
			) : (
				<Text className={`text-h1 mt-4 mb-12 text-center ${isAvailable !== false && !isCalibrated ? 'text-light-text-100' : 'text-brand-green-500'}`}>
					{angle}°
				</Text>
			)}
			</View>

			{/* Text and Button Section */}
			<View className="px-6 pb-6">
				{/* Title */}
				<Text className="text-h2 font-bold text-light-text-100 mb-3 text-left">
					Проверьте уровень
				</Text>

				{/* Description */}
				<Text className="text-t2 text-light-text-500 text-left leading-6 mb-20">
					Поставьте телефон так, чтобы он стоял ровно и градус наклона был равен 0</Text>

				{/* Button */}
				<Button
					variant="primary"
					onPress={onNext}
					disabled={isAvailable !== false && !isCalibrated}
					className="w-full"
				>
					Далее
				</Button>
			</View>

		</View>
	);
}
