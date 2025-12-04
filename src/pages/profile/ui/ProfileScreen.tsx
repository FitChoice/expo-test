import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Button, BackgroundLayout, AuthGuard, Input } from '@/shared/ui'
import { NavigationBar } from '@/widgets/navigation-bar'
import { userApi } from '@/features/user/api'
import { getUserId } from '@/shared/lib/auth'
import * as SecureStore from 'expo-secure-store'
import { clearUserId } from '@/shared/lib/auth'

/**
 * Profile screen
 */
export const ProfileScreen = () => {
    return (
        <AuthGuard>
            <BackgroundLayout>
                <ProfileContent />
            </BackgroundLayout>
        </AuthGuard>
    )
}

const ProfileContent = () => {
    const router = useRouter()
    const [isDeleting, setIsDeleting] = useState(false)
    const [isChangingPassword, setIsChangingPassword] = useState(false)
    const [showPasswordForm, setShowPasswordForm] = useState(false)
    const [oldPassword, setOldPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [passwordError, setPasswordError] = useState('')

    const handleDeleteUser = async () => {
        Alert.alert(
            'Удаление аккаунта',
            'Вы уверены, что хотите удалить свой аккаунт? Это действие нельзя отменить.',
            [
                {
                    text: 'Отмена',
                    style: 'cancel',
                },
                {
                    text: 'Удалить',
                    style: 'destructive',
                    onPress: async () => {
                        setIsDeleting(true)
                        try {
                            const userId = await getUserId()
                            if (!userId) {
                                Alert.alert('Ошибка', 'Не удалось получить ID пользователя')
                                return
                            }

                            const result = await userApi.deleteUser(userId.toString())
                            if (result.success) {
                                // Clear auth data
                                await SecureStore.deleteItemAsync('auth_token')
                                await clearUserId()
                                Alert.alert('Успешно', 'Аккаунт удален', [
                                    {
                                        text: 'OK',
                                        onPress: () => router.replace('/auth'),
                                    },
                                ])
                            } else {
                                Alert.alert('Ошибка', result.error || 'Не удалось удалить аккаунт')
                            }
                        } catch (error) {
                            Alert.alert('Ошибка', 'Произошла ошибка при удалении аккаунта')
                            console.error('Delete user error:', error)
                        } finally {
                            setIsDeleting(false)
                        }
                    },
                },
            ]
        )
    }

    const handleChangePasswordClick = () => {
        setShowPasswordForm(true)
    }

    const handlePasswordSubmit = async () => {
        setPasswordError('')

        if (!oldPassword) {
            setPasswordError('Введите текущий пароль')
            return
        }

        if (!newPassword) {
            setPasswordError('Введите новый пароль')
            return
        }

        if (newPassword.length < 8) {
            setPasswordError('Пароль должен содержать минимум 8 символов')
            return
        }

        if (!confirmPassword) {
            setPasswordError('Подтвердите новый пароль')
            return
        }

        if (newPassword !== confirmPassword) {
            setPasswordError('Пароли не совпадают')
            return
        }

        setIsChangingPassword(true)

        try {
            const userId = await getUserId()
            if (!userId) {
                Alert.alert('Ошибка', 'Не удалось получить ID пользователя')
                return
            }

            const result = await userApi.changePassword(
                userId.toString(),
                oldPassword,
                newPassword
            )

            if (result.success) {
                Alert.alert('Успешно', 'Пароль изменен', [
                    {
                        text: 'OK',
                        onPress: () => {
                            setShowPasswordForm(false)
                            setOldPassword('')
                            setNewPassword('')
                            setConfirmPassword('')
                        },
                    },
                ])
            } else {
                Alert.alert('Ошибка', result.error || 'Не удалось изменить пароль')
            }
        } catch (error) {
            Alert.alert('Ошибка', 'Произошла ошибка при смене пароля')
            console.error('Change password error:', error)
        } finally {
            setIsChangingPassword(false)
        }
    }

    const handleCancelPassword = () => {
        setShowPasswordForm(false)
        setOldPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setPasswordError('')
    }

    return (
        <View style={styles.container}>
            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                <Text style={styles.title}>Профиль</Text>

                {!showPasswordForm ? (
                    <View style={styles.buttonsContainer}>
                        <Button
                            variant="primary"
                            size="l"
                            fullWidth
                            onPress={() => router.push('/survey')}
                            disabled={isChangingPassword || isDeleting}
                        >
							Пройти опрос
                        </Button>

                        <Button
                            variant="secondary"
                            size="l"
                            fullWidth
                            onPress={handleChangePasswordClick}
                            disabled={isChangingPassword || isDeleting}
                        >
							Сменить пароль
                        </Button>

                        <Button
                            variant="tertiary"
                            size="l"
                            fullWidth
                            onPress={handleDeleteUser}
                            disabled={isDeleting || isChangingPassword}
                        >
                            {isDeleting ? 'Удаление...' : 'Удалить пользователя'}
                        </Button>
                    </View>
                ) : (
                    <View style={styles.passwordForm}>
                        <Text style={styles.formTitle}>Смена пароля</Text>

                        <Input
                            variant="password"
                            label="Текущий пароль"
                            value={oldPassword}
                            onChangeText={(text) => {
                                setOldPassword(text)
                                if (passwordError) setPasswordError('')
                            }}
                            placeholder="Введите текущий пароль"
                            error={
                                passwordError && passwordError.includes('текущий')
                                    ? passwordError
                                    : undefined
                            }
                        />

                        <Input
                            variant="password"
                            label="Новый пароль"
                            value={newPassword}
                            onChangeText={(text) => {
                                setNewPassword(text)
                                if (passwordError) setPasswordError('')
                            }}
                            placeholder="Введите новый пароль"
                            error={
                                passwordError &&
								(passwordError.includes('новый') || passwordError.includes('8 символов'))
                                    ? passwordError
                                    : undefined
                            }
                        />

                        <Input
                            variant="password"
                            label="Подтвердите пароль"
                            value={confirmPassword}
                            onChangeText={(text) => {
                                setConfirmPassword(text)
                                if (passwordError) setPasswordError('')
                            }}
                            placeholder="Подтвердите новый пароль"
                            error={
                                passwordError &&
								(passwordError.includes('Подтвердите') ||
									passwordError.includes('совпадают'))
                                    ? passwordError
                                    : undefined
                            }
                        />

                        <View style={styles.formButtons}>
                            <Button
                                variant="secondary"
                                size="l"
                                fullWidth
                                onPress={handlePasswordSubmit}
                                disabled={isChangingPassword}
                            >
                                {isChangingPassword ? 'Смена пароля...' : 'Сменить пароль'}
                            </Button>

                            <Button
                                variant="ghost"
                                size="l"
                                fullWidth
                                onPress={handleCancelPassword}
                                disabled={isChangingPassword}
                            >
								Отмена
                            </Button>
                        </View>
                    </View>
                )}
            </ScrollView>

            <NavigationBar />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 100,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 40,
        fontFamily: 'Rimma_sans',
    },
    buttonsContainer: {
        gap: 16,
    },
    passwordForm: {
        gap: 20,
    },
    formTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
        fontFamily: 'Rimma_sans',
    },
    formButtons: {
        gap: 12,
        marginTop: 8,
    },
})
