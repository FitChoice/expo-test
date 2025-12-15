/**
 * ChatScreen - основной экран чата с ИИ-ассистентом
 * Composition Root: связывает UI хуки с бизнес-логикой (real API)
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { View, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native'
import {
    ChatHeader,
    MessageList,
    MessageInput,
    useAudioRecorder,
    useAudioPlayer,
    useFilePicker,
} from '@/widgets/chat'
import {
    CHAT_PAGE_SIZE,
    useChatHistory,
    useChatStore,
    useAttachmentUpload,
    useSendMessage,
} from '@/features/chat'
import { getAttachmentTypeFromMime, type Message } from '@/entities/chat'
import { getUserId } from '@/shared/lib/auth'

export const ChatScreen: React.FC = () => {
    const [userId, setUserId] = useState<number | null>(null)
    const [isSending, setIsSending] = useState(false)

    const {
        pendingAttachments,
        removePendingAttachment,
        clearPendingAttachments,
    } = useChatStore()

    useEffect(() => {
        getUserId().then((id) => setUserId(id))
    }, [])

    const {
        data: chatData,
        isLoading,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
    } = useChatHistory({ userId: userId ?? undefined, limit: CHAT_PAGE_SIZE, enabled: Boolean(userId) })

    const sendMessage = useSendMessage(CHAT_PAGE_SIZE)

    const { uploadAttachment, isUploading } = useAttachmentUpload()

    // === UI Media Hooks (используются в обоих режимах) ===
    const {
        isRecording,
        recordingDuration,
        startRecording,
        stopRecording,
        cancelRecording,
    } = useAudioRecorder()

    const {
        currentPlayingId,
        isPlaying,
        playbackPosition,
        play: playAudio,
        pause: pauseAudio,
    } = useAudioPlayer()

    const { pickImages, pickDocuments } = useFilePicker()

    const messages = useMemo<Message[]>(() => {
        if (!chatData?.pages) return []
        return chatData.pages.flatMap((page) => page.messages)
    }, [chatData?.pages])

    // === Handlers ===

    const handleSend = useCallback(async (text: string) => {
        if (!userId) return
        const attachmentsSnapshot = useChatStore.getState().pendingAttachments
        if (!text.trim() && attachmentsSnapshot.length === 0) return

        clearPendingAttachments()

        setIsSending(true)
        try {
            await sendMessage.mutateAsync({
                content: text,
                attachments: attachmentsSnapshot,
                userId,
            })
        } finally {
            setIsSending(false)
        }
    }, [clearPendingAttachments, sendMessage, userId])

    const handleStopRecording = useCallback(async () => {
        const result = await stopRecording()
        if (result) {
            const voiceAttachment = {
                type: 'audio' as const,
                localUri: result.uri,
                name: `voice_${Date.now()}.m4a`,
                mimeType: 'audio/m4a',
                size: 0,
                duration: result.durationMs,
            }

            const attachmentId = await uploadAttachment(voiceAttachment)
            const uploaded = useChatStore.getState().pendingAttachments.find((a) => a.id === attachmentId)
            if (uploaded && userId) {
                await handleSend('')
            }
        }
    }, [stopRecording, uploadAttachment, handleSend, userId])

    const handlePickImage = useCallback(async () => {
        const files = await pickImages()
        for (const file of files) {
            await uploadAttachment({
                type: getAttachmentTypeFromMime(file.mimeType),
                localUri: file.uri,
                name: file.fileName,
                mimeType: file.mimeType,
                size: file.fileSize,
                width: file.width,
                height: file.height,
            })
        }
    }, [pickImages, uploadAttachment])

    const handlePickDocument = useCallback(async () => {
        const files = await pickDocuments()
        for (const file of files) {
            await uploadAttachment({
                type: 'file',
                localUri: file.uri,
                name: file.fileName,
                mimeType: file.mimeType,
                size: file.fileSize,
            })
        }
    }, [pickDocuments, uploadAttachment])

    const handleLoadMore = useCallback(() => {
        if (hasNextPage) {
            fetchNextPage()
        }
    }, [fetchNextPage, hasNextPage])

    const handlePlayAudio = useCallback(
        (id: string, uri: string) => {
            playAudio(id, uri)
        },
        [playAudio]
    )

    const handlePauseAudio = useCallback(() => {
        pauseAudio()
    }, [pauseAudio])

    return (
        <View className="flex-1 bg-fill-900">
            <ChatHeader />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
                keyboardVerticalOffset={0}
            >
                <MessageList
                    messages={messages}
                    isLoading={isLoading}
                    isLoadingMore={isFetchingNextPage}
                    hasMore={hasNextPage ?? false}
                    onLoadMore={handleLoadMore}
                    isTyping={isSending}
                    streamingContent={undefined}
                    currentPlayingId={currentPlayingId}
                    isPlaying={isPlaying}
                    playbackPosition={playbackPosition}
                    onPlayAudio={handlePlayAudio}
                    onPauseAudio={handlePauseAudio}
                />

                <View>
                    <MessageInput
                        onSend={handleSend}
                        isRecording={isRecording}
                        recordingDuration={recordingDuration}
                        onStartRecording={startRecording}
                        onStopRecording={handleStopRecording}
                        onCancelRecording={cancelRecording}
                        pendingAttachments={pendingAttachments}
                        onRemoveAttachment={removePendingAttachment}
                        onPickImage={handlePickImage}
                        onPickDocument={handlePickDocument}
                        disabled={!userId || isSending || isUploading}
                    />
                </View>
            </KeyboardAvoidingView>

            {userId === null && (
                <View className="absolute inset-0 items-center justify-center bg-fill-900">
                    <ActivityIndicator size="large" color="#C5F680" />
                </View>
            )}
        </View>
    )
}
