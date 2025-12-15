/**
 * AttachmentPicker - popup для выбора типа вложения
 * Точное соответствие макету: тёмный popup с двумя опциями
 */

import React from 'react'
import { View, Text, Pressable, TouchableWithoutFeedback } from 'react-native'
import { Icon } from '@/shared/ui'

interface AttachmentPickerProps {
    onPickImage: () => void
    onPickFile: () => void
    onClose: () => void
    fileEnabled?: boolean
}

export const AttachmentPicker: React.FC<AttachmentPickerProps> = ({
    onPickImage,
    onPickFile,
    onClose,
    fileEnabled = true,
}) => {
    return (
        <>
            {/* Backdrop для закрытия по тапу вне popup */}
            <TouchableWithoutFeedback onPress={onClose}>
                <View className="absolute inset-0" style={{ zIndex: 99 }} />
            </TouchableWithoutFeedback>

            {/* Popup - позиционирован над input с высоким z-index */}
            <View
                className="absolute bottom-full left-4 mb-2"
                style={{ zIndex: 100 }}
            >
                <View
                    className="overflow-hidden rounded-xl bg-fill-800"
                    style={{
                        minWidth: 180,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 10,
                    }}
                >
                    {/* Фото и видео */}
                    <Pressable
                        onPress={onPickImage}
                        className="flex-row items-center px-4 py-3 active:bg-fill-700"
                    >
                        <View className="h-5 w-5 items-center justify-center">
                            <Icon name="image" size={20} color="#FFFFFF" />
                        </View>
                        <Text
                            className="ml-3 text-white"
                            style={{ fontFamily: 'Inter', fontWeight: '400', fontSize: 15 }}
                        >
                            Фото и видео
                        </Text>
                    </Pressable>

                    {/* Divider */}
                    <View className="h-px bg-fill-700" />

                    {/* Файл */}
                    <Pressable
                        onPress={onPickFile}
                        className="flex-row items-center px-4 py-3 active:bg-fill-700"
                        disabled={!fileEnabled}
                        style={!fileEnabled ? { opacity: 0.4 } : undefined}
                    >
                        <View className="h-5 w-5 items-center justify-center">
                            <Icon name="file" size={20} color="#FFFFFF" />
                        </View>
                        <Text
                            className="ml-3 text-white"
                            style={{ fontFamily: 'Inter', fontWeight: '400', fontSize: 15 }}
                        >
                            Файл
                        </Text>
                    </Pressable>
                </View>
            </View>
        </>
    )
}
