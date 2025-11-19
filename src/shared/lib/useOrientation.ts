import { useEffect } from 'react'
import { Platform } from 'react-native'
import * as ScreenOrientation from 'expo-screen-orientation'

/**
 * Хук для управления ориентацией экрана
 * @param lockType - тип блокировки ориентации
 * @param unlockOnUnmount - разблокировать при размонтировании
 */
export const useOrientation = (
    lockType: ScreenOrientation.OrientationLock = ScreenOrientation.OrientationLock
        .PORTRAIT_UP,
    unlockOnUnmount: boolean = true
) => {
    useEffect(() => {
        // Пропускаем блокировку ориентации на вебе
        if (Platform.OS === 'web') {
            return undefined
        }

        ScreenOrientation.lockAsync(lockType).catch((err) => {
            console.warn('Failed to lock orientation:', err)
        })

        // Возвращаем ориентацию при размонтировании компонента
        if (unlockOnUnmount) {
            return () => {
                if (Platform.OS !== 'web') {
                    ScreenOrientation.unlockAsync().catch((err) => {
                        console.warn('Failed to unlock orientation:', err)
                    })
                }
            }
        }
        return undefined
    }, [lockType, unlockOnUnmount])

    return {
        lockOrientation: (type: ScreenOrientation.OrientationLock) => {
            if (Platform.OS !== 'web') {
                ScreenOrientation.lockAsync(type).catch((err) => {
                    console.warn('Failed to lock orientation:', err)
                })
            }
        },
        unlockOrientation: () => {
            if (Platform.OS !== 'web') {
                ScreenOrientation.unlockAsync().catch((err) => {
                    console.warn('Failed to unlock orientation:', err)
                })
            }
        },
        getOrientation: async () => {
            if (Platform.OS === 'web') {
                // Возвращаем portrait по умолчанию для веба
                return ScreenOrientation.Orientation.PORTRAIT_UP
            }
            return await ScreenOrientation.getOrientationAsync()
        },
    }
}
