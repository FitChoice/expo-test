/**
 * ProfileScreen - главный экран профиля пользователя
 * Отображает информацию о пользователе, уровень, опыт и CTA для изменения программы
 */

import { useState, useEffect } from 'react'
import { View, ScrollView, TouchableOpacity, Text } from 'react-native'
import { useRouter } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as ImagePicker from 'expo-image-picker'
import {
    BackgroundLayout,
    AuthGuard,
    Toast,
    Icon,
} from '@/shared/ui'
import { NavigationBar } from '@/widgets/navigation-bar'
import { ProfileHeader } from '@/widgets/profile'
import { userApi } from '@/features/user/api'
import { getUserId, useNavbarLayout } from '@/shared/lib'

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
    const queryClient = useQueryClient()
    const { contentPaddingBottom } = useNavbarLayout()

    // Local UI state
    const [userId, setUserId] = useState<number | null>(null)
    const [isEditMode, setIsEditMode] = useState(false)
    const [editedName, setEditedName] = useState('')
    const [toast, setToast] = useState<{
		visible: boolean
		message: string
		variant: 'success' | 'error'
	}>({
	    visible: false,
	    message: '',
	    variant: 'success',
	})

    // Get userId on mount
    useEffect(() => {
        const fetchUserId = async () => {
            const id = await getUserId()
            setUserId(id)
        }
        fetchUserId()
    }, [])

    // Fetch profile data
    const { data: profile, isLoading } = useQuery({
        queryKey: ['profile', userId],
        queryFn: async () => {
            if (!userId) throw new Error('User ID required')
            const result = await userApi.getProfile(userId.toString())
            if (!result.success) throw new Error(result.error)
            return result.data
        },
        enabled: !!userId,
    })

    // Update profile mutation
    const updateProfileMutation = useMutation({
        mutationFn: async (name: string) => {
            if (!userId) throw new Error('User ID required')
            return userApi.updateUser(userId.toString(), { name })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile', userId] })
            setIsEditMode(false)
            setToast({
                visible: true,
                message: 'Профиль обновлен',
                variant: 'success',
            })
        },
        onError: () => {
            setToast({
                visible: true,
                message: 'Ошибка обновления',
                variant: 'error',
            })
        },
    })

    // Handlers
    const handleEditStart = () => {
        setEditedName(profile?.name || '')
        setIsEditMode(true)
    }

    const handleSave = () => {
        if (editedName.trim()) {
            updateProfileMutation.mutate(editedName.trim())
        }
    }

    const handleCancel = () => {
        setIsEditMode(false)
        setEditedName('')
    }

    const handleAvatarPress = async () => {
        if (!isEditMode) {
            handleEditStart()
            return
        }

        const permissionResult =
			await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (!permissionResult.granted) {
            setToast({
                visible: true,
                message: 'Нужен доступ к галерее',
                variant: 'error',
            })
            return
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        })

        if (!result.canceled && userId) {
            const uploadResult = await userApi.updateAvatar(
                userId.toString(),
                result.assets[0].uri
            )
            if (uploadResult.success) {
                queryClient.invalidateQueries({ queryKey: ['profile', userId] })
                setToast({
                    visible: true,
                    message: 'Аватар обновлен',
                    variant: 'success',
                })
            } else {
                setToast({
                    visible: true,
                    message: 'Ошибка загрузки аватара',
                    variant: 'error',
                })
            }
        }
    }

    // Loading state
    if (isLoading || !profile) {
        return (
            <View className="flex-1 items-center justify-center">
                <Text className="text-t2 text-light-text-500">Загрузка...</Text>
            </View>
        )
    }

    return (
        <View className="flex-1">
            <Toast
                visible={toast.visible}
                message={toast.message}
                variant={toast.variant}
                onHide={() => setToast((prev) => ({ ...prev, visible: false }))}
            />

            <ScrollView
                className="flex-1 px-5"
                contentContainerStyle={{ paddingTop: 60, paddingBottom: contentPaddingBottom }}
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
                    editedName={editedName}
                    onNameChange={isEditMode ? setEditedName : handleEditStart}
                    onAvatarPress={handleAvatarPress}
                    onSettingsPress={() => router.push('/settings')}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    isSaving={updateProfileMutation.isPending}
                />

                {/* CTA Banner */}
                <TouchableOpacity
                    onPress={() => router.push('/survey')}
                    className="mt-8 flex-row items-center justify-between rounded-[32px] bg-dark-500 p-6"
                    activeOpacity={0.7}
                >
                    <Text className="flex-1 text-t2-bold text-white">
						Изменить программу тренировок
                    </Text>
                    <Icon name="chevron-right" size={24} color="#FFFFFF" />
                </TouchableOpacity>
            </ScrollView>

            <NavigationBar />
        </View>
    )
}
