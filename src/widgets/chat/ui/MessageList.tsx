/**
 * MessageList - список сообщений с использованием FlashList
 * Стандартный порядок: старые сверху, новые снизу
 */

import React, { useCallback, useRef, useEffect } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import type { Message } from '@/entities/chat'
import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './TypingIndicator'

interface MessageListProps {
    messages: Message[]
    isLoading: boolean
    isLoadingMore: boolean
    hasMore: boolean
    onLoadMore: () => void
    isTyping: boolean
    streamingContent?: string
    // Audio player state
    currentPlayingId?: string | null
    isPlaying?: boolean
    playbackPosition?: number
    onPlayAudio?: (id: string, uri: string) => void
    onPauseAudio?: () => void
}

export const MessageList: React.FC<MessageListProps> = ({
    messages,
    isLoading,
    isLoadingMore,
    hasMore,
    onLoadMore,
    isTyping,
    streamingContent,
    currentPlayingId,
    isPlaying,
    playbackPosition,
    onPlayAudio,
    onPauseAudio,
}) => {
    const listRef = useRef<FlashList<Message>>(null)

    // Автоскролл к новым сообщениям
    useEffect(() => {
        if (messages.length > 0 && listRef.current) {
            // Небольшая задержка для рендера
            setTimeout(() => {
                listRef.current?.scrollToEnd({ animated: true })
            }, 1000)
        }
    }, [messages.length])

    const renderItem = useCallback(
        ({ item }: { item: Message }) => (
            <MessageBubble
                message={item}
                onPlayAudio={onPlayAudio}
                onPauseAudio={onPauseAudio}
                currentPlayingId={currentPlayingId}
                isPlaying={isPlaying}
                playbackPosition={playbackPosition}
            />
        ),
        [currentPlayingId, isPlaying, onPauseAudio, onPlayAudio, playbackPosition]
    )

    const keyExtractor = useCallback((item: Message) => item.id, [])

    const handleStartReached = useCallback(() => {
        // Загрузка старых сообщений при скролле вверх
        if (hasMore && !isLoadingMore) {
            onLoadMore()
        }
    }, [hasMore, isLoadingMore, onLoadMore])

    const renderHeader = useCallback(() => {
        // Header сверху - загрузка старых сообщений
        if (isLoadingMore) {
            return (
                <View className="items-center py-4">
                    <ActivityIndicator size="small" color="#C5F680" />
                </View>
            )
        }
        return null
    }, [isLoadingMore])

    const renderFooter = useCallback(() => {
        // Footer снизу - typing indicator
        if (isTyping || streamingContent) {
            return (
                <View className="mt-4">
                    <TypingIndicator content={streamingContent} />
                </View>
            )
        }
        return null
    }, [isTyping, streamingContent])

    if (isLoading && messages.length === 0) {
        return (
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#C5F680" />
            </View>
        )
    }

    return (
        <FlashList<Message>
            ref={listRef}
            data={messages}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16 }}
            onStartReached={handleStartReached}
            onStartReachedThreshold={0.3}
            ListHeaderComponent={renderHeader}
            ListFooterComponent={renderFooter}
            showsVerticalScrollIndicator={false}
        />
    )
}
