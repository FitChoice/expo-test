/**
 * ProfileHeader - виджет шапки профиля
 * Отображает аватар, имя, email, уровень и опыт пользователя
 */

import React from 'react'
import { ActivityIndicator, View, Text, TouchableOpacity } from 'react-native'
import { Avatar, ProgressBar } from '@/shared/ui'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { Feather } from '@expo/vector-icons'
import { router } from 'expo-router'

interface ProfileHeaderProps {
	name: string
	email: string
	avatar: string | null
	experience: number
	isEditMode: boolean
	onAvatarPress: () => void
	onCancel: () => void
	isSaving?: boolean
	isAvatarUploading?: boolean
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
    name,
    email,
    avatar,
    experience,
    isEditMode,
    onAvatarPress,
    isAvatarUploading = false,
}) => {

    return (
        <View className="items-center pt-2">
            {/* Settings button */}
            <TouchableOpacity
                onPress={() => router.push('/settings')}
                className="absolute right-0 top-4 h-10 w-10 items-center justify-center rounded-[14px] bg-[#F4F4F4]/20"
            >
                <Feather name="settings" size={20} color="white" />
            </TouchableOpacity>

            {/* Avatar with highlight */}
            <View className="h-[132px] w-[132px] items-center justify-center rounded-full">
                <Avatar
                    source={avatar}
                    size={96}
                    editable={isEditMode}
                    onPress={onAvatarPress}
                    loading={isAvatarUploading}
                />
            </View>

            {/* Name */}
     
            <TouchableOpacity

                className="mt-3 items-center"
            >
                <Text className="text-center text-[20px] font-semibold text-white">
                    {name || 'Имя пользователя'}
                </Text>
            </TouchableOpacity>

            {/* Email */}
            <Text className="mt-1 text-[14px] text-[#A5A5A8]">{email}</Text>

            {/* Level & Experience */}
            <View className="mt-5 w-full flex-row items-center justify-between px-1">
                <View className="flex-row items-center gap-2">
                    <Text className="text-[20px] font-semibold text-white">30</Text>
                    <Text className="text-[13px] text-[#A5A5A8]">уровень</Text>
                </View>
                <View
                    className={'rounded-full bg-gray-500/50 px-3 py-1 flex-row items-center'}
                >
                    <MaterialCommunityIcons name="bow-arrow" size={24} color="white" />
                    <Text className={'text-t4 text-white ml-1'}>22828 опыта</Text>
                </View>
            </View>

            {/* Progress bar */}
            <View className="mt-3 w-full px-1">
                <ProgressBar
                    progress={experience}
                    height={6}
                    trackColor="#2B2B2E"
                    fillColor="#A96CF5"
                />
            </View>
        </View>
    )
}
