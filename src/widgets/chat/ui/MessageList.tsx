/**
 * MessageList - список сообщений с использованием FlashList
 */

import React, { useCallback } from 'react'
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
    // FlashList inverted: новые сообщения внизу
    // Так что данные нужно реверснуть
    const reversedMessages = [...messages].reverse()

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

    const handleEndReached = useCallback(() => {
        if (hasMore && !isLoadingMore) {
            onLoadMore()
        }
    }, [hasMore, isLoadingMore, onLoadMore])

    const renderFooter = useCallback(() => {
        // В inverted списке footer - это верх (старые сообщения)
        if (isLoadingMore) {
            return (
                <View className="items-center py-4">
                    <ActivityIndicator size="small" color="#C5F680" />
                </View>
            )
        }
        return null
    }, [isLoadingMore])

    const renderHeader = useCallback(() => {
        // В inverted списке header - это низ (новые сообщения + typing)
        if (isTyping || streamingContent) {
            return (
                <View className="mb-4">
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
            data={reversedMessages}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16 }}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.3}
            ListFooterComponent={renderFooter}
            ListHeaderComponent={renderHeader}
            showsVerticalScrollIndicator={false}
            maintainVisibleContentPosition={{
                startRenderingFromBottom: true,
            }}
        />
    )
}
