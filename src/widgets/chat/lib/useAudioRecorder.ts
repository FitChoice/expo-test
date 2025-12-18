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
	// Сохраняем последнюю известную длительность
	const lastDurationRef = useRef<number>(0)

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
				console.error('Нет разрешения на запись')
				return
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
			lastDurationRef.current = 0
			setIsRecording(true)
			setRecordingDuration(0)

			// Update duration every 100ms
			durationIntervalRef.current = setInterval(() => {
				recording
					.getStatusAsync()
					.then((recordingStatus) => {
						if (recordingStatus.isRecording && recordingStatus.durationMillis) {
							lastDurationRef.current = recordingStatus.durationMillis
							setRecordingDuration(recordingStatus.durationMillis)
						}
					})
					.catch(() => {})
			}, 100)
		} catch (error) {
			console.error('Failed to start recording:', error)
			setIsRecording(false)
		}
	}, [])

	const stopRecording = useCallback(async (): Promise<RecordingResult | null> => {
		if (!recordingRef.current) {
			console.log('No recording to stop')
			return null
		}

		// Stop duration updates
		if (durationIntervalRef.current) {
			clearInterval(durationIntervalRef.current)
			durationIntervalRef.current = null
		}

		// Сохраняем duration до остановки
		const finalDuration = lastDurationRef.current

		try {
			const recording = recordingRef.current
			recordingRef.current = null

			await recording.stopAndUnloadAsync()
			const uri = recording.getURI()

			// Reset audio mode
			await Audio.setAudioModeAsync({
				allowsRecordingIOS: false,
			})

			setIsRecording(false)
			setRecordingDuration(0)

			console.log('Recording stopped, uri:', uri, 'duration:', finalDuration)

			// Return result only if recording is long enough (> 300ms)
			if (uri && finalDuration > 300) {
				return {
					uri,
					durationMs: finalDuration,
				}
			}

			console.log('Recording too short or no URI')
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
			const recording = recordingRef.current
			recordingRef.current = null

			await recording.stopAndUnloadAsync()
			await Audio.setAudioModeAsync({
				allowsRecordingIOS: false,
			})
		} catch (error) {
			console.error('Failed to cancel recording:', error)
		} finally {
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
