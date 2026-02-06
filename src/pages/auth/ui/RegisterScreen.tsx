import React, { useState, useEffect } from 'react'
import {
	View,
	Alert,
	Image as RNImage,
	Animated,
	Keyboard,
	Text,
	InteractionManager,
	TouchableWithoutFeedback,
	useWindowDimensions,
} from 'react-native'
import * as ScreenOrientation from 'expo-screen-orientation'
import { Button, BackButton, MaskedText, Input, BackgroundLayout } from '@/shared/ui'
import { useOrientation, useKeyboardAnimation } from '@/shared/lib'
import { useRouter } from 'expo-router'
import { authApi } from '@/features/auth'
// Импорт изображения браслета
import braceletImage from '../../../../assets/images/ultra-realistic-silicone.png'
import { Loader } from '@/shared/ui/Loader/Loader'
import {
	BackgroundLayoutSafeArea
} from '@/shared/ui/BackgroundLayout/BackgroundLayoutSafeArea'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
	AuthBackgroundLayout
} from '@/shared/ui/BackgroundLayout/AuthBackgroundLayout'

// Константы для MaskedText
const TEXT_CONFIG = {
	width: 400,
	height: 50,
	y: 25,
	fontSize: 36,
	fill: '#FFFFFF',
	letterSpacing: '-0.03',
	textAlign: 'middle' as const,
	fontFamily: 'Rimma_sans',
}

const MASK_RECT = {
	x: 160, // 40% от 400px
	y: 0,
	width: 240, // 60% от 400px
	height: 160,
}

/**
 * Страница регистрации
 */
export const RegisterScreen = () => {
	const router = useRouter()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [passwordError, setPasswordError] = useState('')
	const [confirmPasswordError, setConfirmPasswordError] = useState('')
	const [emailError, setEmailError] = useState('')
	const [showPasswordHelper, setShowPasswordHelper] = useState(false)
	const [passwordHelperText, setPasswordHelperText] = useState('')
	const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false)
	const [isLoading, setIsLoading] = useState(false)

	const { height: SCREEN_HEIGHT } = useWindowDimensions()
	const insets = useSafeAreaInsets()

	// Очистка формы при размонтировании компонента
	useEffect(() => {
		return () => {
			setEmail('')
			setPassword('')
			setConfirmPassword('')
			setPasswordError('')
			setConfirmPasswordError('')
			setEmailError('')
			setShowPasswordHelper(false)
			setPasswordHelperText('')
			setConfirmPasswordTouched(false)
			setIsLoading(false)
		}
	}, [])

	// Используем хук для анимации клавиатуры
	const { translateY, opacity: braceletOpacity } = useKeyboardAnimation({
		animateOpacity: true,
		offsetMultiplier: 0.3,
	})

	// Блокируем поворот экрана в портретную ориентацию
	useOrientation(ScreenOrientation.OrientationLock.PORTRAIT_UP)

	// Проверка надежности пароля
	const isPasswordStrong = (pwd: string) => {
		return pwd.length >= 8 && /\d/.test(pwd) && /[A-Z]/.test(pwd) && /[a-z]/.test(pwd)
	}

	// Валидация пароля при потере фокуса
	const validatePasswordOnBlur = () => {
		if (!password) {
			setPasswordError('')
			setShowPasswordHelper(false)
			setPasswordHelperText('')
			return
		}

		if (!isPasswordStrong(password)) {
			setPasswordError('Минимум 8 символов, цифра, заглавная и строчная буквы')
			setShowPasswordHelper(false)
			setPasswordHelperText('')
		} else {
			setPasswordError('')
			setShowPasswordHelper(false)
			setPasswordHelperText('')
			// Если пароль валиден, проверяем совпадение с подтверждением
			if (confirmPasswordTouched && confirmPassword) {
				validatePasswordMatch()
			}
		}
	}

	// Валидация подтверждения пароля при потере фокуса
	const validateConfirmPasswordOnBlur = () => {
		if (!confirmPassword) {
			setConfirmPasswordError('')
			return
		}

		// Проверяем совпадение только если оба поля заполнены
		if (password && confirmPassword) {
			validatePasswordMatch()
		}
	}

	// Проверка совпадения паролей
	const validatePasswordMatch = () => {
		// Проверяем только если оба поля заполнены
		if (password && confirmPassword) {
			if (password !== confirmPassword) {
				setConfirmPasswordError('Пароли не совпадают')
			} else {
				setConfirmPasswordError('')
			}
		} else {
			// Если одно из полей пустое, убираем ошибку
			setConfirmPasswordError('')
		}
	}

	// Обработчик фокуса на поле пароля
	const handlePasswordFocus = () => {
		// Показываем подсказку если есть ошибка валидации пароля
		if (passwordError === 'Минимум 8 символов, цифра, заглавная и строчная буквы') {
			setShowPasswordHelper(true)
			setPasswordHelperText('Минимум 8 символов, цифра, заглавная и строчная буквы')
			// Временно скрываем ошибку при показе подсказки
			setPasswordError('')
		}
	}

	// Обработчик фокуса на поле подтверждения пароля
	const handleConfirmPasswordFocus = () => {
		setConfirmPasswordTouched(true)
	}

	// Обработчик потери фокуса на поле подтверждения пароля
	const handleConfirmPasswordBlur = () => {
		validateConfirmPasswordOnBlur()
	}

	// Обработчик фокуса на поле email
	const handleEmailFocus = () => {
		// Empty by design
	}

	// Обработчик потери фокуса на поле email
	const handleEmailBlur = () => {
		validateEmail()
	}

	// Обработчик потери фокуса на поле пароля
	const handlePasswordBlur = () => {
		validatePasswordOnBlur()
	}

	// Обработчик изменения текста в поле пароля
	const handlePasswordChange = (text: string) => {
		setPassword(text)
		// Если поле подтверждения было затронуто и заполнено, проверяем совпадение
		if (confirmPasswordTouched && confirmPassword) {
			if (text && confirmPassword) {
				if (text !== confirmPassword) {
					setConfirmPasswordError('Пароли не совпадают')
				} else {
					setConfirmPasswordError('')
				}
			} else {
				setConfirmPasswordError('')
			}
		}
	}

	// Обработчик изменения текста в поле подтверждения пароля
	const handleConfirmPasswordChange = (text: string) => {
		setConfirmPassword(text)
		// Если поле было затронуто, проверяем совпадение с основным паролем
		if (confirmPasswordTouched) {
			if (text && password) {
				if (text !== password) {
					setConfirmPasswordError('Пароли не совпадают')
				} else {
					setConfirmPasswordError('')
				}
			} else {
				setConfirmPasswordError('')
			}
		}
	}

	// Валидация email
	const validateEmail = () => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		if (email && !emailRegex.test(email)) {
			setEmailError('Введите корректный email')
		} else {
			setEmailError('')
		}
	}

	const handleSubmit = async () => {
		// Dismiss keyboard to prevent system password save dialog from interfering

		Keyboard.dismiss()

		// Валидация перед отправкой
		if (!email || !password || !confirmPassword) {
			return
		}

		if (passwordError || emailError || confirmPasswordError) {
			return
		}

		setIsLoading(true)

		try {
			const result = await authApi.sendCode(email.toLowerCase())

			if (result.success) {
				// Переход на страницу проверки кода с email и паролем

				// Используем InteractionManager чтобы убедиться, что навигация происходит после всех взаимодействий
				InteractionManager.runAfterInteractions(() => {
					router.push({
						pathname: '/verification',
						params: { email, password },
					})
				})
			} else {
				// Показываем конкретную ошибку пользователю
				const errorMessage = result.error || 'Не удалось отправить код'
				console.error('Send code error:', errorMessage)
				Alert.alert('Ошибка', errorMessage)
				setIsLoading(false)
			}
		} catch (error) {
			// Показываем ошибку сети
			const errorMessage =
				error instanceof Error ? error.message : 'Не удалось отправить код'
			console.error('Send code exception:', error)
			Alert.alert('Ошибка', errorMessage)
			setIsLoading(false)
		}
	}

	if (isLoading) {
		return <Loader />
	}

	return (
		<AuthBackgroundLayout  hasSidePadding={false}>
			<View style={{ height: SCREEN_HEIGHT - insets.top - insets.bottom}}>
				<View className="flex-1">

						<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
							<View className="flex-1 justify-between px-4">
						{/* Кнопка возврата назад */}
						<BackButton style={{ top: 14, left: 30 }} onPress={() => router.push('/')} />

						{/* Основной контент */}
						<View className="relative z-[3] flex-1 bg-transparent">
							{/* Группа с браслетом и заголовком */}
							<Animated.View
								className="relative w-full items-center"
								style={{
									position: 'absolute',
									top: '-35%',
									left: '50%',
									height: '120%',
									width: '110%',
									transform: [{ translateX: '-50%' }],
									alignItems: 'center',
									justifyContent: 'flex-start',
									zIndex: 1,
									opacity: braceletOpacity,

								}}
							>
								{/* Текст позади изображения */}
								<View
									style={{

										position: 'absolute',
										top: '45%',
										left: '3%',
										right: 0,
										height: TEXT_CONFIG.height,
										alignItems: 'center',
										justifyContent: 'center',
									}}
								>
									<MaskedText text="регистрация" {...TEXT_CONFIG} />
								</View>

								{/* Изображение браслета */}
								<RNImage
									source={braceletImage}
									style={{
										position: 'absolute',
										top: '2%',
									//	left: '4%',
										width: '100%',
										height: '100%',
									}}
									resizeMode="contain"
								/>

								{/* Текст перед изображением (маска) */}
								<View
									style={{
										position: 'absolute',
										top: '45%',
										left: '7%',
										right: 0,
										height: TEXT_CONFIG.height,
										alignItems: 'center',
										justifyContent: 'center',
									}}
								>
									<MaskedText text="     трация" {...TEXT_CONFIG} maskRect={MASK_RECT} />
								</View>


							</Animated.View>

							{/* Форма */}
							<Animated.View
								className="absolute left-[2%] top-[40%] z-10 w-[96%] gap-4"
								style={{ transform: [{ translateY }] }}
							>
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
									autoComplete="off"
									textContentType="none"
									autoCorrect={false}
									autoCapitalize="none"
									importantForAutofill="no"
								/>

								<Input
									label="Пароль"
									placeholder="Пароль"
									value={password}
									onChangeText={handlePasswordChange}
									onFocus={handlePasswordFocus}
									onBlur={handlePasswordBlur}
									variant="password"
									size="default"
									error={passwordError}
									helperText={passwordHelperText}
									forceHelperText={showPasswordHelper}
									autoComplete="off"
									textContentType="none"
									importantForAutofill="no"
									autoCorrect={false}
									autoCapitalize="none"
								/>

								<Input
									label="Подтверждение пароля"
									placeholder="Подтвердите пароль"
									value={confirmPassword}
									onChangeText={handleConfirmPasswordChange}
									onFocus={handleConfirmPasswordFocus}
									onBlur={handleConfirmPasswordBlur}
									variant="password"
									size="default"
									error={password && confirmPassword ? confirmPasswordError : ''}
									autoComplete="off"
									textContentType="none"
									importantForAutofill="no"
									autoCorrect={false}
									autoCapitalize="none"
								/>
							</Animated.View>
						</View>

						{/* Кнопки внизу экрана */}
						<View className="gap-2 pb-1 pt-8">
							{/* Кнопка регистрации */}

							<Button
								variant="primary"
								size="l"
								fullWidth
								onPress={handleSubmit}
								disabled={
									!email ||
									!password ||
									!confirmPassword ||
									!!passwordError ||
									!!emailError ||
									showPasswordHelper ||
									(password && confirmPassword && !!confirmPasswordError) ||
									isLoading
								}
								className="h-14"
							>
								{isLoading ? 'Отправка...' : 'Зарегистрироваться'}
							</Button>

							{/* Текст с соглашениями */}
							<Text className="px-4 text-center text-xs leading-4 text-light-text-500">
								Продолжая регистрацию, вы соглашаетесь с Пользовательским соглашением,
								Политикой конфиденциальности, Политикой возвратов и даёте Согласие на
								обработку персональных данных
							</Text>
						</View>
					</View>
				</TouchableWithoutFeedback>

				</View>
		</View>
		</AuthBackgroundLayout>
	)
}
