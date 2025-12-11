/**
 * ProfileScreen - экран профиля пользователя
 * Отображает статистику, достижения и информацию о пользователе
 */

import { useState, useEffect } from 'react'
import { View, ScrollView, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import {
    Container,
    Button,
    Toast,
    Avatar,
} from '@/shared/ui'
import { NavigationBar } from '@/widgets/navigation-bar'
import { ProfileHeader } from '@/widgets/profile'
import { userApi } from '@/features/user/api'
import { getUserId, useNavbarLayout, showToast } from '@/shared/lib'
import { pickAvatarImage, type AvatarPickSource } from '@/shared/lib/media/pickAvatarImage'
import { useProfileQuery } from '@/features/user/hooks/useProfileQuery'

export const ProfileScreen = () => {
    return (
        <Container>
            <ProfileContent />
            <NavigationBar />
        </Container>
    )
}

const ProfileContent = () => {
    const router = useRouter()
    const queryClient = useQueryClient()
    const { contentPaddingBottom } = useNavbarLayout()

    // Local UI state
    const [userId, setUserId] = useState<number | null>(null)
    const [isEditMode, setIsEditMode] = useState(false)

    // Get userId on mount
    useEffect(() => {
        const fetchUserId = async () => {
            const id = await getUserId()
            setUserId(id)
        }
        fetchUserId()
    }, [])

    // Fetch profile data
    const { data: profile, isLoading } = useProfileQuery(userId)

    // Update profile mutation
    const updateProfileMutation = useMutation({
        mutationFn: async (name: string) => {
            if (!userId) throw new Error('User ID required')
            return userApi.updateUser(userId.toString(), { name })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile', userId] })
            setIsEditMode(false)
            showToast.success('Профиль обновлен')
        },
        onError: () => {
            showToast.error('Ошибка обновления')
        },
    })

    // Handlers
    const handleEditStart = () => {
        setIsEditMode(true)
    }

    const handleCancel = () => {
        setIsEditMode(false)
    }

    const pickAndUploadAvatar = async (source: AvatarPickSource) => {
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

        // Optimistic update handled by React Query + local state if needed
        // For now just sending request
        const uploadResult = await userApi.updateAvatar(userId.toString(), result.asset.uri)

        if (uploadResult.success) {
            queryClient.invalidateQueries({ queryKey: ['profile', userId] })
            showToast.success('Аватар обновлен')
        } else {
            showToast.error('Ошибка загрузки аватара')
        }
    }

    const handleAvatarPress = () => {
        if (!isEditMode) return

        Alert.alert('Изменить фото', 'Выберите источник', [
            { text: 'Камера', onPress: () => pickAndUploadAvatar('camera') },
            { text: 'Галерея', onPress: () => pickAndUploadAvatar('library') },
            { text: 'Отмена', style: 'cancel' },
        ])
    }

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator color="#FFFFFF" size="large" />
                <Text className="mt-4 text-t3 text-light-text-500">Загрузка...</Text>
            </View>
        )
    }

    return (
        <View className="flex-1">
            <ScrollView
                className="flex-1 px-5"
                contentContainerStyle={{
                    paddingTop: 48,
                    paddingBottom: contentPaddingBottom,
                }}
                showsVerticalScrollIndicator={false}
            >
                <ProfileHeader
                    name={profile.name}
                    email={profile.email}
                    avatar={profile.avatar}
                    level={profile.level}
                    experience={profile.experience}
                    experienceToNextLevel={profile.experienceToNextLevel}
                    isEditMode={isEditMode}
                    onAvatarPress={handleAvatarPress}
                    onCancel={handleCancel}
                    isSaving={updateProfileMutation.isPending}
                />

                {/* CTA Banner */}
                <TouchableOpacity
                    onPress={() => router.push('/survey')}
                    className="mt-6 overflow-hidden rounded-[24px]"
                >
                    <View className="bg-[#2C2C2E] px-5 py-5">
                        <Text className="mb-2 text-[20px] font-semibold text-white">
							Ваша программа
                        </Text>
                        <Text className="mb-4 text-t3 text-light-text-500">
							Пройдите опрос заново, чтобы скорректировать план тренировок под новые
							цели
                        </Text>
                        <Button
                            variant="secondary"
                            size="s"
                            onPress={() => router.push('/survey')}
                            className="self-start"
                        >
							Обновить план
                        </Button>
                    </View>
                </TouchableOpacity>

                {/* Settings Button */}
                {!isEditMode && (
                    <View className="mt-6">
                        <Button
                            variant="secondary"
                            size="m"
                            fullWidth
                            onPress={() => router.push('/settings')}
                            leftIcon={<Text className="mr-2 text-xl">⚙️</Text>}
                        >
							Настройки
                        </Button>
                    </View>
                )}
            </ScrollView>
        </View>
    )
}
