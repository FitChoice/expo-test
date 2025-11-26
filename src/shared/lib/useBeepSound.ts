import { useEffect, useRef } from 'react'
import { Audio } from 'expo-av'

const beepSound = require('@/assets/sounds/beep1.mp3')

/**
 * Хук для воспроизведения звукового сигнала при повторениях упражнения
 * @returns Функция для воспроизведения звука
 */
export const useBeepSound = () => {
    const soundRef = useRef<Audio.Sound | null>(null)

    useEffect(() => {
        // Инициализация звука
        const loadSound = async () => {
            try {
                await Audio.setAudioModeAsync({
                    playsInSilentModeIOS: true,
                    staysActiveInBackground: false,
                })
                const { sound } = await Audio.Sound.createAsync(
                    beepSound,
                    { shouldPlay: false, volume: 0.5 }
                )
                soundRef.current = sound
            } catch (error) {
                console.log('Error loading sound:', error)
            }
        }
        loadSound()

        return () => {
            if (soundRef.current) {
                soundRef.current.unloadAsync()
            }
        }
    }, [])

    const playBeep = () => {
        if (soundRef.current) {
            soundRef.current.replayAsync().catch((error) => {
                console.log('Error playing sound:', error)
            })
        }
    }

    return { playBeep }
}

