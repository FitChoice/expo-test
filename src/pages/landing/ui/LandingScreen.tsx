import React from 'react'
import {
	View,
	Text,
	Image as RNImage,
	TouchableOpacity,
	useWindowDimensions,
	Platform,
} from 'react-native'
import { useRouter } from 'expo-router'
import * as ScreenOrientation from 'expo-screen-orientation'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Button, CircularText } from '@/shared/ui'
import { useOrientation } from '@/shared/lib'
import landingPhoto1 from '../../../../assets/images/landing-photo-1.png'
import landingPhoto2 from '../../../../assets/images/landing-photo-2.png'

/**
 * Landing page - посадочная страница с декоративными элементами
 * Содержит заголовок "Время действовать" и две кнопки навигации
 */
export const LandingScreen = () => {
	const router = useRouter()
	const insets = useSafeAreaInsets()
	const { width: screenWidth, height: screenHeight } = useWindowDimensions()

	// Блокируем поворот экрана в портретную ориентацию
	useOrientation(ScreenOrientation.OrientationLock.PORTRAIT_UP)

	// Адаптивные размеры круга (сохраняем пропорции от оригинального макета)
	const circleSize = Math.min(screenWidth * 0.18, screenHeight * 0.085) // ~72px на стандартном экране
	const circleOffset = circleSize * 0.22 // ~16px на стандартном экране

	const handleRegister = () => {
		router.push('/register')
	}

	const handleLogin = () => {
		router.push('/auth')
	}

	// ВРЕМЕННАЯ КНОПКА ДЛЯ ТЕСТИРОВАНИЯ
	// TODO: Удалить в проде - это только для быстрого доступа к опросу при разработке
	const handleTestSurvey = () => {
		router.push('/survey')
	}

	// ВРЕМЕННАЯ КНОПКА ДЛЯ ТЕСТИРОВАНИЯ ТРЕНИРОВОК
	// TODO: Удалить в проде - это только для быстрого доступа к тренировкам при разработке
	const handleTestTraining = () => {
		// Переходим к экрану тренировки с тестовым ID
		router.push({
			pathname: '/(training)',
			params: { trainingId: '1' },
		})
	}

	return (
		<View className="flex-1 bg-[#151515]">
			{/* Верхний контейнер Frame 48097890 */}
			<View className="relative mx-[3.6%] mt-[3.6%] h-[58.1%] w-[92.8%] overflow-hidden rounded-[40px] bg-bg-dark-500">
				{/* Фиолетовый круг Frame 313 */}
				<View
					className="absolute bg-brand-purple-500"
					style={{
						width: circleSize,
						height: circleSize,
						borderRadius: circleSize / 2,
						top: circleOffset,
						left: circleOffset,
					}}
				/>

				{/* Group 314 с фотокарточкой и декоративными элементами */}
				<View className="absolute left-[60%] top-0 h-[90%] w-[40%]">
					{/* Декоративные элементы Mask group - круговой текст (позади изображения) */}
					<View className="absolute left-[-42%] top-[22%] h-[45%] w-[90%]">
						{/* Слой 1: Текст позади изображения (полностью видимый) */}
						<CircularText
							text="fit choice fit choice fit choice fit choice fit choice fit choice fit choice fit choice fit choice fit choice"
							width={screenWidth * 0.69}
							height={screenHeight * 0.16}
							centerX={screenWidth * 0.39}
							centerY={screenHeight * 0.13}
							fontSize={screenWidth * 0.039}
							fill="#FFFFFF"
							startOffset="0%"
							fontWeight="300"
							letterSpacing="-3%"
							rotation={-17.05}
							debug={false}
						/>
					</View>

					{/* Основная фотокарточка IMG_3254 2 */}
					<RNImage source={landingPhoto1} className="h-full w-full" resizeMode="cover" />

					{/* Слой 2: Текст перед изображением (только в области маски) */}
					<View className="absolute left-[-42%] top-[22%] h-[45%] w-[90%]">
						<CircularText
							text="fit choice fit choice fit choice fit choice fit choice fit choice fit choice fit choice fit choice fit choice"
							width={screenWidth * 0.69}
							height={screenHeight * 0.16}
							centerX={screenWidth * 0.39}
							centerY={screenHeight * 0.13}
							fontSize={screenWidth * 0.039}
							fill="#FFFFFF"
							startOffset="0%"
							fontWeight="300"
							letterSpacing="-3%"
							rotation={-17.05}
							debug={false}
							maskRect={{
								x: screenWidth * 0.13,
								y: screenHeight * 0.14,
								width: screenWidth * 0.51,
								height: screenHeight * 0.12,
							}}
						/>
					</View>
				</View>

				{/* Заголовок "Время действовать" */}
				<View className="absolute left-[7%] top-[85%] h-[15%] w-[87%]">
					<Text
						className="text-[34px] leading-[35px] text-white"
						style={{
							fontFamily: Platform.select({
								android: 'Rimma_sans_android',
								ios: 'Rimma_sans',
							}),
						}}
					>
						Время{'\n'}действовать
					</Text>
				</View>
			</View>

			{/* Нижний контейнер Frame 48097894 */}
			<View className="relative mx-[3.6%] mb-[3.6%] h-[38.6%] w-[92.8%] rounded-[40px] bg-[#4B4B4B]">
				{/* Фотокарточка Group 310 */}
				<View className="absolute left-0 top-0 h-full w-full overflow-hidden rounded-[40px]">
					{/* Основное изображение */}
					<RNImage source={landingPhoto2} className="h-full w-full" resizeMode="cover" />
				</View>

				{/* Кнопки Frame 48097895 */}
				<View className="absolute left-[4%] top-[58%] w-[92%]">
					<View className="gap-2">
						<Button
							variant="primary"
							size="l"
							fullWidth
							onPress={handleRegister}
							accessibilityRole="button"
							accessibilityLabel="Зарегистрироваться"
							accessibilityHint="Создать новый аккаунт в приложении"
						>
							Регистрация
						</Button>
						<Button
							variant="secondary"
							size="l"
							fullWidth
							onPress={handleLogin}
							accessibilityRole="button"
							accessibilityLabel="Войти в аккаунт"
							accessibilityHint="Войти в существующий аккаунт"
						>
							Вход
						</Button>
					</View>
				</View>
			</View>

			{/* ВРЕМЕННЫЕ КНОПКИ ДЛЯ ТЕСТИРОВАНИЯ - УДАЛИТЬ В ПРОДЕ */}
			<View
				className="absolute left-[14px] z-[1000] flex-col gap-2"
				style={{ top: insets.top + 14 }}
			>
				{/* Survey Test Button */}
				<TouchableOpacity
					onPress={handleTestSurvey}
					className="h-10 w-10 items-center justify-center rounded-lg bg-[#A172FF] opacity-70"
					activeOpacity={0.6}
					accessibilityRole="button"
					accessibilityLabel="Тестовый опрос"
				>
					<Text className="text-xl text-white">?</Text>
				</TouchableOpacity>

				{/* Training Test Button */}
				<TouchableOpacity
					onPress={handleTestTraining}
					className="h-10 w-10 items-center justify-center rounded-lg bg-[#C5F680] opacity-70"
					activeOpacity={0.6}
					accessibilityRole="button"
					accessibilityLabel="Тестовая тренировка"
				>
					<Text className="text-xl text-black">💪</Text>
				</TouchableOpacity>
			</View>
		</View>
	)
}
