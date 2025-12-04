/**
 * Hook для записи голосовых сообщений
 * Чистый хук - только запись, без бизнес-логики загрузки
 * Использует expo-av
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { Audio } from 'expo-av'

export interface RecordingResult {
	uri: string
	durationMs: number
}

interface UseAudioRecorderReturn {
	isRecording: boolean
	recordingDuration: number
	startRecording: () => Promise<void>
	stopRecording: () => Promise<RecordingResult | null>
	cancelRecording: () => Promise<void>
}

export const useAudioRecorder = (): UseAudioRecorderReturn => {
    const [isRecording, setIsRecording] = useState(false)
    const [recordingDuration, setRecordingDuration] = useState(0)

    const recordingRef = useRef<Audio.Recording | null>(null)
    const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (durationIntervalRef.current) {
                clearInterval(durationIntervalRef.current)
            }
            if (recordingRef.current) {
                recordingRef.current.stopAndUnloadAsync().catch(() => {})
            }
        }
    }, [])

    const startRecording = useCallback(async () => {
        try {
            // Request permissions
            const { status } = await Audio.requestPermissionsAsync()
            if (status !== 'granted') {
                throw new Error('Нет разрешения на запись')
            }

            // Configure audio mode
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
                staysActiveInBackground: false,
            })

            // Create and start recording
            const recording = new Audio.Recording()
            await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY)
            await recording.startAsync()

            recordingRef.current = recording
            setIsRecording(true)
            setRecordingDuration(0)

            // Update duration every 100ms
            durationIntervalRef.current = setInterval(() => {
                recording.getStatusAsync().then((status) => {
                    if (status.isRecording) {
                        setRecordingDuration(status.durationMillis)
                    }
                })
            }, 100)
        } catch (error) {
            console.error('Failed to start recording:', error)
            setIsRecording(false)
        }
    }, [])

    const stopRecording = useCallback(async (): Promise<RecordingResult | null> => {
        if (!recordingRef.current) return null

        // Stop duration updates
        if (durationIntervalRef.current) {
            clearInterval(durationIntervalRef.current)
            durationIntervalRef.current = null
        }

        try {
            await recordingRef.current.stopAndUnloadAsync()
            const uri = recordingRef.current.getURI()
            const status = await recordingRef.current.getStatusAsync()

            // Reset audio mode
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
            })

            recordingRef.current = null
            setIsRecording(false)
            setRecordingDuration(0)

            // Return result only if recording is long enough
            if (uri && status.durationMillis && status.durationMillis > 500) {
                return {
                    uri,
                    durationMs: status.durationMillis,
                }
            }
            return null
        } catch (error) {
            console.error('Failed to stop recording:', error)
            recordingRef.current = null
            setIsRecording(false)
            setRecordingDuration(0)
            return null
        }
    }, [])

    const cancelRecording = useCallback(async () => {
        if (!recordingRef.current) return

        if (durationIntervalRef.current) {
            clearInterval(durationIntervalRef.current)
            durationIntervalRef.current = null
        }

        try {
            await recordingRef.current.stopAndUnloadAsync()
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
            })
        } catch (error) {
            console.error('Failed to cancel recording:', error)
        } finally {
            recordingRef.current = null
            setIsRecording(false)
            setRecordingDuration(0)
        }
    }, [])

    return {
        isRecording,
        recordingDuration,
        startRecording,
        stopRecording,
        cancelRecording,
    }
}
