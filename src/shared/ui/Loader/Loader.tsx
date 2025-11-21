import { ActivityIndicator, View, Text } from 'react-native'
import {
    RadialGradientBackground
} from '@/shared/ui/BackgroundLayout/RadialGradientBackground'

export const Loader = ({ text }: {text?: string}) =>  <View className="flex-1" >
    <RadialGradientBackground />
    <View className="bg-background-primary flex-1 items-center justify-center">
        {text &&       <Text className="text-h2 text-light-text-100 mb-2 text-center">
            {text}
        </Text>}
        <ActivityIndicator size="large" color="#9333EA" />
    </View>
</View>
