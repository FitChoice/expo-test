import React from 'react'
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native'
import { SafeAreaView, type Edge } from 'react-native-safe-area-context'

/**
 * SafeAreaContainer - контейнер с отступами для системных элементов
 *
 * По умолчанию применяет safe area для top, left, right.
 * Bottom НЕ включен по умолчанию, т.к. NavigationBar сам учитывает safe area.
 *
 * @param edges - какие края учитывать (по умолчанию: ['top', 'left', 'right'])
 * @param style - дополнительные стили
 *
 * @example
 * // Стандартное использование (без bottom для экранов с NavigationBar)
 * <SafeAreaContainer>
 *   <Content />
 *   <NavigationBar />
 * </SafeAreaContainer>
 *
 * @example
 * // Полный safe area (для экранов без NavigationBar)
 * <SafeAreaContainer edges={['top', 'right', 'bottom', 'left']}>
 *   <Content />
 * </SafeAreaContainer>
 */
interface SafeAreaContainerProps {
	children: React.ReactNode
	edges?: Edge[]
	style?: StyleProp<ViewStyle>
}

export const SafeAreaContainer = ({
	children,
	edges = ['top', 'left', 'right', 'bottom'],
	style,
}: SafeAreaContainerProps) => {
	return (
		<SafeAreaView edges={edges} style={[styles.container, style]}>
			{children}
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
})
