/**
 * MessageInput - поле ввода сообщения
 * Точное соответствие макету: запись, вложения, текст
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { View, TextInput, Pressable, Text, Keyboard, Animated } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Icon } from '@/shared/ui'
import { AttachmentPicker } from './AttachmentPicker'
import { AttachmentPreviewRow } from './AttachmentPreviewRow'
import type { Attachment } from '@/entities/chat'

interface MessageInputProps {
    onSend: (text: string) => void
    // Recording
    isRecording: boolean
    recordingDuration: number
    onStartRecording: () => void
    onStopRecording: () => void
    onCancelRecording: () => void
    // Attachments
    pendingAttachments: Attachment[]
    onRemoveAttachment: (id: string) => void
    onPickImage: () => void
    onPickDocument: () => void
    // State
    disabled?: boolean
}

/**
 * Форматирует длительность в формат "M:SS,CC" (как в макете)
 */
const formatRecordingDuration = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    const centiseconds = Math.floor((ms % 1000) / 10)
    return `${minutes}:${seconds.toString().padStart(2, '0')},${centiseconds.toString().padStart(2, '0')}`
}

export const MessageInput: React.FC<MessageInputProps> = ({
    onSend,
    isRecording,
    recordingDuration,
    onStartRecording,
    onStopRecording,
    onCancelRecording,
    pendingAttachments,
    onRemoveAttachment,
    onPickImage,
    onPickDocument,
    disabled = false,
}) => {
    const insets = useSafeAreaInsets()
    const [text, setText] = useState('')
    const [showAttachmentPicker, setShowAttachmentPicker] = useState(false)

    // Animation for recording state
    const recordingScale = useMemo(() => new Animated.Value(1), [])

    useEffect(() => {
        Animated.spring(recordingScale, {
            toValue: isRecording ? 1.15 : 1,
            useNativeDriver: true,
            friction: 8,
        }).start()
    }, [isRecording, recordingScale])

    const hasContent = text.trim().length > 0 || pendingAttachments.length > 0
    const canSend = hasContent && !isRecording && !disabled

    const handleSend = useCallback(() => {
        if (!canSend) return
        const trimmedText = text.trim()
        onSend(trimmedText)
        setText('')
        Keyboard.dismiss()
    }, [canSend, onSend, text])

    const handleMicPress = useCallback(() => {
        if (isRecording) {
            onStopRecording()
        } else {
            onStartRecording()
        }
    }, [isRecording, onStartRecording, onStopRecording])

    const toggleAttachmentPicker = useCallback(() => {
        setShowAttachmentPicker((prev) => !prev)
    }, [])

    const handlePickOption = useCallback(
        (option: 'image' | 'file') => {
            setShowAttachmentPicker(false)
            if (option === 'image') {
                onPickImage()
            } else {
                onPickDocument()
            }
        },
        [onPickDocument, onPickImage]
    )

    return (
        <View
            style={{
                paddingBottom: Math.max(insets.bottom, 8),
                backgroundColor: '#1A1A1A',
            }}
        >
            {/* Attachment picker popup */}
            {showAttachmentPicker && (
                <AttachmentPicker
                    onPickImage={() => handlePickOption('image')}
                    onPickFile={() => handlePickOption('file')}
                    onClose={() => setShowAttachmentPicker(false)}
                />
            )}

            {/* Pending attachments preview */}
            {pendingAttachments.length > 0 && !isRecording && (
                <AttachmentPreviewRow
                    attachments={pendingAttachments}
                    onRemove={onRemoveAttachment}
                />
            )}

            {/* Input container - опущен на 3px */}
            <View className="flex-row items-center px-3 pb-2 pt-3">
                {isRecording ? (
                    // Recording mode
                    <View className="h-12 flex-1 flex-row items-center">
                        {/* Recording indicator + time */}
                        <View className="flex-row items-center">
                            <View className="mr-2 h-2.5 w-2.5 rounded-full bg-feedback-negative-900" />
                            <Text
                                className="text-light-text-100"
                                style={{ fontFamily: 'Inter', fontWeight: '400', fontSize: 15 }}
                            >
                                {formatRecordingDuration(recordingDuration)}
                            </Text>
                        </View>

                        {/* Cancel text */}
                        <Pressable
                            onPress={onCancelRecording}
                            className="flex-1 flex-row items-center justify-center"
                        >
                            <Text
                                className="text-light-text-200"
                                style={{ fontFamily: 'Inter', fontWeight: '400', fontSize: 15 }}
                            >
                                Отмена
                            </Text>
                        </Pressable>

                        {/* Right side icons: lock + chevron + mic button */}
                        <View className="flex-row items-center">
                            <View className="mr-2 items-center">
                                <Icon name="lock" size={18} color="#BEBEC0" />
                                <Icon
                                    name="chevron-up"
                                    size={14}
                                    color="#BEBEC0"
                                    style={{ marginTop: -4 }}
                                />
                            </View>

                            {/* Stop recording button */}
                            <Animated.View style={{ transform: [{ scale: recordingScale }] }}>
                                <Pressable
                                    onPress={handleMicPress}
                                    className="h-12 w-12 items-center justify-center rounded-full bg-brand-green-500"
                                >
                                    <Icon name="microphone" size={24} color="#0A0A0A" />
                                </Pressable>
                            </Animated.View>
                        </View>
                    </View>
                ) : (
                    // Normal mode
                    <>
                        {/* Attachment button - скруглённый квадрат, как поле ввода */}
                        <Pressable
                            onPress={toggleAttachmentPicker}
                            className="h-12 w-12 items-center justify-center rounded-2xl"
                            style={{ backgroundColor: '#2B2B2B' }}
                            disabled={disabled}
                        >
                            <Icon name="paperclip" size={24} color="#FFFFFF" />
                        </Pressable>

                        {/* Text input */}
                        <View className="mx-2 max-h-[120px] min-h-[44px] flex-1 justify-center rounded-2xl bg-fill-800 px-4">
                            <TextInput
                                value={text}
                                onChangeText={setText}
                                placeholder="Сообщение"
                                placeholderTextColor="#8F8F92"
                                className="py-3 text-light-text-100"
                                multiline
                                editable={!disabled}
                                style={{
                                    maxHeight: 100,
                                    fontFamily: 'Inter',
                                    fontWeight: '400',
                                    fontSize: 15,
                                }}
                            />
                        </View>

                        {/* Send or Mic button - скруглённый квадрат */}
                        {canSend ? (
                            <Pressable
                                onPress={handleSend}
                                className="h-12 w-12 items-center justify-center rounded-2xl bg-brand-green-500"
                            >
                                <Icon name="chevron-up" size={24} color="#0A0A0A" />
                            </Pressable>
                        ) : (
                            <Pressable
                                onPress={handleMicPress}
                                className="h-12 w-12 items-center justify-center rounded-2xl"
                                style={{ backgroundColor: '#2B2B2B' }}
                                disabled={disabled}
                            >
                                <Icon name="microphone" size={24} color="#FFFFFF" />
                            </Pressable>
                        )}
                    </>
                )}
            </View>
        </View>
    )
}
