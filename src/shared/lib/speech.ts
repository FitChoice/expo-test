import { useCallback, useRef } from 'react'
import * as Speech from 'expo-speech'

const SPEECH_OPTIONS: Speech.SpeechOptions = {
	language: 'en-US',
	rate: 1.0,
	pitch: 1.0,
}

const COOLDOWN_MS = 2000
let isWarmedUp = false
let warmUpPromise: Promise<void> | null = null

export const warmUpSpeech = async (): Promise<void> => {
	if (isWarmedUp) return
	if (warmUpPromise) {
		await warmUpPromise
		return
	}

	warmUpPromise = (async () => {
		try {
			await Speech.getAvailableVoicesAsync()

			Speech.speak(' ', {
				rate: 2.0,
				onDone: () => {
					isWarmedUp = true
					if (__DEV__) console.warn('[Speech] TTS engine warmed up')
				},
				onError: () => {
					isWarmedUp = true
				},
			})
		} catch (error) {
			if (__DEV__) console.warn('[Speech] Warm-up failed:', error)
		} finally {
			isWarmedUp = true
			warmUpPromise = null
		}
	})()

	await warmUpPromise
}

export const useSpeechFeedback = () => {
	const lastPlayedRef = useRef<number>(0)

	const speak = useCallback(async (word: string) => {
		const now = Date.now()
		if (now - lastPlayedRef.current < COOLDOWN_MS) return

		const isSpeaking = await Speech.isSpeakingAsync()
		if (isSpeaking) return

		Speech.speak(word, {
			...SPEECH_OPTIONS,
			onError: (error) => {
				if (__DEV__) console.warn('[Speech] Error:', error)
			},
		})

		lastPlayedRef.current = now
	}, [])

	const stop = useCallback(() => {
		Speech.stop()
	}, [])

	return { speak, stop }
}
