import { useEffect } from 'react'
import * as ScreenOrientation from 'expo-screen-orientation'

/**
 * Хук для управления ориентацией экрана
 * @param lockType - тип блокировки ориентации
 * @param unlockOnUnmount - разблокировать при размонтировании
 */
export const useOrientation = (
  lockType: ScreenOrientation.OrientationLock = ScreenOrientation.OrientationLock.PORTRAIT_UP,
  unlockOnUnmount: boolean = true
) => {
  useEffect(() => {
    console.log(`🔒 Locking screen orientation to: ${lockType}`)
    
    ScreenOrientation.lockAsync(lockType)
    
    // Возвращаем ориентацию при размонтировании компонента
    if (unlockOnUnmount) {
      return () => {
        console.log('🔓 Unlocking screen orientation')
        ScreenOrientation.unlockAsync()
      }
    }
  }, [lockType, unlockOnUnmount])

  return {
    lockOrientation: (type: ScreenOrientation.OrientationLock) => {
      ScreenOrientation.lockAsync(type)
    },
    unlockOrientation: () => {
      ScreenOrientation.unlockAsync()
    },
    getOrientation: async () => {
      return await ScreenOrientation.getOrientationAsync()
    }
  }
}
