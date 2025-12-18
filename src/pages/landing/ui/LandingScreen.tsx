import React from 'react'
import { View, Text, Image as RNImage, useWindowDimensions, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import * as ScreenOrientation from 'expo-screen-orientation'
import { Button, CircularText, SafeAreaContainer } from '@/shared/ui'
import { useOrientation } from '@/shared/lib'
import landingPhoto1 from '../../../../assets/images/landing-photo-1.png'
import landingPhoto2 from '../../../../assets/images/dumbbell_purple_background.png'
import LandingIcon from '../../../../assets/images/landing_icon.svg'

/**
 * Landing page - посадочная страница с декоративными элементами
 * Содержит заголовок "Время действовать" и две кнопки навигации
 */
export const LandingScreen = () => {
	const router = useRouter()
	const { width: screenWidth, height: screenHeight } = useWindowDimensions()

	// Блокируем поворот экрана в портретную ориентацию
	useOrientation(ScreenOrientation.OrientationLock.PORTRAIT_UP)

	// Адаптивные размеры круга (сохраняем пропорции от оригинального макета)
	const circleSize = Math.min(screenWidth * 0.18, screenHeight * 0.085) // ~72px на стандартном экране
	const circleOffset = circleSize * 0.4 // ~16px на стандартном экране

	const handleRegister = () => {
		router.push('/register')
	}

	const handleLogin = () => {
		router.push('/auth')
	}

	return (
		<View className="flex-1 bg-bg-dark-900">
			<View className="flex-1 bg-bg-dark-500">
				<SafeAreaContainer>
					{/* Верхний контейнер Frame 48097890 */}
					<View className="relative h-[60%] w-[99%] overflow-hidden rounded-[40px] bg-bg-dark-900">
						<View
							className="absolute items-center justify-center bg-bg-dark-400"
							style={{
								width: circleSize,
								height: circleSize,
								borderRadius: circleSize / 2,
								top: circleOffset,
								left: circleOffset,
							}}
						>
							<LandingIcon />
						</View>

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

							{/*/!* Основная фотокарточка IMG_3254 2 *!/*/}
							<RNImage
								source={landingPhoto1}
								className="h-full w-full"
								resizeMode="cover"
							/>

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
						<View className="absolute left-[7%] top-[80%] h-[15%] w-[87%]">
							<Text
								className="text-[34px] leading-[35px] text-white"
								style={{
									fontFamily: Platform.select({
										android: 'Rimma_sans_android',
										ios: 'Rimma_sans',
									}),
								}}
							>
								Время
							</Text>
							<Text
								className="text-[34px] leading-[35px] text-white"
								style={{
									fontFamily: Platform.select({
										android: 'Rimma_sans_android',
										ios: 'Rimma_sans',
									}),
								}}
							>
								действовать
							</Text>
						</View>
					</View>

					{/* Нижний контейнер Frame 48097894 */}
					<View className="relative mx-[3.6%] mb-[3.6%] h-[38.6%] w-[92.8%] rounded-[40px] bg-[#4B4B4B]">
						{/* Фотокарточка Group 310 */}
						<View className="absolute left-0 top-0 h-full w-full overflow-hidden rounded-[40px]">
							<RNImage
								source={landingPhoto2}
								className="h-full w-full"
								resizeMode="cover"
							/>
						</View>

						{/* Кнопки Frame 48097895 */}
						<View className="absolute bottom-[8%] w-full px-2">
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
									Зарегистрироваться
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
									Войти
								</Button>
							</View>
						</View>
					</View>
				</SafeAreaContainer>
			</View>
		</View>
	)
}
