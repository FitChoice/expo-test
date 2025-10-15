import { Dimensions, StyleSheet, View } from 'react-native'
import { RNMediapipe } from '@thinksys/react-native-mediapipe'
import { logLandmarks, type PoseLandmark } from '@/entities/pose'

const windowWidth = Dimensions.get('window').width
const windowHeight = Dimensions.get('window').height

export const PoseCamera = () => {
	const handleLandmarks = (event: unknown) => {
		if (Array.isArray(event)) {
			// Cast landmarks to PoseLandmark type
			const landmarks = event as PoseLandmark[]
			
			// Use the analyzer function from entities
			logLandmarks(landmarks)
		}
	}

	return (
		<View style={styles.container}>
			<RNMediapipe
				width={windowWidth}
				height={windowHeight}
				onLandmark={handleLandmarks}
				face={false}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'black',
	},
})

