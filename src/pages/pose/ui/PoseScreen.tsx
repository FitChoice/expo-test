import { View } from 'react-native'
import { PoseCamera } from '@/widgets/pose-camera'

/**
 * Fullscreen pose detection screen
 * Can be used for dedicated pose detection route
 */
export const PoseScreen = () => {
	return (
		<View className="flex flex-1">
			<PoseCamera />
		</View>
	)
}
