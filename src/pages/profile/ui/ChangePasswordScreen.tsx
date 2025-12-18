/**
 * ChangePasswordScreen - экран смены пароля
 * Форма с валидацией для смены текущего пароля
 */

import { useState } from 'react'
import { View, ScrollView, Text } from 'react-native'
import { useRouter } from 'expo-router'
import { BackgroundLayout, BackButton, Input, Button } from '@/shared/ui'
import { NavigationBar } from '@/widgets/navigation-bar'
import { userApi } from '@/features/user/api'
import { getUserId, useNavbarLayout, showToast } from '@/shared/lib'

interface FormErrors {
	oldPassword?: string
	newPassword?: string
	confirmPassword?: string
	general?: string
}

export const ChangePasswordScreen = () => {
	const router = useRouter()
	const { contentPaddingBottom } = useNavbarLayout()

	const [oldPassword, setOldPassword] = useState('')
	const [newPassword, setNewPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [errors, setErrors] = useState<FormErrors>({})
	const [isLoading, setIsLoading] = useState(false)

	const clearError = (field: keyof FormErrors) => {
		setErrors((prev) => ({ ...prev, [field]: undefined }))
	}

	const validate = (): boolean => {
		const newErrors: FormErrors = {}

		if (!oldPassword) {
			newErrors.oldPassword = 'Введите текущий пароль'
		}

		if (!newPassword) {
			newErrors.newPassword = 'Введите новый пароль'
		} else if (newPassword.length < 8) {
			newErrors.newPassword = 'Минимум 8 символов'
		}

		if (!confirmPassword) {
			newErrors.confirmPassword = 'Подтвердите пароль'
		} else if (newPassword !== confirmPassword) {
			newErrors.confirmPassword = 'Пароли не совпадают'
		}

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const handleSubmit = async () => {
		if (!validate()) return

		setIsLoading(true)
		setErrors({})

		try {
			const userId = await getUserId()
			if (!userId) {
				setErrors({ general: 'Не удалось получить ID пользователя' })
				return
			}

			const result = await userApi.changePassword(
				userId.toString(),
				oldPassword,
				newPassword
			)

			if (result.success) {
				showToast.success('Пароль успешно изменён')
				setOldPassword('')
				setNewPassword('')
				setConfirmPassword('')
				// Navigate back after showing success toast
				setTimeout(() => router.back(), 2000)
			} else {
				// Handle specific error cases
				const errorLower = result.error?.toLowerCase() || ''
				if (
					errorLower.includes('incorrect') ||
					errorLower.includes('неверн') ||
					errorLower.includes('wrong')
				) {
					setErrors({ oldPassword: 'Неверный текущий пароль' })
				} else {
					setErrors({ general: result.error || 'Ошибка смены пароля' })
				}
			}
		} catch {
			setErrors({ general: 'Произошла ошибка при смене пароля' })
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<BackgroundLayout>
			<View className="flex-1 px-5">
				<View className="pt-4">
					<BackButton onPress={() => router.back()} />
				</View>

				<ScrollView
					className="flex-1"
					contentContainerStyle={{ paddingTop: 20, paddingBottom: contentPaddingBottom }}
					showsVerticalScrollIndicator={false}
					keyboardShouldPersistTaps="handled"
				>
					<Text className="mb-6 text-t1 font-medium text-white">Смена пароля</Text>

					<View className="gap-4">
						<Input
							variant="password"
							label="Текущий пароль"
							value={oldPassword}
							onChangeText={(text) => {
								setOldPassword(text)
								clearError('oldPassword')
							}}
							placeholder="Введите текущий пароль"
							error={errors.oldPassword}
						/>

						<Input
							variant="password"
							label="Новый пароль"
							value={newPassword}
							onChangeText={(text) => {
								setNewPassword(text)
								clearError('newPassword')
							}}
							placeholder="Минимум 8 символов"
							error={errors.newPassword}
						/>

						<Input
							variant="password"
							label="Подтвердите пароль"
							value={confirmPassword}
							onChangeText={(text) => {
								setConfirmPassword(text)
								clearError('confirmPassword')
							}}
							placeholder="Повторите новый пароль"
							error={errors.confirmPassword}
						/>

						<Button
							variant="ghost"
							size="s"
							onPress={() => router.push('/forgot-password')}
						>
							Не помню пароль
						</Button>

						{errors.general && (
							<Text className="text-t4 text-feedback-negative-900">{errors.general}</Text>
						)}
					</View>

					<View className="mt-8">
						<Button
							variant="primary"
							size="l"
							fullWidth
							onPress={handleSubmit}
							disabled={isLoading}
						>
							{isLoading ? 'Сохранение...' : 'Сохранить'}
						</Button>
					</View>
				</ScrollView>

				<NavigationBar />
			</View>
		</BackgroundLayout>
	)
}
