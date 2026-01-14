import React, { useState, type ReactNode } from 'react'
import {
	View,
	Text,
	Animated,
	Alert,
	TouchableWithoutFeedback,
	Keyboard,
	useWindowDimensions,
	KeyboardAvoidingView,
	Platform,
} from 'react-native'
import * as ScreenOrientation from 'expo-screen-orientation'
import {
	Button, Input, BackgroundLayout,
} from '@/shared/ui'
import { useOrientation } from '@/shared/lib'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { sharedStyles } from '@/shared/ui/styles/shared-styles'
import { authApi } from '@/features/auth'
import { Loader } from '@/shared/ui/Loader/Loader'
import { userApi } from '@/features/user'
import {
	BackgroundLayoutSafeArea
} from '@/shared/ui/BackgroundLayout/BackgroundLayoutSafeArea'



/**
 * Страница восстановления пароля
 */

type CurrentStep = 'enter_email' | 'enter_code' | 'new_password'
type StepContent = {
	body: ReactNode
	footer: ReactNode
}
export const ForgotPasswordScreen = () => {
	const router = useRouter()

	const { height: SCREEN_HEIGHT } = useWindowDimensions()

	const [isLoading, setIsLoading] = useState(false)
	const [email, setEmail] = useState('')
	const [emailCode, setEmailCode] = useState('')
	const [emailError, setEmailError] = useState('')
	const [currentStep, setCurrentStep] = useState<CurrentStep>('enter_email')
	const insets = useSafeAreaInsets()

	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [passwordError, setPasswordError] = useState('')
	const [confirmPasswordError, setConfirmPasswordError] = useState('')
	const [showPasswordHelper, setShowPasswordHelper] = useState(false)
	const [passwordHelperText, setPasswordHelperText] = useState('')
	const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false)

	useOrientation(ScreenOrientation.OrientationLock.PORTRAIT_UP)

	const validateEmail = () => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		if (email && !emailRegex.test(email)) {
			setEmailError('Введите корректный email')
		} else {
			setEmailError('')
		}
	}

	const handleEmailBlur = () => {
		validateEmail()
	}

	const handleSubmitEmail = async () => {
		setIsLoading(true)

		try {
			const result = await authApi.sendCode(email.toLowerCase(), true)

			if (result.success) {
				// Navigate to home
				setCurrentStep('enter_code')
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

	const handleSubmitEmailCode = async () => {
		setIsLoading(true)

		try {
			const result = await authApi.verifyCode(email.toLowerCase(), Number(emailCode))

			if (result.success) {
				// Navigate to home
				setCurrentStep('new_password')
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

	const handleCreateNewPassword = async () => {
		setIsLoading(true)

		try {
			const result = await userApi.updatePassword({
				email,
				new_password: password,
			})

			if (result.success) {
				// Navigate to home
				router.push('/auth')
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

	if (isLoading) {
		return <Loader />
	}

	const renderContent = (): StepContent => {
		switch (currentStep) {
			case 'enter_email':
				return {
					body: (
						<View className="flex-1 justify-start pt-20">
							<Animated.View className="gap-20">
								<View className="gap-3">
									<Text style={sharedStyles.titleCenter}>
										ВВЕДИТЕ ПОЧТУ,{'\n'}С КОТОРОЙ{'\n'}РЕГИСТРИРОВАЛИСЬ
									</Text>
									<Text className="text-center text-t2 text-light-text-200">
										И мы вышлем код подтверждения
									</Text>
								</View>

								<Input
									label="Электронная почта"
									placeholder="example@provider.com"
									value={email}
									onChangeText={setEmail}
									onBlur={handleEmailBlur}
									keyboardType="email-address"
									variant="text"
									size="default"
									error={emailError}
								/>
							</Animated.View>
						</View>
					),
					footer: (
						<View className="gap-4 pt-8" style={{ paddingBottom: insets.bottom + 10 }}>
							<Animated.View className="w-full">
								<Button
									variant="primary"
									size="l"
									fullWidth
									onPress={handleSubmitEmail}
									disabled={!email || !!emailError}
									className="h-14"
								>
									Отправить
								</Button>
							</Animated.View>

							<Button
								variant="tertiary"
								size="l"
								fullWidth
								onPress={() => router.back()}
								className="h-14"
							>
								Назад
							</Button>
						</View>
					),
				}

			case 'enter_code':
				return {
					body: (
						<View className="flex-1 justify-start pt-40">
							<Animated.View className="gap-20">
								<View className="gap-3">
											<Text style={sharedStyles.titleCenter}>ВВЕДИТЕ КОД ПОДТВЕРЖДЕНИЯ</Text>
									<Text className="text-center text-t2 text-light-text-200">
										На вашу почту отправлен код подтверждения
									</Text>
								</View>

								<Input
									label="Код"
									placeholder="1234"
									value={emailCode}
									onChangeText={setEmailCode}
									keyboardType="number-pad"
									variant="text"
									size="default"
									error={emailError}
								/>
							</Animated.View>
						</View>
					),
					footer: (
						<View className="gap-4 pt-8" style={{ paddingBottom: insets.bottom + 10 }}>
							<Button
								variant="primary"
								size="l"
								fullWidth
								onPress={handleSubmitEmailCode}
								disabled={!email || !!emailError}
								className="h-14"
							>
								Отправить
							</Button>

							<Button
								variant="tertiary"
								size="l"
								fullWidth
								onPress={() => router.back()}
								className="h-14"
							>
								Назад
							</Button>
						</View>
					),
				}

			case 'new_password':
				return {
					body: (
						<View className="flex-1 justify-start pt-40">
							<Animated.View className="gap-20">
								<View className="gap-3">
									<Text style={sharedStyles.titleCenter} className="uppercase">
										Придумайте новый пароль
									</Text>
								</View>

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
								/>
							</Animated.View>
						</View>
					),
					footer: (
						<View className="gap-2 pt-8" style={{ paddingBottom: insets.bottom + 10 }}>
							<Animated.View className="w-full">
								<Button
									variant="primary"
									size="l"
									fullWidth
									onPress={handleCreateNewPassword}
									disabled={
										!password ||
										!confirmPassword ||
										!!passwordError ||
										showPasswordHelper ||
										Boolean(password && confirmPassword && !!confirmPasswordError)
									}
									className="h-14"
								>
									Созранить
								</Button>
							</Animated.View>

							<Button
								variant="secondary"
								size="l"
								fullWidth
								onPress={() => router.back()}
								className="h-14"
							>
								Назад
							</Button>
						</View>
					),
				}
		}
	}

	const { body, footer } = renderContent()

	return (
		<BackgroundLayoutSafeArea needBg={false}>
			<BackgroundLayout styles={{ paddingHorizontal: 16 }}>
				<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
					<View className="flex-1">
						<KeyboardAvoidingView
							style={{ flex: 1 }}
							behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
							keyboardVerticalOffset={Platform.select({ ios: insets.top, android: 0 }) ?? 0}
						>
							{body}
						</KeyboardAvoidingView>

						{footer}
					</View>
				</TouchableWithoutFeedback>
			</BackgroundLayout>
		</BackgroundLayoutSafeArea>
	)
}
