/**
 * ChatHeader - заголовок экрана чата
 * Соответствие макету: градиентный фон, скруглённые углы, кнопка назад
 * Tap на заголовок/иконку переключает Mock режим
 */

import React from 'react'
import { View, Text } from 'react-native'
import { BlurView } from 'expo-blur'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { BackButton } from '@/shared/ui'
import { GradientHeader } from '@/shared/ui/GradientBG/GradientHeader'
import LogoGreen from '@/assets/images/logo_green.svg'

interface ChatHeaderProps {
	title?: string
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ title = 'ИИ-ассистент' }) => {
	const insets = useSafeAreaInsets()
	const handleBack = () => {
		if (router.canGoBack()) {
			router.back()
		} else {
			router.replace('/home')
		}
	}

	return (
		<View className="relative overflow-hidden rounded-b-[40px] py-4">
			{/* Градиентный фон */}
			<View className="absolute inset-0">
				<GradientHeader />
			</View>

			{/* Blur overlay */}
			<BlurView intensity={20} tint="dark" className="absolute inset-0" />

			{/* Content */}
			<View style={{ paddingTop: insets.top }}>
				<View className="flex-row items-center justify-between px-4 pb-4 pt-3">
					{/* Back button - переиспользуем shared компонент */}
					<BackButton
						onPress={handleBack}
						variant="translucent"
						position="relative"
						style={{ marginTop: 0, padding: 12 }}
					/>
					{/* Title */}
						<Text
							className=" text-t1 text-light-text-100">
							{title}
						</Text>

					<View
						className="p-2 items-center justify-center rounded-3xl bg-[#2E322D]">
						<LogoGreen width={30} height={30} />
					</View>
				</View>
			</View>
		</View>
	)
}
