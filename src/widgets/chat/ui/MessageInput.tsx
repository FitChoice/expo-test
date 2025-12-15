/**
 * MessageInput - поле ввода сообщения
 * Точное соответствие макету: запись с long press и swipe up для lock
 */

import React, { useState, useCallback, useMemo, useRef } from 'react'
import {
    View,
    TextInput,
    Pressable,
    Text,
    Keyboard,
    Animated,
    PanResponder,
} from 'react-native'
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
    voiceEnabled?: boolean
    fileEnabled?: boolean
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

// Порог свайпа вверх для блокировки (px)
const LOCK_SWIPE_THRESHOLD = 50

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
    voiceEnabled = true,
    fileEnabled = true,
}) => {
    const insets = useSafeAreaInsets()
    const [text, setText] = useState('')
    const [showAttachmentPicker, setShowAttachmentPicker] = useState(false)
    const [isRecordingLocked, setIsRecordingLocked] = useState(false)

    // Анимация для swipe up
    const swipeY = useRef(new Animated.Value(0)).current

    // PanResponder для swipe up (блокировка записи)
    const panResponder = useMemo(
        () =>
            PanResponder.create({
                onStartShouldSetPanResponder: () => isRecording && !isRecordingLocked,
                onMoveShouldSetPanResponder: (_, gestureState) =>
                    isRecording && !isRecordingLocked && gestureState.dy < -10,
                onPanResponderMove: (_, gestureState) => {
                    if (gestureState.dy < 0) {
                        swipeY.setValue(gestureState.dy)
                    }
                },
                onPanResponderRelease: (_, gestureState) => {
                    if (gestureState.dy < -LOCK_SWIPE_THRESHOLD) {
                        // Заблокировать запись
                        setIsRecordingLocked(true)
                    }
                    Animated.spring(swipeY, {
                        toValue: 0,
                        useNativeDriver: true,
                    }).start()
                },
            }),
        [isRecording, isRecordingLocked, swipeY]
    )

    const hasContent = text.trim().length > 0 || pendingAttachments.length > 0
    const canSend = hasContent && !isRecording && !disabled

    const handleSend = useCallback(() => {
        if (!canSend) return
        const trimmedText = text.trim()
        onSend(trimmedText)
        setText('')
        Keyboard.dismiss()
    }, [canSend, onSend, text])

    // Long press для начала записи
    const handleMicLongPress = useCallback(() => {
        if (!voiceEnabled) return
        if (!isRecording && !disabled) {
            setIsRecordingLocked(false)
            onStartRecording()
        }
    }, [isRecording, disabled, onStartRecording, voiceEnabled])

    // Отпускание кнопки - остановка записи (если не заблокировано)
    const handleMicPressOut = useCallback(() => {
        if (isRecording && !isRecordingLocked) {
            onStopRecording()
        }
    }, [isRecording, isRecordingLocked, onStopRecording])

    // Отправка заблокированной записи
    const handleSendRecording = useCallback(() => {
        setIsRecordingLocked(false)
        onStopRecording()
    }, [onStopRecording])

    // Отмена записи
    const handleCancelRecording = useCallback(() => {
        setIsRecordingLocked(false)
        onCancelRecording()
    }, [onCancelRecording])

    const toggleAttachmentPicker = useCallback(() => {
        setShowAttachmentPicker((prev) => !prev)
    }, [])

    const handlePickOption = useCallback(
        (option: 'image' | 'file') => {
            setShowAttachmentPicker(false)
            if (option === 'image') {
                onPickImage()
            } else if (fileEnabled) {
                onPickDocument()
            }
        },
        [fileEnabled, onPickDocument, onPickImage]
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
                    fileEnabled={fileEnabled}
                />
            )}

            {/* Pending attachments preview */}
            {pendingAttachments.length > 0 && !isRecording && (
                <AttachmentPreviewRow
                    attachments={pendingAttachments}
                    onRemove={onRemoveAttachment}
                />
            )}

            {/* Lock/Pause indicator - показывается при записи, над input bar */}
            {isRecording && (
                <View className="absolute right-4" style={{ bottom: 80 + insets.bottom }}>
                    {isRecordingLocked ? (
                        // Pause indicator (заблокировано) - просто визуальный индикатор
                        <View
                            className="items-center justify-center rounded-2xl"
                            style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                width: 52,
                                height: 52,
                            }}
                        >
                            <Icon name="pause-solid" size={24} color="#FFFFFF" />
                        </View>
                    ) : (
                        // Lock indicator (можно свайпнуть вверх)
                        <Animated.View
                            style={{
                                transform: [
                                    {
                                        translateY: swipeY.interpolate({
                                            inputRange: [-100, 0],
                                            outputRange: [-30, 0],
                                            extrapolate: 'clamp',
                                        }),
                                    },
                                ],
                            }}
                        >
                            <View
                                className="items-center rounded-2xl"
                                style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                    width: 52,
                                    paddingVertical: 10,
                                }}
                            >
                                <Icon name="lock" size={22} color="#FFFFFF" />
                                <Icon
                                    name="chevron-up"
                                    size={18}
                                    color="#FFFFFF"
                                    style={{ marginTop: 4 }}
                                />
                            </View>
                        </Animated.View>
                    )}
                </View>
            )}

            {/* Input container */}
            <View className="flex-row items-center px-3 pb-2 pt-3">
                {isRecording ? (
                    isRecordingLocked ? (
                        // Заблокированная запись (макет 7)
                        <View className="h-14 flex-1 flex-row items-center">
                            {/* Recording indicator + time */}
                            <View className="flex-row items-center">
                                <View className="mr-2 h-3 w-3 rounded-full bg-feedback-negative-900" />
                                <Text
                                    className="text-light-text-100"
                                    style={{ fontFamily: 'Inter', fontWeight: '400', fontSize: 15 }}
                                >
                                    {formatRecordingDuration(recordingDuration)}
                                </Text>
                            </View>

                            {/* Cancel text */}
                            <Pressable
                                onPress={handleCancelRecording}
                                className="flex-1 flex-row items-center justify-center"
                            >
                                <Text
                                    className="text-brand-green-500"
                                    style={{ fontFamily: 'Inter', fontWeight: '500', fontSize: 15 }}
                                >
                                    Отмена
                                </Text>
                            </Pressable>

                            {/* Send recording button - большая зелёная кнопка */}
                            <Pressable
                                onPress={handleSendRecording}
                                className="items-center justify-center rounded-full bg-brand-green-500"
                                style={{ width: 56, height: 56 }}
                            >
                                <Icon name="chevron-up" size={28} color="#0A0A0A" />
                            </Pressable>
                        </View>
                    ) : (
                        // Обычная запись (макет 6) - удержание кнопки
                        <View className="h-14 flex-1 flex-row items-center" {...panResponder.panHandlers}>
                            {/* Recording indicator + time */}
                            <View className="flex-row items-center">
                                <View className="mr-2 h-3 w-3 rounded-full bg-feedback-negative-900" />
                                <Text
                                    className="text-light-text-100"
                                    style={{ fontFamily: 'Inter', fontWeight: '400', fontSize: 15 }}
                                >
                                    {formatRecordingDuration(recordingDuration)}
                                </Text>
                            </View>

                            {/* "< Влево - отмена" */}
                            <Pressable
                                onPress={handleCancelRecording}
                                className="flex-1 flex-row items-center justify-center"
                            >
                                <Icon name="chevron-left" size={16} color="#BEBEC0" />
                                <Text
                                    className="ml-1 text-light-text-200"
                                    style={{ fontFamily: 'Inter', fontWeight: '400', fontSize: 15 }}
                                >
                                    Влево - отмена
                                </Text>
                            </Pressable>

                            {/* Mic button - большая зелёная кнопка, отпускание = отправка */}
                            <Animated.View
                                style={{
                                    transform: [
                                        {
                                            translateY: swipeY.interpolate({
                                                inputRange: [-100, 0],
                                                outputRange: [-20, 0],
                                                extrapolate: 'clamp',
                                            }),
                                        },
                                    ],
                                }}
                            >
                                <Pressable
                                    onPressOut={handleMicPressOut}
                                    className="items-center justify-center rounded-full bg-brand-green-500"
                                    style={{ width: 56, height: 56 }}
                                >
                                    <Icon name="microphone" size={28} color="#0A0A0A" />
                                </Pressable>
                            </Animated.View>
                        </View>
                    )
                ) : (
                    // Normal mode
                    <>
                        {/* Attachment button */}
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

                        {/* Send or Mic button */}
                        {canSend ? (
                            <Pressable
                                onPress={handleSend}
                                className="h-12 w-12 items-center justify-center rounded-2xl bg-brand-green-500"
                            >
                                <Icon name="chevron-up" size={24} color="#0A0A0A" />
                            </Pressable>
                        ) : (
                            <Pressable
                                onLongPress={handleMicLongPress}
                                delayLongPress={150}
                                className="h-12 w-12 items-center justify-center rounded-2xl"
                                style={{ backgroundColor: '#2B2B2B' }}
                                disabled={disabled || !voiceEnabled}
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
