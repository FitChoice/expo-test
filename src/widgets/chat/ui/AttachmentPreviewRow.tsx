/**
 * AttachmentPreviewRow - превью вложений перед отправкой
 * Точное соответствие макету: маленькие квадратные превью
 */

import React from 'react'
import { View, Text, Image, ScrollView, Pressable, ActivityIndicator } from 'react-native'
import type { Attachment } from '@/entities/chat'
import { Icon } from '@/shared/ui'

interface AttachmentPreviewRowProps {
	attachments: Attachment[]
	onRemove: (id: string) => void
}

export const AttachmentPreviewRow: React.FC<AttachmentPreviewRowProps> = ({
    attachments,
    onRemove,
}) => {
    if (attachments.length === 0) return null

    return (
        <View className="px-4 pb-2">
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
            >
                {attachments.map((attachment) => (
                    <AttachmentPreviewItem
                        key={attachment.id}
                        attachment={attachment}
                        onRemove={() => onRemove(attachment.id)}
                    />
                ))}
            </ScrollView>
        </View>
    )
}

interface AttachmentPreviewItemProps {
	attachment: Attachment
	onRemove: () => void
}

const AttachmentPreviewItem: React.FC<AttachmentPreviewItemProps> = ({
    attachment,
    onRemove,
}) => {
    const isImage = attachment.type === 'image'
    const isUploading = attachment.uploadStatus === 'uploading'
    const isError = attachment.uploadStatus === 'error'

    if (isImage) {
        // Image preview - маленький квадрат 56x56 как в макете
        return (
            <View className="relative">
                <Image
                    source={{ uri: attachment.localUri }}
                    className="h-14 w-14 rounded-xl"
                    resizeMode="cover"
                />

                {/* Upload overlay */}
                {isUploading && (
                    <View className="absolute inset-0 items-center justify-center rounded-xl bg-black/60">
                        <ActivityIndicator size="small" color="#C5F680" />
                    </View>
                )}

                {/* Error overlay */}
                {isError && (
                    <View className="absolute inset-0 items-center justify-center rounded-xl bg-black/60">
                        <Text className="font-rimma text-[10px] text-feedback-negative-900">
							Ошибка
                        </Text>
                    </View>
                )}

                {/* Remove button - маленький X в углу */}
                <Pressable
                    onPress={onRemove}
                    className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full bg-fill-700"
                    hitSlop={8}
                >
                    <Icon name="close" size={12} color="#FFFFFF" />
                </Pressable>
            </View>
        )
    }

    // File preview - компактная карточка как в макете
    return (
        <View
            className="flex-row items-center rounded-xl bg-fill-800 px-3 py-2"
            style={{ minWidth: 160, maxWidth: 200 }}
        >
            {/* File icon */}
            <View
                className={`mr-2 h-8 w-8 items-center justify-center rounded-lg ${
                    isError ? 'bg-feedback-negative-900' : 'bg-brand-purple-500'
                }`}
            >
                <Icon name="file" size={16} color="#FFFFFF" />
            </View>

            {/* File info */}
            <View className="mr-2 flex-1">
                <Text className="font-rimma text-t4 text-light-text-100" numberOfLines={1}>
                    {attachment.name}
                </Text>

                {/* Status */}
                {isUploading && (
                    <View className="mt-0.5 flex-row items-center">
                        <View className="h-0.5 flex-1 overflow-hidden rounded-full bg-fill-500">
                            <View
                                className="h-full rounded-full bg-brand-green-500"
                                style={{ width: `${attachment.uploadProgress}%` }}
                            />
                        </View>
                        <Text className="ml-2 font-rimma text-[10px] text-light-text-200">
							Загружается
                        </Text>
                    </View>
                )}

                {attachment.uploadStatus === 'completed' && (
                    <View className="mt-0.5 flex-row items-center">
                        <Text className="font-rimma text-[10px] text-brand-green-500">Загружено</Text>
                        <Icon name="check" size={10} color="#8BC34A" style={{ marginLeft: 2 }} />
                    </View>
                )}

                {isError && (
                    <Text className="mt-0.5 font-rimma text-[10px] text-feedback-negative-900">
						Ошибка
                    </Text>
                )}
            </View>

            {/* Remove button */}
            <Pressable onPress={onRemove} hitSlop={8}>
                <Icon name="close" size={14} color="#8F8F92" />
            </Pressable>
        </View>
    )
}
