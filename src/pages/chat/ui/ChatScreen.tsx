/**
 * ChatScreen - основной экран чата с ИИ-ассистентом
 * Composition Root: связывает чистые UI хуки с бизнес-логикой
 * Поддерживает Mock режим для тестирования без бэкенда
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
    useStreamResponse,
    useChatStore,
    useAttachmentUpload,
    useMockStreamResponse,
    useMockUploadFile,
} from '@/features/chat'
import { WELCOME_MESSAGE, getAttachmentTypeFromMime, type Message } from '@/entities/chat'

export const ChatScreen: React.FC = () => {
    // Get mock mode state
    const {
        isMockMode,
        mockMessages,
        pendingAttachments,
        removePendingAttachment,
        clearPendingAttachments,
        addPendingAttachment,
        updateAttachmentProgress,
        markAttachmentUploaded,
    } = useChatStore()

    // === Real Mode Hooks ===
    const {
        data: chatData,
        isLoading: isLoadingReal,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
    } = useChatHistory()

    const {
        streamingContent: realStreamingContent,
        isStreaming: isRealStreaming,
        startStream: startRealStream,
    } = useStreamResponse()

    // Real upload hook
    const { uploadAttachment: uploadRealAttachment, isUploading: isRealUploading } =
        useAttachmentUpload()

    // === Mock Mode Hooks ===
    const {
        streamingContent: mockStreamingContent,
        isStreaming: isMockStreaming,
        startStream: startMockStream,
    } = useMockStreamResponse()

    const { uploadFile: mockUploadFile } = useMockUploadFile()

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

    // === Computed values based on mode ===
    const isLoading = isMockMode ? false : isLoadingReal
    const isStreaming = isMockMode ? isMockStreaming : isRealStreaming
    const streamingContent = isMockMode ? mockStreamingContent : realStreamingContent
    const isUploading = isMockMode ? false : isRealUploading

    // Messages: mock или real
    const messages = useMemo<Message[]>(() => {
        if (isMockMode) {
            return mockMessages
        }
        const serverMessages = chatData?.messages ?? []
        if (serverMessages.length === 0) {
            return [WELCOME_MESSAGE]
        }
        return serverMessages
    }, [isMockMode, mockMessages, chatData?.messages])

    // === Upload handler (разный для mock и real) ===
    const uploadAttachment = useCallback(
        (params: {
            type: 'image' | 'audio' | 'video' | 'file'
            localUri: string
            name: string
            mimeType: string
            size?: number
            duration?: number
            width?: number
            height?: number
        }) => {
            if (isMockMode) {
                // В mock режиме: добавляем вложение и эмулируем загрузку
                const attachmentId = `att_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
                addPendingAttachment({
                    id: attachmentId,
                    type: params.type,
                    localUri: params.localUri,
                    name: params.name,
                    mimeType: params.mimeType,
                    size: params.size ?? 0,
                    duration: params.duration,
                    width: params.width,
                    height: params.height,
                    uploadProgress: 0,
                    uploadStatus: 'uploading',
                })
                // Эмулируем прогресс загрузки
                mockUploadFile(attachmentId, params.localUri)
            } else {
                // Real mode: используем настоящую загрузку
                uploadRealAttachment(params)
            }
        },
        [isMockMode, addPendingAttachment, mockUploadFile, uploadRealAttachment]
    )

    // === Handlers ===

    const handleSend = useCallback(
        async (text: string) => {
            if (!text.trim() && pendingAttachments.length === 0) return

            const attachments = [...pendingAttachments]
            clearPendingAttachments()

            if (isMockMode) {
                await startMockStream(text, attachments)
            } else {
                await startRealStream(text, attachments)
            }
        },
        [
            clearPendingAttachments,
            isMockMode,
            pendingAttachments,
            startMockStream,
            startRealStream,
        ]
    )

    const handleStopRecording = useCallback(async () => {
        const result = await stopRecording()
        if (result) {
            // Голосовое сообщение отправляется сразу (стандартный UX)
            const voiceAttachment = {
                id: `att_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
                type: 'audio' as const,
                localUri: result.uri,
                remoteUrl: result.uri, // В mock режиме используем localUri
                name: `voice_${Date.now()}.m4a`,
                mimeType: 'audio/m4a',
                size: 0,
                duration: result.durationMs,
                uploadProgress: 100,
                uploadStatus: 'completed' as const,
            }

            // Сразу отправляем
            if (isMockMode) {
                await startMockStream('', [voiceAttachment])
            } else {
                await startRealStream('', [voiceAttachment])
            }
        }
    }, [stopRecording, isMockMode, startMockStream, startRealStream])

    const handlePickImage = useCallback(async () => {
        const files = await pickImages()
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
        if (!isMockMode && hasNextPage) {
            fetchNextPage()
        }
    }, [fetchNextPage, hasNextPage, isMockMode])

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
                    hasMore={isMockMode ? false : (hasNextPage ?? false)}
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
                    disabled={isStreaming || isUploading}
                />
            </KeyboardAvoidingView>
        </View>
    )
}
