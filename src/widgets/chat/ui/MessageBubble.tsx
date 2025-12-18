/**
 * MessageBubble - пузырь сообщения
 * Точное соответствие макетам:
 * - Assistant: без фона, текст белый, выровнено слева
 * - User: тёмно-серый пузырь, выровнено справа
 * - Изображения: большие, скруглённые углы (макет 11)
 */

import React from 'react'
import { View, Text, Image, Dimensions } from 'react-native'
import type { Message } from '@/entities/chat'
import { AudioPlayer } from './AudioPlayer'
import { FileAttachment } from './FileAttachment'

interface MessageBubbleProps {
	message: Message
	onPlayAudio?: (id: string, uri: string) => void
	onPauseAudio?: () => void
	currentPlayingId?: string | null
	isPlaying?: boolean
	playbackPosition?: number
}

// Максимальная ширина изображения (примерно 60% экрана)
const IMAGE_MAX_WIDTH = Dimensions.get('window').width * 0.6

export const MessageBubble: React.FC<MessageBubbleProps> = ({
	message,
	onPlayAudio,
	onPauseAudio,
	currentPlayingId,
	isPlaying,
	playbackPosition,
}) => {
	const isUser = message.role === 'user'

	// Группируем вложения по типу
	const images = message.attachments.filter((a) => a.type === 'image')
	const audios = message.attachments.filter((a) => a.type === 'audio')
	const files = message.attachments.filter((a) => a.type === 'file' || a.type === 'video')

	return (
		<View className={`mb-4 ${isUser ? 'items-end' : 'items-start'}`}>
			{/* Изображения - каждое на отдельной строке (макет 11) */}
			{images.length > 0 && (
				<View className={`mb-2 ${isUser ? 'items-end' : 'items-start'}`}>
					{images.map((img) => (
						<Image
							key={img.id}
							source={{ uri: img.remoteUrl || img.localUri }}
							className="mb-2 rounded-3xl"
							style={{
								width: IMAGE_MAX_WIDTH,
								height: IMAGE_MAX_WIDTH,
							}}
							resizeMode="cover"
						/>
					))}
				</View>
			)}

			{/* Аудио сообщения */}
			{audios.map((audio) => (
				<AudioPlayer
					key={audio.id}
					attachment={audio}
					isActive={currentPlayingId === audio.id}
					isPlaying={currentPlayingId === audio.id && (isPlaying ?? false)}
					playbackPosition={currentPlayingId === audio.id ? (playbackPosition ?? 0) : 0}
					onPlay={() => onPlayAudio?.(audio.id, audio.remoteUrl || audio.localUri)}
					onPause={() => onPauseAudio?.()}
					isUserMessage={isUser}
				/>
			))}

			{/* Файлы */}
			{files.map((file) => (
				<FileAttachment key={file.id} attachment={file} isUserMessage={isUser} />
			))}

			{/* Текст сообщения */}
			{message.content.length > 0 && (
				<View
					className={`max-w-[85%] ${
						isUser ? 'rounded-[20px] rounded-br-md bg-fill-700 px-4 py-3' : 'px-0 py-0'
					}`}
				>
					<Text
						className="text-light-text-100"
						style={{
							fontFamily: 'Inter',
							fontWeight: '400',
							fontSize: 15,
							lineHeight: 22,
						}}
					>
						{message.content}
					</Text>
				</View>
			)}

			{/* Индикатор стриминга - три точки */}
			{message.isStreaming && (
				<View className="mt-2 flex-row items-center">
					<View className="mr-1 h-1.5 w-1.5 rounded-full bg-light-text-200 opacity-60" />
					<View className="mr-1 h-1.5 w-1.5 rounded-full bg-light-text-200 opacity-80" />
					<View className="h-1.5 w-1.5 rounded-full bg-light-text-200" />
				</View>
			)}
		</View>
	)
}
