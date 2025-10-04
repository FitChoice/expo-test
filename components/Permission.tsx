import { useCameraPermissions  } from "expo-camera";
import { useEffect } from "react";
import { Text, View, Button } from "react-native";

export default function Permission({children}: {children: React.ReactNode}) {
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, []);

  if (!permission?.granted) {
    return (
      <View>
        <Text>No access to camera</Text>
        <Button onPress={requestPermission} title="Allow" />
      </View>
    );
  }

  return <Text>{children}</Text>;
}
