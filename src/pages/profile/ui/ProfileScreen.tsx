/**
 * ProfileScreen - экран профиля пользователя
 * Отображает статистику, достижения и информацию о пользователе
 */

import { useState, useEffect } from 'react'
import { View, ScrollView, Text, TouchableOpacity, Alert, ActivityIndicator, Image, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { AuthGuard,
} from '@/shared/ui'
import { ProfileHeader } from '@/widgets/profile'
import { userApi } from '@/features/user/api'
import { getUserId, useNavbarLayout, showToast } from '@/shared/lib'
import { pickAvatarImage, type AvatarPickSource } from '@/shared/lib/media/pickAvatarImage'
import { useProfileQuery } from '@/features/user/hooks/useProfileQuery'
import { useUploadAvatar } from '@/features/user/hooks/useUploadAvatar'
import { Feather } from '@expo/vector-icons'
import { NavigationBar } from '@/widgets/navigation-bar'
import boySample from '../../../../assets/images/profile_girl_sample.png'

export const ProfileScreen = () => {
    return (
        <AuthGuard>
            <View style={styles.container}>
                <ProfileContent />
            </View>
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

    // Get userId on mount
    useEffect(() => {
        const fetchUserId = async () => {
            const id = await getUserId()
            setUserId(id)
        }
        fetchUserId()
    }, [])
	
    // Fetch profile data
    const { data: userProfile, isLoading } = useProfileQuery(userId)

    // Update profile mutation
    const updateProfileMutation = useMutation({
        mutationFn: async (name: string) => {
            if (!userId) throw new Error('User ID required')
            return userApi.updateUser(userId, { name })
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

    const uploadAvatarMutation = useUploadAvatar()

    const handleCancel = () => {
        setIsEditMode(false)
    }

    const pickAndUploadAvatar = async (source: AvatarPickSource) => {
        if (uploadAvatarMutation.isPending) return

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

        try {
            await uploadAvatarMutation.mutateAsync({ userId, asset: result.asset })
        } catch {
            // onError внутри мутации покажет тост
        }
    }

    const handleAvatarPress = () => {
        if (!isEditMode || uploadAvatarMutation.isPending) return

        Alert.alert('Изменить фото', 'Выберите источник', [
            { text: 'Камера', onPress: () => pickAndUploadAvatar('camera') },
            { text: 'Галерея', onPress: () => pickAndUploadAvatar('library') },
            { text: 'Отмена', style: 'cancel' },
        ])
    }

    if (isLoading || !userProfile) {
        return (
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator color="#FFFFFF" size="large" />
                <Text className="mt-4 text-t3 text-light-text-500">Загрузка...</Text>
            </View>
        )
    }

    return (
        <View className="flex-1">
            {/*<Toast*/}
            {/*    visible={toast.visible}*/}
            {/*    message={toast.message}*/}
            {/*    variant={toast.variant}*/}
            {/*    onHide={() => setToast((prev) => ({ ...prev, visible: false }))}*/}
            {/*/>*/}

            <ScrollView
                className="flex-1 px-5"
                contentContainerStyle={{
                    paddingTop: 48,
                    paddingBottom: contentPaddingBottom,
                }}
                showsVerticalScrollIndicator={false}
            >
                <ProfileHeader
                    name={userProfile.name}
                    email={userProfile.email}
                    avatar={userProfile.avatar_url}
                    experience={userProfile.experience}
                    isEditMode={isEditMode}
                    onAvatarPress={handleAvatarPress}
                    onCancel={handleCancel}
                    isSaving={updateProfileMutation.isPending}
                    isAvatarUploading={uploadAvatarMutation.isPending}
                />

                {/* CTA Banner */}
                <TouchableOpacity
                    onPress={() => router.push('/survey')}
                    className="mt-8 overflow-hidden rounded-[24px] bg-[#1E1E1E]"
                    activeOpacity={0.85}
                    style={{ minHeight: 150, padding: 20 }}
                >
                    <View className="flex-1 pr-16">
                        <Text className="text-[16px] font-semibold text-white">
											Изменить программу тренировок
                        </Text>
                        <View className="mt-5 h-12 w-12 items-center justify-center rounded-full bg-[#A96CF5]">
                            <Feather name="chevrons-right" size={24} color="white" />
                        </View>
                    </View>

                    <Image
                        source={boySample}
                        style={{
                            position: 'absolute',
                            right: -8,
                            bottom: -6,
                            width: 160,
                            height: 160,
                            resizeMode: 'contain',
                        }}
                    />
                </TouchableOpacity>

            </ScrollView>
            <NavigationBar />
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