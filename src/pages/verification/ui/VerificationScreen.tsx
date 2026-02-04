import React, { useState, useEffect } from 'react'
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	Keyboard,
	Alert,
	TouchableWithoutFeedback,
	useWindowDimensions,
} from 'react-native'
import * as ScreenOrientation from 'expo-screen-orientation'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Button, BackgroundLayout, Input } from '@/shared/ui'
import { useOrientation } from '@/shared/lib'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { authApi } from '@/features/auth'
import { sharedStyles } from '@/shared/ui/styles/shared-styles'

/**
 * Страница проверки кода подтверждения
 */
export const VerificationScreen = () => {
	const router = useRouter()
	const insets = useSafeAreaInsets()
	const { height: SCREEN_HEIGHT } = useWindowDimensions()
	const { email, password } = useLocalSearchParams<{ email: string; password: string }>()
	const [code, setCode] = useState('')
	const [timer, setTimer] = useState(59) // Таймер для повторной отправки
	const [isTimerActive, setIsTimerActive] = useState(true) // Активен ли таймер
	const [isResending, setIsResending] = useState(false) // Загрузка при повторной отправке

	// Блокируем поворот экрана в портретную ориентацию
	useOrientation(ScreenOrientation.OrientationLock.PORTRAIT_UP)

	// Автоматически скрываем клавиатуру при вводе 6 символов
	useEffect(() => {
		if (code.length === 6) {
			Keyboard.dismiss()
		}
	}, [code])

	// Таймер обратного отсчета
	useEffect(() => {
		let interval: NodeJS.Timeout | null = null

		if (isTimerActive && timer > 0) {
			interval = setInterval(() => {
				setTimer((prevTimer) => {
					if (prevTimer <= 1) {
						setIsTimerActive(false)
						return 0
					}
					return prevTimer - 1
				})
			}, 1000)
		}

		return () => {
			if (interval) {
				clearInterval(interval)
			}
		}
	}, [isTimerActive, timer])

	const handleSubmit = async () => {
		if (code.length !== 6 || !email || !password) return

		try {
			const result = await authApi.registration({
				code: Number(code),
				email,
				password,
			})

			if (result.success) {
				// Успешная регистрация, переходим на survey
				router.push('/survey')
			} else {
				// Показываем ошибку
				Alert.alert('Ошибка', result.error || 'Неверный код')
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : 'Не удалось подтвердить код'
			Alert.alert('Ошибка', errorMessage)
		}
	}

	const handleBack = () => {
		router.back()
	}

	const handleResend = async () => {
		if (!isTimerActive && email) {
			setIsResending(true)

			try {
				const result = await authApi.sendCode(email)

				if (result.success) {
					// Перезапускаем таймер
					setTimer(59)
					setIsTimerActive(true)
				} else {
					// Показываем конкретную ошибку пользователю
					Alert.alert('Ошибка', result.error || 'Не удалось отправить код')
				}
			} catch (error) {
				// Показываем ошибку сети
				const errorMessage =
					error instanceof Error ? error.message : 'Не удалось отправить код'
				Alert.alert('Ошибка', errorMessage)
			} finally {
				setIsResending(false)
			}
		}
	}

	return (
		<View style={styles.pageContainer} >
			<BackgroundLayout>
				<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
					<View style={{ height: SCREEN_HEIGHT, paddingTop: insets.top + 14, paddingBottom: insets.bottom, }} >
						<View style={[styles.mainContainer, { flex: 1,paddingTop: 0 }]}>
							{/* Основной контент */}
							<View style={styles.contentContainer}>
								{/* Заголовок и описание */}
								<View style={styles.headerSection}>
									<Text style={sharedStyles.titleCenter}>ВВЕДИТЕ КОД ПОДТВЕРЖДЕНИЯ</Text>
									<Text style={styles.description}>
										На вашу почту {email || 'example@gmail.com'}
										{'\n'}отправлен код подтверждения
									</Text>
								</View>

								{/* Поле ввода кода */}
								<View style={styles.inputSection}>
									<Input
										label="Код"
										placeholder="123456"
										value={code}
										onChangeText={setCode}
										importantForAutofill="no"
										keyboardType="numeric"
										autoCorrect={false}
										autoComplete="off"
										variant="text"
										size="default"
										maxLength={6}
									/>
								</View>
							</View>

							{/* Кнопки и повторная отправка внизу экрана */}
							<View style={styles.bottomButtons}>
								{/* Вопрос о письме (только когда таймер неактивен) */}
								{!isTimerActive && (
									<Text style={styles.questionText}>Не получили письмо?</Text>
								)}

								{/* Кнопка повторной отправки */}
								<TouchableOpacity
									style={[
										styles.resendButton,
										(isTimerActive || isResending) && styles.resendButtonDisabled,
									]}
									onPress={handleResend}
									activeOpacity={isTimerActive || isResending ? 1 : 0.8}
									disabled={isTimerActive || isResending}
								>
									<Text
										style={[
											styles.resendText,
											(isTimerActive || isResending) && styles.resendTextDisabled,
										]}
									>
										{isResending
											? 'Отправка...'
											: isTimerActive
												? `Прислать повторно через 00:${timer.toString().padStart(2, '0')}`
												: 'Прислать код повторно'}
									</Text>
								</TouchableOpacity>

								{/* Кнопка отправки */}
								<Button
									variant="primary"
									size="l"
									fullWidth
									onPress={handleSubmit}
									disabled={code.length !== 6}
									style={styles.submitButton}
								>
									Отправить
								</Button>

								{/* Кнопка возврата */}
								<Button variant="tertiary" size="s" fullWidth onPress={handleBack}>
									Назад
								</Button>
							</View>
						</View>
					</View>
				</TouchableWithoutFeedback>
			</BackgroundLayout>
		</View>
	)
}

const styles = StyleSheet.create({
	pageContainer: {
		flex: 1,
		backgroundColor: '#151515',
	},
	mainContainer: {
		flex: 1,
		backgroundColor: 'transparent',
		paddingHorizontal: 16,
		justifyContent: 'space-between',
	},
	contentContainer: {
		backgroundColor: 'transparent',
	},
	headerSection: {
		alignItems: 'center',
		gap: 24,
		marginBottom: 40,
	},
	title: {
		fontFamily: 'Rimma_sans',
		fontWeight: '700',
		fontSize: 24,
		lineHeight: 31.2,
		color: '#FFFFFF',
		textAlign: 'center',
	},
	description: {
		fontFamily: 'Inter',
		fontWeight: '400',
		fontSize: 16,
		lineHeight: 19.2,
		color: '#FFFFFF',
		textAlign: 'center',
	},
	inputSection: {

	},
	bottomButtons: {

		gap: 8,
	},
	questionText: {
		fontFamily: 'Inter',
		fontWeight: '600',
		fontSize: 16,
		lineHeight: 19.2,
		color: '#FFFFFF',
		textAlign: 'center',
	},
	resendButton: {
		alignSelf: 'center',
		paddingVertical: 9,
		paddingHorizontal: 24,
	},
	resendButtonDisabled: {
		opacity: 0.75,
	},
	resendText: {
		fontFamily: 'Inter',
		fontWeight: '600',
		fontSize: 16,
		lineHeight: 19.2,
		color: '#FFFFFF',
		textAlign: 'center',
	},
	resendTextDisabled: {
		opacity: 0.75,
	},
	submitButton: {

	},
})
