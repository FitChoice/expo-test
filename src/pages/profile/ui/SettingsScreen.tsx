/**
 * SettingsScreen - экран настроек профиля
 * Содержит уведомления, аккаунт, о приложении, FAQ и контакты
 */

import { useState, useEffect } from 'react'
import {
    View,
    ScrollView,
    Text,
    Linking,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    BackButton,
    Switch,
    SettingsItem,
    ConfirmModal,
    Avatar,
} from '@/shared/ui'
import { NavigationBar } from '@/widgets/navigation-bar'
import { SettingsSection, FAQAccordion } from '@/widgets/profile'
import { userApi } from '@/features/user/api'
import type { NotificationSettings } from '@/features/user/api'
import { getUserId, clearAuthData, useNavbarLayout, showToast } from '@/shared/lib'
import { useProfileQuery } from '@/features/user/hooks/useProfileQuery'
import { pickAvatarImage, type AvatarPickSource } from '@/shared/lib/media/pickAvatarImage'
import {
    FAQ_ITEMS,
    APP_VERSION,
    SUPPORT_EMAIL,
    SUPPORT_PHONE,
} from '@/shared/constants/profile'

export const SettingsScreen = () => {
    const router = useRouter()
    const queryClient = useQueryClient()
    const { contentPaddingBottom } = useNavbarLayout()

    const [userId, setUserId] = useState<number | null>(null)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showLogoutModal, setShowLogoutModal] = useState(false)
    const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false)

    useEffect(() => {
        getUserId().then(setUserId)
    }, [])

    // Profile query
    const { data: profile, isLoading: isProfileLoading } = useProfileQuery(userId)

    // Notifications query
    const { data: notifications } = useQuery({
        queryKey: ['notifications', userId],
        queryFn: async () => {
            if (!userId) throw new Error('User ID required')
            const result = await userApi.getNotifications(userId.toString())
            if (!result.success) throw new Error(result.error)
            return result.data
        },
        enabled: !!userId,
    })

    // Update notifications mutation
    const updateNotificationsMutation = useMutation({
        mutationFn: async (settings: NotificationSettings) => {
            if (!userId) throw new Error('Required')
            return userApi.updateNotifications(userId.toString(), settings)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications', userId] })
        },
        onError: () => {
            showToast.error('Ошибка сохранения настроек')
        },
    })

    // Delete mutation
    const deleteAccountMutation = useMutation({
        mutationFn: async () => {
            if (!userId) throw new Error('User ID required')
            return userApi.deleteUser(userId.toString())
        },
        onSuccess: async () => {
            await clearAuthData()
            router.replace('/auth')
        },
        onError: () => {
            showToast.error('Ошибка удаления аккаунта')
        },
    })

    const handleNotificationToggle = (
        key: keyof NotificationSettings
    ) => {
        if (!notifications) return
        updateNotificationsMutation.mutate({
            ...notifications,
            [key]: !notifications[key],
        })
    }

    const handleLogout = async () => {
        setShowLogoutModal(false)
        await userApi.logout()
        await clearAuthData()
        router.replace('/auth')
    }

    const handleDeleteConfirm = () => {
        setShowDeleteModal(false)
        deleteAccountMutation.mutate()
    }

    const handleAvatarPick = async (source: AvatarPickSource) => {
        const result = await pickAvatarImage(source)

        if (result.status === 'denied') {
            showToast.error('Нужно разрешение на доступ к фото/камере')
            return
        }

        if (result.status !== 'picked') return

        if (!userId) {
            showToast.error('Не найден пользователь')
            return
        }

        setIsUpdatingAvatar(true)
        const uploadResult = await userApi.updateAvatar(
            userId.toString(),
            result.asset.uri
        )
        setIsUpdatingAvatar(false)

        if (uploadResult.success) {
            queryClient.invalidateQueries({ queryKey: ['profile', userId] })
            showToast.success('Аватар обновлен')
        } else {
            showToast.error('Ошибка загрузки аватара')
        }
    }

    const handleAvatarPress = () => {
        Alert.alert('Изменить фото', 'Выберите источник', [
            { text: 'Камера', onPress: () => handleAvatarPick('camera') },
            { text: 'Галерея', onPress: () => handleAvatarPick('library') },
            { text: 'Отмена', style: 'cancel' },
        ])
    }

    const handleOpenURL = (url: string) => {
        Linking.openURL(url).catch(() => {
            showToast.error('Не удалось открыть ссылку')
        })
    }

    // Default notifications if not loaded
    const currentNotifications: NotificationSettings = notifications ?? {
        basic: true,
        progress: true,
        reports: true,
        system: true,
    }

    return (
        <View style={styles.container}>
            <View className="flex-1">
                <View className="px-5 pt-4">
                    <BackButton onPress={() => router.back()} />
                </View>

                <ScrollView
                    className="flex-1 px-5"
                    contentContainerStyle={{ paddingTop: 20, paddingBottom: contentPaddingBottom }}
                    showsVerticalScrollIndicator={false}
                >
                    {isProfileLoading ? (
                        <View className="items-center py-6">
                            <Text className="text-t3 text-light-text-500">Загрузка профиля...</Text>
                        </View>
                    ) : profile ? (
                        <View className="items-center py-6">
                            <View className="h-[132px] w-[132px] items-center justify-center rounded-full bg-[#1F1F1F]">
                                <Avatar
                                    source={profile.avatar}
                                    size={96}
                                    editable
                                    onPress={handleAvatarPress}
                                />
                                {isUpdatingAvatar && (
                                    <View className="absolute inset-0 items-center justify-center bg-black/50">
                                        <ActivityIndicator color="#FFFFFF" />
                                    </View>
                                )}
                            </View>
                            <Text className="mt-4 text-[20px] font-semibold text-white">
                                {profile.name || 'Имя пользователя'}
                            </Text>
                        </View>
                    ) : null}

                    {/* Notifications */}
                    <SettingsSection title="Уведомления">
                        <SettingsItem
                            label="Основные"
                            description="Ежедневные напоминания, связанные с базовой активностью"
                            rightElement={
                                <Switch
                                    checked={currentNotifications.basic}
                                    onChange={() => handleNotificationToggle('basic')}
                                />
                            }
                        />
                        <SettingsItem
                            label="Прогресс и мотивация"
                            description={'Поддерживают интерес, формируют ощущение роста и вовлечённости'}
                            rightElement={
                                <Switch
                                    checked={currentNotifications.progress}
                                    onChange={() => handleNotificationToggle('progress')}
                                />
                            }
                        />
                        <SettingsItem
                            label="Отчётность"
                            description="Помогают отслеживать результаты и обновлять личные данные"
                            rightElement={
                                <Switch
                                    checked={currentNotifications.reports}
                                    onChange={() => handleNotificationToggle('reports')}
                                />
                            }
                        />
                        <SettingsItem
                            label="Система"
                            description={'Информационные и сервисные уведомления'}
                            showDivider={false}
                            rightElement={
                                <Switch
                                    checked={currentNotifications.system}
                                    onChange={() => handleNotificationToggle('system')}
                                />
                            }
                        />
                    </SettingsSection>

                    {/* Account */}
                    <SettingsSection title="Аккаунт">
                        <SettingsItem
                            label="Сменить пароль"
                            onPress={() => router.push('/change-password')}

                        />
                        <SettingsItem
                            label="Удалить аккаунт"
                            onPress={() => setShowDeleteModal(true)}

                        />
                        <SettingsItem
                            label="Выйти"
                            onPress={() => setShowLogoutModal(true)}
                            showDivider={false}

                        />
                    </SettingsSection>

                    {/* About */}
                    <SettingsSection title="О приложении">
                        <SettingsItem
                            label="Версия"
                            rightElement={
                                <Text className="text-t3 text-light-text-500">
                                    {APP_VERSION}
                                </Text>
                            }
                        />
                        <SettingsItem
                            label="Поддержка"
                            // onPress={() => handleOpenURL(`mailto:${SUPPORT_EMAIL}`)}
                            // rightElement={
                            //     <Icon name="chevron-right" size={20} color="#949494" />
                            // }
                        />
                        <SettingsItem
                            label="Политика конфиденциальности"
                            onPress={() => router.push('/privacy-policy')}
                        />
                        <SettingsItem
                            label="Пользовательское соглашение"
                            onPress={() => router.push('/terms')}
                        />
                        <SettingsItem
                            label="Оценить приложение"
                            // onPress={() => {
                            //     // App Store / Google Play rating
                            //     showToast.success('Спасибо за интерес!')
                            // }}
                            // showDivider={false}
                            // rightElement={
                            //     <Icon name="chevron-right" size={20} color="#949494" />
                            // }
                        />
                    </SettingsSection>

                    {/* FAQ */}
                    <SettingsSection title="FAQ">
                        <FAQAccordion items={FAQ_ITEMS} />
                    </SettingsSection>

                    {/* Contacts */}
                    <SettingsSection title="Контакты">
                        <SettingsItem
                            label={SUPPORT_PHONE}
                            onPress={() => handleOpenURL(`tel:${SUPPORT_PHONE}`)}

                        />
                        <SettingsItem
                            label={SUPPORT_EMAIL}
                            onPress={() => handleOpenURL(`mailto:${SUPPORT_EMAIL}`)}
                            showDivider={false}

                        />
                    </SettingsSection>
                </ScrollView>

                {/* Delete Modal */}
                <ConfirmModal
                    visible={showDeleteModal}
                    title="вы точно хотите удалить аккаунт?"
                    subtitle="Это действие нельзя отменить"
                    confirmText="Удалить"
                    cancelText="Нет"
                    confirmVariant="danger"
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => setShowDeleteModal(false)}
                    isLoading={deleteAccountMutation.isPending}
                />

                {/* Logout Modal */}
                <ConfirmModal
                    visible={showLogoutModal}
                    title="выйти из аккаунта?"
                    confirmText="Выйти"
                    cancelText="Нет"
                    onConfirm={handleLogout}
                    onCancel={() => setShowLogoutModal(false)}
                />

                <NavigationBar />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#151515', // BG/Dark 500 BG - контентный контейнер
        ///borderRadius: 32,

        position: 'relative', // Для позиционирования элементов
        zIndex: 3, // Поверх браслета и заголовка
        overflow: 'hidden', // Для корректного отображения градиента
    },
})
