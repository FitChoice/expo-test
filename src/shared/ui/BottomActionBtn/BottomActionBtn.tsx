import { Platform, StyleSheet, View } from 'react-native'
import { Button } from '@/shared/ui'
import React from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const IS_ANDROID = Platform.OS === 'android'

type Props = {
	handleClickBottomBtn: () => void
	title: string
}
export const BottomActionBtn = ({ handleClickBottomBtn, title }: Props) => {

	const insets = useSafeAreaInsets()
	return (
		<View style={[{bottom: IS_ANDROID ? insets.bottom + 10 : 15}, styles.container]}>
			<Button variant="primary" fullWidth onPress={handleClickBottomBtn} size="l">
				{title}
			</Button>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		//bottom: IS_ANDROID ? 55: 15,
		left: 0,
		right: 0,
		paddingHorizontal: 20,
		paddingTop: 12,
	},
})
