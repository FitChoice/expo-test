import { useCallback, useEffect, useRef, useState } from 'react'

interface UseCountdownOptions {
	onComplete?: () => void
	autoStart?: boolean
}

/**
 * Хук для обратного отсчета.
 * Безопасно обрабатывает завершение через useEffect, предотвращая ошибки React 19 "update during render".
 */
export function useCountdown(initialSeconds: number, options: UseCountdownOptions = {}) {
	const { onComplete, autoStart = true } = options
	const [remainingTime, setRemainingTime] = useState(initialSeconds)
	const [isActive, setIsActive] = useState(autoStart)
	const [isFinished, setIsFinished] = useState(false)
	const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

	const clearTimer = useCallback(() => {
		if (timerRef.current) {
			clearInterval(timerRef.current)
			timerRef.current = null
		}
	}, [])

	const start = useCallback(() => {
		setIsActive(true)
		setIsFinished(false)
	}, [])

	const pause = useCallback(() => {
		setIsActive(false)
		clearTimer()
	}, [clearTimer])

	const reset = useCallback(
		(seconds: number = initialSeconds) => {
			setRemainingTime(seconds)
			setIsFinished(false)
			clearTimer()
			if (autoStart) setIsActive(true)
		},
		[initialSeconds, autoStart, clearTimer]
	)

	useEffect(() => {
		if (isActive && remainingTime > 0 && !isFinished) {
			timerRef.current = setInterval(() => {
				setRemainingTime((prev) => (prev > 0 ? prev - 1 : 0))
			}, 1000)
		} else {
			clearTimer()
		}

		return () => clearTimer()
	}, [isActive, remainingTime === 0, isFinished, clearTimer])

	// Безопасный вызов onComplete
	useEffect(() => {
		if (remainingTime === 0 && !isFinished && isActive) {
			setIsFinished(true)
			setIsActive(false)
			onComplete?.()
		}
	}, [remainingTime, isFinished, isActive, onComplete])

	return {
		remainingTime,
		isActive,
		isFinished,
		start,
		pause,
		reset,
		setRemainingTime,
	}
}
