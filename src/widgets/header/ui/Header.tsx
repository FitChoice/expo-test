import { Link } from 'expo-router'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export const Header = () => {
    const { top } = useSafeAreaInsets()

    return (
        <View style={{ paddingTop: top }}>
            <View className="flex h-14 flex-row items-center justify-between px-4 lg:px-6">
                <Link className="flex-1 items-center justify-center font-bold" href="/">
					ACME
                </Link>
                <View className="flex flex-row gap-4 sm:gap-6">
                    <Link
                        className="text-md font-medium hover:underline web:underline-offset-4"
                        href="/"
                    >
						About
                    </Link>
                    <Link
                        className="text-md font-medium hover:underline web:underline-offset-4"
                        href="/"
                    >
						Product
                    </Link>
                    <Link
                        className="text-md font-medium hover:underline web:underline-offset-4"
                        href="/"
                    >
						Pricing
                    </Link>
                </View>
            </View>
        </View>
    )
}
