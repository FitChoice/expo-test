/**
 * AudioPlayer - плеер для аудио-сообщений
 * Точное соответствие макету 8:
 * - Assistant: тёмный фон, play кнопка, серый slider, время справа (без аватара!)
 * - User: белый круглый аватар слева, зелёный play/pause при воспроизведении, зелёный slider
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
        // User audio (макет 8, нижнее сообщение):
        // - Белый круглый аватар слева
        // - Зелёный play/pause при воспроизведении
        // - Зелёный slider
        return (
            <View
                className="mb-2 flex-row items-center self-end rounded-2xl bg-fill-800 p-3"
                style={{ minWidth: 240 }}
            >
                {/* White avatar - круглый белый круг */}
                <View className="mr-3 h-11 w-11 rounded-full bg-white" />

                {/* Play/Pause button - зелёный при воспроизведении */}
                <Pressable
                    onPress={isPlaying ? onPause : onPlay}
                    className={`mr-3 h-9 w-9 items-center justify-center rounded-full ${
                        isActive ? 'bg-brand-green-500' : 'bg-fill-500'
                    }`}
                >
                    <Icon
                        name={isPlaying ? 'pause-solid' : 'play'}
                        size={16}
                        color={isActive ? '#0A0A0A' : '#FFFFFF'}
                    />
                </Pressable>

                {/* Progress bar - зелёный */}
                <View className="mr-3 flex-1">
                    <View className="h-1 overflow-hidden rounded-full bg-fill-500">
                        <View
                            className="h-full rounded-full bg-brand-green-500"
                            style={{ width: `${progressWidth}%` }}
                        />
                    </View>
                </View>

                {/* Duration */}
                <Text
                    className="min-w-[32px] text-right text-light-text-200"
                    style={{ fontFamily: 'Inter', fontWeight: '400', fontSize: 13 }}
                >
                    {formatDuration(isActive ? currentTime : duration)}
                </Text>
            </View>
        )
    }

    // Assistant audio (макет 8, верхнее сообщение):
    // - Тёмный фон, БЕЗ аватара
    // - Простая белая кнопка play
    // - Серый slider
    return (
        <View
            className="mb-2 flex-row items-center self-start rounded-2xl bg-fill-700 p-4"
            style={{ minWidth: 200 }}
        >
            {/* Play/Pause button - тёмный фон */}
            <Pressable
                onPress={isPlaying ? onPause : onPlay}
                className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-fill-500"
            >
                <Icon name={isPlaying ? 'pause-solid' : 'play'} size={18} color="#FFFFFF" />
            </Pressable>

            {/* Progress bar - серый */}
            <View className="mr-3 flex-1">
                <View className="h-1 overflow-hidden rounded-full bg-fill-500">
                    <View
                        className="h-full rounded-full bg-light-text-300"
                        style={{ width: `${progressWidth}%` }}
                    />
                </View>
            </View>

            {/* Duration */}
            <Text
                className="min-w-[32px] text-right text-light-text-200"
                style={{ fontFamily: 'Inter', fontWeight: '400', fontSize: 13 }}
            >
                {formatDuration(duration)}
            </Text>
        </View>
    )
}
