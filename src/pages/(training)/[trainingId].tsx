// /src/pages/(training)/[trainingId].tsx
import { Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function TrainingScreen() {
	const { trainingId } = useLocalSearchParams();
	console.log('✅ TrainingScreen opened with ID:', trainingId);
	return (
		<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
			<Text style={{ color: '#FFF', fontSize: 18 }}>Training ID: {trainingId}</Text>
		</View>
	);
}