import { StyleSheet, View } from 'react-native'
import { Button } from '@/shared/ui'
import React from 'react'

type Props = {
	handleClickBottomBtn: () => void
	title: string
}
export const BottomActionBtn = ({ handleClickBottomBtn, title }: Props) => {
	return (
		<View style={[styles.container]}>
			<Button variant="primary" fullWidth onPress={handleClickBottomBtn} size="l">
				{title}
			</Button>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		bottom: 15,
		left: 0,
		right: 0,
		paddingHorizontal: 20,
		paddingTop: 12,
	},
})
