import React, { useEffect, useState } from 'react'
import { TouchableOpacity, StyleSheet, Animated, Platform, View } from 'react-native'
import { BlurView } from 'expo-blur'
import Svg, {
	Defs,
	RadialGradient as SvgRadialGradient,
	Stop,
	Rect,
} from 'react-native-svg'
import { Checkbox } from '../Checkbox/Checkbox'
import type { GlowButtonProps } from './types'

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView)

/**
 * Базовый компонент кнопки с анимированной подсветкой (glow effect)
 *
 * Используется в:
 * - RadioSelectOption
 * - CheckboxSelectOption
 * - Кастомных сетках кнопок (возраст, дни недели)
 */
export const GlowButton: React.FC<GlowButtonProps> = ({
	children,
	isSelected,
	onPress,
	disabled = false,
	style,
	contentStyle,
}) => {
	// Анимированное значение для opacity подсветки
	const [opacityAnim] = useState(() => new Animated.Value(0))
	const [isPressed, setIsPressed] = useState(false)

	// Эффект для анимации при изменении состояния
	useEffect(() => {
		if (isSelected || isPressed) {
			// Активное состояние - показываем эффект с разной интенсивностью
			const targetOpacity = isPressed ? 0.9 : 0.7

			Animated.timing(opacityAnim, {
				toValue: targetOpacity,
				duration: 300,
				useNativeDriver: true,
			}).start()
		} else {
			// Неактивное - плавно скрываем
			Animated.timing(opacityAnim, {
				toValue: 0,
				duration: 200,
				useNativeDriver: true,
			}).start()
		}
	}, [isSelected, isPressed, opacityAnim])

	// Определяем цвет фона в зависимости от состояния
	const getBackgroundColor = () => {
		if (disabled) return '#2B2B2B'
		if (isPressed) return '#3F3F3F'
		if (isSelected) return '#2B2B2B'
		return '#2B2B2B'
	}

	return (
		<TouchableOpacity
			disabled={disabled}
			activeOpacity={0.8}
			onPress={onPress}
			onPressIn={() => !disabled && setIsPressed(true)}
			onPressOut={() => setIsPressed(false)}
			style={[
				styles.container,
				{ backgroundColor: getBackgroundColor() },
				disabled && styles.disabled,
				style,
			]}
		>
			{/* Blur эффект с анимацией - на заднем плане */}
			<AnimatedBlurView
				intensity={isPressed ? 100 : isSelected ? 80 : 50}
				tint="dark"
				style={[styles.blurContainer, { opacity: opacityAnim }]}
				experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
				blurReductionFactor={Platform.OS === 'android' ? 4 : undefined}
				pointerEvents="none"
			>
				<Svg
					width="100%"
					height="100%"
					style={StyleSheet.absoluteFill}
					viewBox="0 0 100 100"
					preserveAspectRatio="none"
				>
					<Defs>
						<SvgRadialGradient
							id="radialGlowButton"
							cx="0.5"
							cy="1"
							r="0.6"
							fx="0.5"
							fy="1"
							gradientUnits="objectBoundingBox"
						>
							{/* Яркое ядро - круговой эффект */}
							<Stop offset="0%" stopColor="rgb(197, 246, 128)" stopOpacity="0.7" />
							<Stop offset="25%" stopColor="rgb(197, 246, 128)" stopOpacity="0.6" />
							<Stop offset="40%" stopColor="rgb(197, 246, 128)" stopOpacity="0.45" />

							{/* Плавное затухание к краям */}
							<Stop offset="55%" stopColor="rgb(197, 246, 128)" stopOpacity="0.25" />
							<Stop offset="70%" stopColor="rgb(197, 246, 128)" stopOpacity="0.12" />
							<Stop offset="85%" stopColor="rgb(197, 246, 128)" stopOpacity="0.04" />
							<Stop offset="100%" stopColor="rgb(197, 246, 128)" stopOpacity="0" />
						</SvgRadialGradient>
					</Defs>
					<Rect x="0" y="0" width="100" height="100" fill="url(#radialGlowButton)" />
				</Svg>
			</AnimatedBlurView>

			{/* Зелёная линия для выбранного состояния */}
			{isSelected && <View style={styles.checkLine} />}

			{/* Чекбокс в верхнем правом углу для выбранного состояния */}
			{isSelected && (
				<View style={styles.checkboxContainer}>
					<Checkbox
						checked={true}
						onChange={() => {}} // Чекбокс только для отображения
						size="sm"
						disabled={true}
					/>
				</View>
			)}

			{/* Контент на переднем плане */}
			<View style={[styles.contentContainer, contentStyle]}>{children}</View>
		</TouchableOpacity>
	)
}

const styles = StyleSheet.create({
	container: {
		borderRadius: 16,
		overflow: 'hidden',
		position: 'relative',
	},
	disabled: {
		opacity: 0.5,
	},
	blurContainer: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		borderRadius: 16,
		overflow: 'hidden',
		zIndex: 0,
	},
	checkLine: {
		position: 'absolute',
		width: '80%',
		height: 2,
		backgroundColor: '#C5F680',
		bottom: 0,
		alignSelf: 'center',
		zIndex: 1,
	},
	checkboxContainer: {
		position: 'absolute',
		top: 8,
		right: 8,
		zIndex: 3,
	},
	contentContainer: {
		zIndex: 2,
	},
})
