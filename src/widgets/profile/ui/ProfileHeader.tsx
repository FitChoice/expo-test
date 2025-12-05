/**
 * ProfileHeader - виджет шапки профиля
 * Отображает аватар, имя, email, уровень и опыт пользователя
 */

import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Avatar, ProgressBar, Icon, Input, Button } from '@/shared/ui'

interface ProfileHeaderProps {
	name: string
	email: string
	avatar: string | null
	level: number
	experience: number
	experienceToNextLevel: number
	isEditMode: boolean
	editedName: string
	onNameChange: (name: string) => void
	onAvatarPress: () => void
	onSettingsPress: () => void
	onSave: () => void
	onCancel: () => void
	isSaving?: boolean
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
    name,
    email,
    avatar,
    level,
    experience,
    experienceToNextLevel,
    isEditMode,
    editedName,
    onNameChange,
    onAvatarPress,
    onSettingsPress,
    onSave,
    onCancel,
    isSaving = false,
}) => {
    const progress =
		experienceToNextLevel > 0 ? experience / experienceToNextLevel : 0

    return (
        <View className="items-center pt-4">
            {/* Settings button */}
            <TouchableOpacity
                onPress={onSettingsPress}
                className="absolute right-0 top-4 h-12 w-12 items-center justify-center rounded-2xl bg-fill-700"
            >
                <Icon name="gear-fine" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Avatar */}
            <Avatar
                source={avatar}
                size={100}
                editable={isEditMode}
                onPress={onAvatarPress}
            />

            {/* Name */}
            {isEditMode ? (
                <View className="mt-4 w-full">
                    <Input
                        value={editedName}
                        onChangeText={onNameChange}
                        placeholder="Введите имя"
                    />
                    <View className="mt-4 flex-row gap-2">
                        <View className="flex-1">
                            <Button
                                variant="ghost"
                                size="s"
                                fullWidth
                                onPress={onCancel}
                                disabled={isSaving}
                            >
                                Отменить
                            </Button>
                        </View>
                        <View className="flex-1">
                            <Button
                                variant="primary"
                                size="s"
                                fullWidth
                                onPress={onSave}
                                disabled={isSaving}
                            >
                                {isSaving ? 'Сохранение...' : 'Сохранить'}
                            </Button>
                        </View>
                    </View>
                </View>
            ) : (
                <TouchableOpacity onPress={() => onNameChange(name)} className="mt-4">
                    <Text className="text-center text-t1.1 font-medium text-white">
                        {name}
                    </Text>
                </TouchableOpacity>
            )}

            {/* Email */}
            <Text className="mt-1 text-t3-regular text-light-text-500">{email}</Text>

            {/* Level & Experience */}
            <View className="mt-4 flex-row items-center gap-2">
                <Text className="text-t2-bold text-white">{level} уровень</Text>
                <View className="rounded-full bg-white/20 px-3 py-1">
                    <Text className="text-t4 text-white">{experience} опыта</Text>
                </View>
            </View>

            {/* Progress bar */}
            <View className="mt-4 w-full">
                <ProgressBar progress={progress} />
            </View>
        </View>
    )
}
