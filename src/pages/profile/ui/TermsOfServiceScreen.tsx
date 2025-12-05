/**
 * TermsOfServiceScreen - экран пользовательского соглашения
 */

import { View, ScrollView, Text } from 'react-native'
import { useRouter } from 'expo-router'
import { BackgroundLayout, BackButton } from '@/shared/ui'
import { NavigationBar } from '@/widgets/navigation-bar'
import { useNavbarLayout } from '@/shared/lib'
import { TERMS_OF_SERVICE_TEXT } from '@/shared/constants/profile'

export const TermsOfServiceScreen = () => {
    const router = useRouter()
    const { contentPaddingBottom } = useNavbarLayout()

    return (
        <BackgroundLayout>
            <View className="flex-1 px-5">
                <View className="pt-4">
                    <BackButton onPress={() => router.back()} />
                </View>

                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{ paddingTop: 20, paddingBottom: contentPaddingBottom }}
                    showsVerticalScrollIndicator={false}
                >
                    <Text className="mb-6 text-t1 font-medium text-white">
                        Пользовательское соглашение
                    </Text>
                    <Text className="text-t2 leading-6 text-light-text-200">
                        {TERMS_OF_SERVICE_TEXT}
                    </Text>
                </ScrollView>

                <NavigationBar />
            </View>
        </BackgroundLayout>
    )
}
