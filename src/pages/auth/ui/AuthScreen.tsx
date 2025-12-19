import React, { useState } from 'react'
import {
	View,
	Alert,
	Image as RNImage,
	Animated,
	Pressable,
	Text,
	Keyboard,
	TouchableWithoutFeedback,
	StatusBar,
	useWindowDimensions,
} from 'react-native'
import * as ScreenOrientation from 'expo-screen-orientation'
import * as SecureStore from 'expo-secure-store'
import { Button, BackButton, MaskedText, BackgroundLayout, Input, BackgroundLayoutNoSidePadding } from '@/shared/ui'
import { useOrientation, useKeyboardAnimation } from '@/shared/lib'
import { useRouter } from 'expo-router'
import { authApi } from '@/features/auth'
// Импорт изображения браслета
import braceletImage from '../../../../assets/images/ultra-realistic-silicone.png'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Loader } from '@/shared/ui/Loader/Loader'
import VkIcon from '@/assets/social_icons/VK.svg'
import TelegramIcon from '@/assets/social_icons/Telegram.svg'
import YandexIcon from '@/assets/social_icons/Yandex.svg'
import GoogleIcon from '@/assets/social_icons/Google.svg'
import {
	BackgroundLayoutSafeArea
} from '@/shared/ui/BackgroundLayout/BackgroundLayoutSafeArea'

// Константы для MaskedText
const TEXT_CONFIG = {
	// Опираемся на tailwind h1 (48px) из tailwind.config.cjs
	width: 360,
	height: 60,
	y: 48,
	fontSize: 30,
	fill: '#FFFFFF',
	letterSpacing: '-0.03',
	textAlign: 'middle' as const,
	fontFamily: 'Rimma_sans',
}

const MASK_RECT = {
	// ~40% от ширины, чтобы "подсветка" совпадала с макетом
	x: 144, // 40% от 360px
	y: 0,
	width: 216, // 60% от 360px
	height: 200,
}

/**
 * Страница входа
 */
export const AuthScreen = () => {
	const router = useRouter()
	const { height: SCREEN_HEIGHT } = useWindowDimensions()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [emailError, setEmailError] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const insets = useSafeAreaInsets()


	// Блокируем поворот экрана в портретную ориентацию
	useOrientation(ScreenOrientation.OrientationLock.PORTRAIT_UP)

	// Валидация email
	const validateEmail = () => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		if (email && !emailRegex.test(email)) {
			setEmailError('Введите корректный email')
		} else {
			setEmailError('')
		}
	}

	// Обработчик фокуса на поле email
	const handleEmailFocus = () => {
		// Empty by design
	}

	// Обработчик потери фокуса на поле email
	const handleEmailBlur = () => {
		validateEmail()
	}

	const handleSubmit = async () => {
		// Dismiss keyboard
		//Keyboard.dismiss()

		setIsLoading(true)

		try {
			const result = await authApi.login({ email: email.toLowerCase(), password })

			if (result.success) {
				// Save tokens to secure storage (user_id already saved in authApi)
				await SecureStore.setItemAsync('auth_token', result.data.access_token)
				await SecureStore.setItemAsync('refresh_token', result.data.refresh_token)

				// Navigate to home
				router.push('/home')
			} else {
				Alert.alert('Ошибка', result.error || 'Не удалось войти')
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Не удалось войти'
			Alert.alert('Ошибка', errorMessage)
		} finally {
			setIsLoading(false)
		}
	}

	if (isLoading) {
		return <Loader />
	}

	return (
		<BackgroundLayoutSafeArea needBg={false}>
			<View style={{ height: SCREEN_HEIGHT - insets.top - insets.bottom }}>
				<View className="flex-1">
					<BackgroundLayout>
						<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
							<View className="flex-1 justify-between px-4">
								{/* Кнопка возврата назад */}
								{/* Мы уже добавили спейсер на высоту safe-area сверху, поэтому не дублируем insets внутри BackButton */}
								<BackButton onPress={() => router.push('/')} style={{ top: 14, left: 10 }} />

								{/* Основной контент */}
								<View className="relative z-[3] flex-1">
									{/* Группа с браслетом и заголовком (центрируем, не тянем картинку слишком сильно) */}

									<Animated.View
										className="relative w-full items-center"
										style={{ height: 260 }}
									>
										{/* Текст позади изображения */}
										<View
											style={{
												position: 'absolute',
												top: 120,
												left: '50%',
												width: TEXT_CONFIG.width,
												height: TEXT_CONFIG.height,
												transform: [{ translateX: -TEXT_CONFIG.width / 2 }],
											}}
										>
											<MaskedText text="ВХОД В АККАУНТ" {...TEXT_CONFIG} />
										</View>

										{/* Изображение браслета */}
										<RNImage
											source={braceletImage}
											style={{
												width: 420,
												height: 320,
												marginTop: 45,
											}}
											resizeMode="contain"
										/>

										{/* Текст перед изображением (маска) */}
										<View
											style={{
												position: 'absolute',
												top: 120,
												left: '50%',
												width: TEXT_CONFIG.width,
												height: TEXT_CONFIG.height,
												transform: [{ translateX: -TEXT_CONFIG.width / 2 }],
											}}
										>
											<MaskedText text="ВХОД В АККАУНТ" {...TEXT_CONFIG} maskRect={MASK_RECT} />
										</View>
									</Animated.View>

									{/* Форма */}

									<Input
										label="Электронная почта"
										placeholder="example@provider.com"
										value={email}
										onChangeText={setEmail}
										onFocus={handleEmailFocus}
										onBlur={handleEmailBlur}
										keyboardType="email-address"
										variant="text"
										size="default"
										error={emailError}
									/>

									<Input
										label="Пароль"
										placeholder="Пароль"
										value={password}
										onChangeText={setPassword}
										variant="password"
										size="default"
									/>

									{/* Отступ как в макете: 8px */}
									<View className="flex-row justify-end">
										<Pressable onPress={() => router.push('/forgot-password')} className="mt-2">
											<Text className="text-t3-regular text-light-text-200">Забыли пароль?</Text>
										</Pressable>
									</View>
								</View>

								{/* Кнопки внизу экрана */}
								<View className="gap-4">
									{/* Кнопка входа */}

									<Button
										variant="primary"
										fullWidth
										onPress={handleSubmit}
										disabled={!email || !password || !!emailError || isLoading}
									>
										{isLoading ? 'Вход...' : 'Войти'}
									</Button>
								</View>
							</View>
						</TouchableWithoutFeedback>
					</BackgroundLayout>
				</View>

				{/* Социальный вход */}
				<View className="flex-row justify-between pb-4 pt-5">
					<Pressable
						onPress={() => Alert.alert('Скоро', 'Авторизация через VK будет добавлена позже')}
						className="items-center justify-center rounded-full bg-white p-6"
						accessibilityRole="button"
						accessibilityLabel="Continue with VK"
					>
						<VkIcon width={44} height={44} />
					</Pressable>

					<Pressable
						onPress={() => Alert.alert('Скоро', 'Авторизация через Telegram будет добавлена позже')}
						className="items-center justify-center rounded-full bg-white p-6"
						accessibilityRole="button"
						accessibilityLabel="Continue with Telegram"
					>
						<TelegramIcon width={44} height={44} />
					</Pressable>

					<Pressable
						onPress={() => Alert.alert('Скоро', 'Авторизация через Яндекс будет добавлена позже')}
						className="items-center justify-center rounded-full bg-white p-6"
						accessibilityRole="button"
						accessibilityLabel="Continue with Yandex"
					>
						<YandexIcon width={44} height={44} />
					</Pressable>

					<Pressable
						onPress={() => Alert.alert('Скоро', 'Авторизация через Google будет добавлена позже')}
						className="items-center justify-center rounded-full bg-white p-6"
						accessibilityRole="button"
						accessibilityLabel="Continue with Google"
					>
						<GoogleIcon width={44} height={44} />
					</Pressable>
				</View>
			</View>
		</BackgroundLayoutSafeArea>
	)
}
