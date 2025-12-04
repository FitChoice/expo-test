/**
 * ChatScreen - основной экран чата с ИИ-ассистентом
 * Composition Root: связывает чистые UI хуки с бизнес-логикой
 */

import React, { useCallback, useMemo } from 'react'
import { View, KeyboardAvoidingView, Platform } from 'react-native'
import {
    ChatHeader,
    MessageList,
    MessageInput,
    useAudioRecorder,
    useAudioPlayer,
    useFilePicker,
} from '@/widgets/chat'
import {
    useChatHistory,
    useSendMessage,
    useStreamResponse,
    useChatStore,
    useAttachmentUpload,
} from '@/features/chat'
import { WELCOME_MESSAGE, getAttachmentTypeFromMime, type Message } from '@/entities/chat'

export const ChatScreen: React.FC = () => {
    // Server state
    const {
        data: chatData,
        isLoading,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
    } = useChatHistory()

    const sendMessage = useSendMessage()
    const { streamingContent, isStreaming, startStream } = useStreamResponse()

    // Client state (только pendingAttachments)
    const { pendingAttachments, removePendingAttachment, clearPendingAttachments } =
		useChatStore()

    // Upload hook из features (бизнес-логика)
    const { uploadAttachment, isUploading } = useAttachmentUpload()

    // UI Media hooks (чистые, без бизнес-логики)
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

    // Combine server messages with welcome message
    const messages = useMemo<Message[]>(() => {
        const serverMessages = chatData?.messages ?? []
        if (serverMessages.length === 0) {
            return [WELCOME_MESSAGE]
        }
        return serverMessages
    }, [chatData?.messages])

    // === Handlers - связывают UI с бизнес-логикой ===

    const handleSend = useCallback(
        async (text: string) => {
            if (!text.trim() && pendingAttachments.length === 0) return

            const attachments = [...pendingAttachments]
            clearPendingAttachments()

            await startStream(text, attachments)
        },
        [clearPendingAttachments, pendingAttachments, startStream]
    )

    const handleStopRecording = useCallback(async () => {
        const result = await stopRecording()
        if (result) {
            // Связываем результат записи с загрузкой
            uploadAttachment({
                type: 'audio',
                localUri: result.uri,
                name: `voice_${Date.now()}.m4a`,
                mimeType: 'audio/m4a',
                duration: result.durationMs,
            })
        }
    }, [stopRecording, uploadAttachment])

    const handlePickImage = useCallback(async () => {
        const files = await pickImages()
        // Связываем выбранные файлы с загрузкой
        for (const file of files) {
            uploadAttachment({
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
            uploadAttachment({
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
                    isTyping={isStreaming && !streamingContent}
                    streamingContent={streamingContent}
                    currentPlayingId={currentPlayingId}
                    isPlaying={isPlaying}
                    playbackPosition={playbackPosition}
                    onPlayAudio={handlePlayAudio}
                    onPauseAudio={handlePauseAudio}
                />

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
                    disabled={sendMessage.isPending || isStreaming || isUploading}
                />
            </KeyboardAvoidingView>
        </View>
    )
}
