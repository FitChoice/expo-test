import React from 'react'
import { View, Text } from 'react-native'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import MaskedView from '@react-native-masked-view/masked-view'
import { sharedStyles } from './shared-styles'

/**
 * Шаг 13: Предложение включить уведомления
 */
export const SurveyStep13: React.FC = () => {
    // const [hasRequested, setHasRequested] = useState(false)
    //
    // useEffect(() => {
    // 	const handleNotificationPermission = async () => {
    // 		if (hasRequested) return
    //
    // 		const { status: existingStatus } = await Notifications.getPermissionsAsync()
    //
    // 		// Если разрешение уже есть - просто показываем экран
    // 		if (existingStatus === 'granted') {
    // 			setHasRequested(true)
    // 			return
    // 		}
    //
    // 		// Если разрешения нет - запрашиваем
    // 		setHasRequested(true)
    // 		await Notifications.requestPermissionsAsync()
    // 	}
    //
    // 	// Небольшая задержка чтобы пользователь увидел экран
    // 	const timer = setTimeout(() => {
    // 		handleNotificationPermission()
    // 	}, 500)
    //
    // 	return () => clearTimeout(timer)
    // }, [hasRequested])

    return (
		
        <View className="position-relative">
            <View className="mt-20 items-center justify-center ">

                <View className="h-[495px] w-[275px] items-center rounded-[27px] bg-[#2F2F2F] pt-10 border-8 border-fill-900">
                    <Text style={sharedStyles.titleLarge} className="mb-5">13:20</Text>
                    <View className="w-[341px] items-start gap-0 rounded-2xl bg-[#1E1E1E] px-4 py-3">
                        <View className="w-full flex-row items-center justify-between">
                            <View className="flex-row items-center gap-3">
                                <View className="h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-[#C5F680]">
                                    <Text className="font-inter text-2xl font-bold text-black">F</Text>
                                </View>
                                <View className="gap-1">
                                    <Text className="font-inter text-sm font-semibold leading-tight text-[#C5F680]">
										FitChoice
                                    </Text>
                                    <Text className="font-inter text-base font-normal leading-tight text-white">
										Время заниматься!
                                    </Text>
                                </View>
                            </View>
                            <Text className="font-inter text-xs font-normal leading-tight text-[#949494]">
								2 мин
                            </Text>
                        </View>
                    </View>
                </View>
			
            </View>
		
            <View className="absolute bottom-0 left-0 right-0">
                <MaskedView
                    style={{ height: 180 }}
                    maskElement={
                        <View style={{ flex: 1 }}>
                            <LinearGradient
                                colors={['transparent', 'white', 'white', 'transparent']}
                                locations={[0, 0.1, 0.9, 1]}
                                start={{ x: 0, y: 0.5 }}
                                end={{ x: 1, y: 0.5 }}
                                style={{ flex: 1 }}
                            />
                        </View>
                    }
                >
                    <View style={{ flex: 1 }}>
                        <BlurView intensity={40} tint="dark" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
			
                        <View className="flex-1 items-center justify-center px-6">
                            <Text style={sharedStyles.titleCenter} className='mb-4'>Включим уведомления?</Text>
                            <Text className="font-inter text-light-text-200 text-center font-normal leading-[19.2px]">
					Мы будем напоминать о тренировках, чтобы вы ничего не пропустили
                            </Text>
                        </View>
                    </View>
                </MaskedView>
            </View>
	
        </View>

    )
}
