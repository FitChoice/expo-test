import React from 'react'
import type { Edge } from 'react-native-safe-area-context'
import { StyleSheet, useWindowDimensions, View } from 'react-native'
import { SafeAreaContainer } from '@/shared/ui'
import {
	RadialGradientBackground
} from '@/shared/ui/BackgroundLayout/RadialGradientBackground'

type Props = { children: React.ReactNode; hasSidePadding?: boolean; needBg?: boolean, edges?: Edge[] }
export const AuthBackgroundLayout = ({
																					 children,
																					 hasSidePadding = true,
																					 edges,
																					 needBg = true,
																				 }: Props) => {
	const { width: SCREEN_WIDTH } = useWindowDimensions()

	return (
		<View style={styles.container}>
			{/* Радиальный градиент с blur-эффектом */}
			{/*<RadialGradientBackground />*/}
			{needBg && (
				<View style={[styles.gradientContainer, { width: SCREEN_WIDTH }]}>
					<RadialGradientBackground />
				</View>
			)}

			{/* Контент */}
			<SafeAreaContainer
				edges={edges}
				style={[styles.contentContainer, hasSidePadding && styles.paddingContent]}
			>
				{children}
			</SafeAreaContainer>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		position: 'relative',
		zIndex: 3,
		overflow: 'hidden',
		backgroundColor: '#151515',
	},
	gradientContainer: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
	},
	contentContainer: {
		flex: 1,
	},
	paddingContent: {
		paddingHorizontal: 14,
	},
})
