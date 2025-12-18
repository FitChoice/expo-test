import { useEffect, useMemo } from 'react'
import { Keyboard, Animated, Platform } from 'react-native'

interface UseKeyboardAnimationConfig {
	/**
	 * Множитель для смещения элементов (0.3 = 30% от высоты клавиатуры)
	 * @default 0.3
	 */
	offsetMultiplier?: number

	/**
	 * Включить анимацию затемнения для дополнительного элемента (например, браслета)
	 * @default false
	 */
	animateOpacity?: boolean

	/**
	 * Длительность анимации для Android (iOS использует нативную длительность)
	 * @default 250
	 */
	duration?: number
}

interface UseKeyboardAnimationReturn {
	/**
	 * Animated.Value для вертикального смещения (translateY)
	 */
	translateY: Animated.Value

	/**
	 * Animated.Value для прозрачности (opacity)
	 * Используется только если animateOpacity = true
	 */
	opacity: Animated.Value
}

/**
 * Хук для кросс-платформенной анимации элементов при появлении клавиатуры
 *
 * @example
 * ```tsx
 * const { translateY, opacity } = useKeyboardAnimation({
 *   offsetMultiplier: 0.3,
 *   animateOpacity: true,
 * })
 *
 * return (
 *   <>
 *     <Animated.View style={{ opacity }}>
 *       {/* Элемент, который будет затемняться *\/}
 *     </Animated.View>
 *
 *     <Animated.View style={{ transform: [{ translateY }] }}>
 *       {/* Элемент, который будет подниматься *\/}
 *     </Animated.View>
 *   </>
 * )
 * ```
 */
export const useKeyboardAnimation = (
	config: UseKeyboardAnimationConfig = {}
): UseKeyboardAnimationReturn => {
	const { offsetMultiplier = 0.3, animateOpacity = false, duration = 250 } = config

	const translateY = useMemo(() => new Animated.Value(0), [])
	const opacity = useMemo(() => new Animated.Value(1), [])

	useEffect(() => {
		// Используем разные события для iOS и Android
		const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
		const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'

		const keyboardShowListener = Keyboard.addListener(showEvent, (e) => {
			const animationDuration = Platform.OS === 'ios' ? e.duration || duration : duration

			const animations = [
				// Анимация поднятия элементов
				Animated.timing(translateY, {
					toValue: -e.endCoordinates.height * offsetMultiplier,
					duration: animationDuration,
					useNativeDriver: true,
				}),
			]

			// Добавляем анимацию затемнения если включена
			if (animateOpacity) {
				animations.push(
					Animated.timing(opacity, {
						toValue: 0.1,
						duration: animationDuration,
						useNativeDriver: true,
					})
				)
			}

			// Запускаем все анимации параллельно
			Animated.parallel(animations).start()
		})

		const keyboardHideListener = Keyboard.addListener(hideEvent, (e) => {
			const animationDuration = Platform.OS === 'ios' ? e.duration || duration : duration

			const animations = [
				// Анимация возврата элементов
				Animated.timing(translateY, {
					toValue: 0,
					duration: animationDuration,
					useNativeDriver: true,
				}),
			]

			// Добавляем анимацию возврата прозрачности если включена
			if (animateOpacity) {
				animations.push(
					Animated.timing(opacity, {
						toValue: 1,
						duration: animationDuration,
						useNativeDriver: true,
					})
				)
			}

			// Запускаем все анимации параллельно
			Animated.parallel(animations).start()
		})

		return () => {
			keyboardShowListener.remove()
			keyboardHideListener.remove()
		}
	}, [translateY, opacity, offsetMultiplier, animateOpacity, duration])

	return { translateY, opacity }
}
