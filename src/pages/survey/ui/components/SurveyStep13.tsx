import React from 'react'
import { View, Text } from 'react-native'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import MaskedView from '@react-native-masked-view/masked-view'
import { sharedStyles } from '@/shared/ui/styles/shared-styles'

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
			<View className="mt-20 items-center justify-center">
				<View className="h-[495px] w-[275px] items-center rounded-[27px] border-8 border-fill-900 bg-[#2F2F2F] pt-10">
					<Text style={sharedStyles.titleLarge} className="mb-5">
						13:20
					</Text>

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
						<BlurView
							intensity={40}
							tint="dark"
							style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
						/>

						<View className="flex-1 items-center justify-center">
							<Text style={sharedStyles.titleCenter} className="mb-4">
								Включим уведомления?
							</Text>
							<View className="px-20">
								<Text className="text-t2 text-center leading-[19.2px] text-light-text-100">
									Мы будем напоминать о тренировках, чтобы вы ничего не пропустили
								</Text>
							</View>

						</View>
					</View>
				</MaskedView>
			</View>
		</View>
	)
}
