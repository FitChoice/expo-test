import { Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export const Footer = () => {
	const { bottom } = useSafeAreaInsets()
	
	return (
		<View
			className="native:hidden flex shrink-0 bg-gray-100"
			style={{ paddingBottom: bottom }}
		>
			<View className="flex-1 items-start px-4 py-6 md:px-6">
				<Text className={'text-center text-gray-700'}>
					© {new Date().getFullYear()} Me
				</Text>
			</View>
		</View>
	)
}

