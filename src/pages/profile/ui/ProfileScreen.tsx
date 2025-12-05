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
} from 'react-native'
import { useRouter } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as ImagePicker from 'expo-image-picker'
import {
    AuthGuard,
    Toast,
} from '@/shared/ui'
import { NavigationBar } from '@/widgets/navigation-bar'
import { ProfileHeader } from '@/widgets/profile'
import { userApi } from '@/features/user/api'
import { getUserId, useNavbarLayout } from '@/shared/lib'
import { Feather } from '@expo/vector-icons'

const boySample = require('../../../../assets/images/profile_girl_sample.png')

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
   
        setIsEditMode(true)
    }

    const handleCancel = () => {
        setIsEditMode(false)
       
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

        const pickedAsset = result.assets?.[0]

        if (!result.canceled && userId && pickedAsset) {
            const uploadResult = await userApi.updateAvatar(
                userId.toString(),
                pickedAsset.uri
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
