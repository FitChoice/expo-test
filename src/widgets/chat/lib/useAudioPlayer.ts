/**
 * Hook для воспроизведения аудио-сообщений
 * Управляет воспроизведением одного файла за раз
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import { Audio, type AVPlaybackStatus } from 'expo-av'

interface UseAudioPlayerReturn {
	currentPlayingId: string | null
	playbackPosition: number // 0-1
	playbackDuration: number // ms
	isPlaying: boolean
	play: (id: string, uri: string) => Promise<void>
	pause: () => Promise<void>
	stop: () => Promise<void>
	seekTo: (position: number) => Promise<void> // 0-1
}

export const useAudioPlayer = (): UseAudioPlayerReturn => {
    const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null)
    const [playbackPosition, setPlaybackPosition] = useState(0)
    const [playbackDuration, setPlaybackDuration] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)

    const soundRef = useRef<Audio.Sound | null>(null)

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (soundRef.current) {
                soundRef.current.unloadAsync().catch(() => {})
            }
        }
    }, [])

    const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
        if (!status.isLoaded) return

        setPlaybackDuration(status.durationMillis ?? 0)
        setPlaybackPosition(
            status.durationMillis ? (status.positionMillis ?? 0) / status.durationMillis : 0
        )
        setIsPlaying(status.isPlaying)

        // Auto-stop when finished
        if (status.didJustFinish) {
            setCurrentPlayingId(null)
            setPlaybackPosition(0)
            setIsPlaying(false)
        }
    }, [])

    const play = useCallback(
        async (id: string, uri: string) => {
            try {
                // Stop current sound if playing different
                if (soundRef.current && currentPlayingId !== id) {
                    await soundRef.current.unloadAsync()
                    soundRef.current = null
                }

                // If same sound, just resume
                if (soundRef.current && currentPlayingId === id) {
                    await soundRef.current.playAsync()
                    return
                }

                // Configure audio mode for playback
                await Audio.setAudioModeAsync({
                    playsInSilentModeIOS: true,
                    staysActiveInBackground: false,
                })

                // Create new sound
                const { sound } = await Audio.Sound.createAsync(
                    { uri },
                    { shouldPlay: true },
                    onPlaybackStatusUpdate
                )

                soundRef.current = sound
                setCurrentPlayingId(id)
                setIsPlaying(true)
            } catch (error) {
                console.error('Failed to play audio:', error)
                setCurrentPlayingId(null)
                setIsPlaying(false)
            }
        },
        [currentPlayingId, onPlaybackStatusUpdate]
    )

    const pause = useCallback(async () => {
        if (soundRef.current) {
            await soundRef.current.pauseAsync()
        }
    }, [])

    const stop = useCallback(async () => {
        if (soundRef.current) {
            await soundRef.current.stopAsync()
            await soundRef.current.unloadAsync()
            soundRef.current = null
        }
        setCurrentPlayingId(null)
        setPlaybackPosition(0)
        setIsPlaying(false)
    }, [])

    const seekTo = useCallback(
        async (position: number) => {
            if (soundRef.current && playbackDuration > 0) {
                const positionMs = position * playbackDuration
                await soundRef.current.setPositionAsync(positionMs)
            }
        },
        [playbackDuration]
    )

    return {
        currentPlayingId,
        playbackPosition,
        playbackDuration,
        isPlaying,
        play,
        pause,
        stop,
        seekTo,
    }
}
