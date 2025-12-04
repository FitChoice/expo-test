/**
 * AudioPlayer - плеер для аудио-сообщений
 * Точное соответствие макету:
 * - User: тёмный фон, без аватара
 * - Assistant: белый круглый аватар слева, зелёный прогресс при воспроизведении
 */

import React from 'react'
import { View, Text, Pressable } from 'react-native'
import type { Attachment } from '@/entities/chat'
import { Icon } from '@/shared/ui'

interface AudioPlayerProps {
	attachment: Attachment
	isActive: boolean
	isPlaying: boolean
	playbackPosition: number // 0-1
	onPlay: () => void
	onPause: () => void
	isUserMessage: boolean
}

/**
 * Форматирует длительность в формат "M:SS"
 */
const formatDuration = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
    attachment,
    isActive,
    isPlaying,
    playbackPosition,
    onPlay,
    onPause,
    isUserMessage,
}) => {
    const duration = attachment.duration ?? 0
    const currentTime = isActive ? playbackPosition * duration : 0
    const progressWidth = isActive ? playbackPosition * 100 : 0

    if (isUserMessage) {
        // User audio - тёмный фон, минималистичный стиль
        return (
            <View
                className="mb-2 flex-row items-center self-end rounded-2xl bg-fill-700 p-4"
                style={{ minWidth: 180 }}
            >
                {/* Play/Pause button */}
                <Pressable
                    onPress={isPlaying ? onPause : onPlay}
                    className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-fill-500"
                >
                    <Icon name={isPlaying ? 'pause-solid' : 'play'} size={18} color="#FFFFFF" />
                </Pressable>

                {/* Progress bar */}
                <View className="mr-3 flex-1">
                    <View className="h-1 overflow-hidden rounded-full bg-fill-500">
                        <View
                            className="h-full rounded-full bg-light-text-200"
                            style={{ width: `${progressWidth}%` }}
                        />
                    </View>
                </View>

                {/* Duration */}
                <Text className="min-w-[32px] text-right font-rimma text-t4 text-light-text-200">
                    {formatDuration(duration)}
                </Text>
            </View>
        )
    }

    // Assistant audio - с аватаром, зелёный прогресс при воспроизведении
    return (
        <View
            className="mb-2 flex-row items-center self-start rounded-2xl bg-fill-800 p-3"
            style={{ minWidth: 220 }}
        >
            {/* Avatar */}
            <View className="mr-3 h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-light-text-100">
                {/* Placeholder - белый круг как в макете */}
            </View>

            {/* Play/Pause button */}
            <Pressable
                onPress={isPlaying ? onPause : onPlay}
                className={`mr-3 h-10 w-10 items-center justify-center rounded-full ${
                    isPlaying ? 'bg-brand-green-500' : 'bg-fill-500'
                }`}
            >
                <Icon
                    name={isPlaying ? 'pause-solid' : 'play'}
                    size={18}
                    color={isPlaying ? '#0A0A0A' : '#FFFFFF'}
                />
            </Pressable>

            {/* Progress bar + time */}
            <View className="flex-1">
                <View className="h-1 overflow-hidden rounded-full bg-fill-500">
                    <View
                        className={`h-full rounded-full ${isPlaying ? 'bg-brand-green-500' : 'bg-light-text-200'}`}
                        style={{ width: `${progressWidth}%` }}
                    />
                </View>
            </View>

            {/* Time */}
            <Text className="ml-3 min-w-[32px] text-right font-rimma text-t4 text-light-text-200">
                {formatDuration(isActive ? currentTime : duration)}
            </Text>
        </View>
    )
}
