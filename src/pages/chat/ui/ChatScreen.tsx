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
	useChatLatest,
} from '@/features/chat'
import { getAttachmentTypeFromMime, type Message } from '@/entities/chat'
import { getUserId } from '@/shared/lib/auth'

export const ChatScreen: React.FC = () => {
	const [userId, setUserId] = useState<number | null>(null)
	const [isAwaitingAssistant, setIsAwaitingAssistant] = useState(false)

	const { pendingAttachments, removePendingAttachment, clearPendingAttachments } =
		useChatStore()

	useEffect(() => {
		getUserId().then((id) => setUserId(id))
	}, [])

	const {
		data: chatData,
		isLoading,
		isFetchingNextPage,
		hasNextPage,
		fetchNextPage,
	} = useChatHistory({
		userId: userId ?? undefined,
		limit: CHAT_PAGE_SIZE,
		enabled: Boolean(userId),
	})

	const sendMessage = useSendMessage(CHAT_PAGE_SIZE)
	const isAwaitingAnswer = isAwaitingAssistant || sendMessage.isPending

	const { uploadAttachment, isUploading } = useAttachmentUpload(userId)

	// === UI Media Hooks (используются в обоих режимах) ===
	const { isRecording, recordingDuration, startRecording, cancelRecording } =
		useAudioRecorder()

	const {
		currentPlayingId,
		isPlaying,
		playbackPosition,
		play: playAudio,
		pause: pauseAudio,
	} = useAudioPlayer()

	const { pickImages } = useFilePicker()

	const messages = useMemo<Message[]>(() => {
		if (!chatData?.pages) return []
		return chatData.pages.flatMap((page) => page.messages)
	}, [chatData?.pages])

	const lastServerMessageId = useMemo(() => {
		if (messages.length === 0) return null
		const numericIds = messages
			.map((m) => Number(m.id))
			.filter((id) => Number.isFinite(id)) as number[]
		if (numericIds.length === 0) return null
		return Math.max(...numericIds)
	}, [messages])

	useChatLatest({
		userId: userId ?? undefined,
		afterId: lastServerMessageId,
		limit: CHAT_PAGE_SIZE,
		enabled: isAwaitingAnswer,
		onAssistantMessage: () => setIsAwaitingAssistant(false),
	})

	// === Handlers ===

	const handleSend = useCallback(
		async (text: string) => {
			if (!userId || isAwaitingAnswer) return
			const attachmentsSnapshot = useChatStore.getState().pendingAttachments
			if (!text.trim() && attachmentsSnapshot.length === 0) return

			clearPendingAttachments()

			setIsAwaitingAssistant(true)
			try {
				await sendMessage.mutateAsync({
					content: text,
					attachments: attachmentsSnapshot,
					userId,
				})
			} catch (error) {
				setIsAwaitingAssistant(false)
				throw error
			}
		},
		[clearPendingAttachments, sendMessage, userId, isAwaitingAnswer]
	)

	const handleStopRecording = useCallback(async () => {
		// Voice is disabled for now
		return
	}, [])

	const handlePickImage = useCallback(async () => {
		if (isAwaitingAnswer) return
		const files = await pickImages()
		for (const file of files) {
			const type = getAttachmentTypeFromMime(file.mimeType)
			if (type !== 'image') {
				continue
			}
			await uploadAttachment({
				type,
				localUri: file.uri,
				name: file.fileName,
				mimeType: file.mimeType,
				size: file.fileSize,
				width: file.width,
				height: file.height,
			})
		}
	}, [pickImages, uploadAttachment, isAwaitingAnswer])

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
					isTyping={isAwaitingAnswer}
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
						onPickDocument={() => {}}
						voiceEnabled={false}
						fileEnabled={false}
						disabled={!userId || isAwaitingAnswer || isUploading}
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
