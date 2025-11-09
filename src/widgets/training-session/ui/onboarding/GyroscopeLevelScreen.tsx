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
				// Блокируем переход экрана в спящий режим
				await activateKeepAwakeAsync();
				keepAwakeActivated = true;

				const available = await Accelerometer.isAvailableAsync();
				setIsAvailable(available);
				if (!available || !isFocused) return;

				Accelerometer.setUpdateInterval(100);

				subscription = Accelerometer.addListener((data) => {
					const { x, y, z } = data;

					// Рассчитываем угол наклона вперёд-назад (pitch)
					const angleRad = Math.atan2(x, Math.hypot(y, z));
					const angleDeg = Math.round((angleRad * 180) / Math.PI);

					setAngle(angleDeg);

					// Анимация поворота полоски
					Animated.timing(barRotation, {
						toValue: angleDeg,
						duration: 100,
						useNativeDriver: true,
					}).start();

					// Проверка на "ровность"
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
		<View className="bg-background-primary flex-1">
			{/* Close Button */}
			<View className="absolute right-4 top-12 z-10">
				<CloseBtn handlePress={handleStop} classNames="h-12 w-12 rounded-2xl" />
			</View>

			{/* Progress Dots */}
			<View className="absolute left-1/2 top-12 z-10 -translate-x-1/2">
				<DotsProgress total={4} current={3} />
			</View>

			{/* Content */}
			<View className="flex-1 items-center justify-center px-6">
				{/* Gyroscope Visualizer */}
				<View className="mb-12 h-64 w-full items-center justify-center">
					<Animated.View
						style={[
							{
								transform: [
									{
										rotate: barRotation?.interpolate({
											inputRange: [-90, 90],
											outputRange: ['-90deg', '90deg'],
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
					<Text className="text-body-regular text-text-secondary mb-12 text-center">
						Датчик акселерометра недоступен в веб. Нажмите «Далее», чтобы продолжить.
					</Text>
				) : (
					<Text className="text-h1-medium text-text-primary mb-12 text-center">
						{angle}°
					</Text>
				)}

				{/* Заголовок */}
				<Text className="text-h2-medium text-text-primary mb-4 text-center">
					Проверьте уровень
				</Text>

				{/* Подсказка */}
				<Text className="text-body-regular text-text-secondary mb-12 text-center">
					Поставьте телефон так, чтобы он стоял ровно или наклон был равен 0
				</Text>
			</View>

			{/* Кнопка */}
			<View className="p-6">
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
