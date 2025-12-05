/**
 * ProfileScreen - главный экран профиля пользователя
 * Отображает информацию о пользователе, уровень, опыт и CTA для изменения программы
 */

import { useState, useEffect } from 'react'
import {
    View,
    ScrollView,
    TouchableOpacity,
    Text,
    StyleSheet,
    Image,
    Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Toast } from '@/shared/ui'
import { NavigationBar } from '@/widgets/navigation-bar'
import { ProfileHeader } from '@/widgets/profile'
import { userApi } from '@/features/user/api'
import { useProfileQuery } from '@/features/user/hooks/useProfileQuery'
import { getUserId, useNavbarLayout } from '@/shared/lib'
import { pickAvatarImage, type AvatarPickSource } from '@/shared/lib/media/pickAvatarImage'
import { Feather } from '@expo/vector-icons'
import boySample from '../../../../assets/images/profile_girl_sample.png'

export const ProfileScreen = () => {
    return (
        <View style={styles.container}>
            <ProfileContent />
        </View>
    )
}

const ProfileContent = () => {
    const router = useRouter()
    const queryClient = useQueryClient()
    const { contentPaddingBottom } = useNavbarLayout()

    // Local UI state
    const [userId, setUserId] = useState<number | null>(null)
    const [isEditMode, setIsEditMode] = useState(false)

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
   
        setIsEditMode(true)
    }

    const handleCancel = () => {
        setIsEditMode(false)
       
    }

    const pickAndUploadAvatar = async (source: AvatarPickSource) => {
        const result = await pickAvatarImage(source)

        if (result.status === 'denied') {
            setToast({
                visible: true,
                message: 'Нужен доступ к фото/камере',
                variant: 'error',
            })
            return
        }

        if (result.status !== 'picked') return

        if (!userId) {
            setToast({
                visible: true,
                message: 'Не найден пользователь',
                variant: 'error',
            })
            return
        }

        const uploadResult = await userApi.updateAvatar(
            userId.toString(),
            result.asset.uri
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

    const handleAvatarPress = () => {
        if (!isEditMode) {
            handleEditStart()
            return
        }
        Alert.alert('Изменить фото', 'Выберите источник', [
            { text: 'Камера', onPress: () => pickAndUploadAvatar('camera') },
            { text: 'Галерея', onPress: () => pickAndUploadAvatar('library') },
            { text: 'Отмена', style: 'cancel' },
        ])
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
