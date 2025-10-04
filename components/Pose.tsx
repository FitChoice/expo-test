import { Dimensions, StyleSheet, View } from "react-native";
import { RNMediapipe } from "@thinksys/react-native-mediapipe";
const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

export const PoseCamera = () => {
	const handleLandmarks = (event: any) => {
		console.log("landmarks:", event);

		if (Array.isArray(event)) {
			event.forEach((point, idx) => {
				console.log(
					`Точка ${idx}: x=${point.x}, y=${point.y}, z=${point.z}, vis=${point.visibility}`,
				);
			});
		}
	};

	return (
		<View style={styles.container}>
			<RNMediapipe
				width={windowWidth}
				height={windowHeight}
				onLandmark={handleLandmarks}
				face={false}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "black",
	},
});