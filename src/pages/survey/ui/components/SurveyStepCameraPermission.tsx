import React from 'react'
import { View, Text } from 'react-native'
import { sharedStyles } from '@/shared/ui/styles/shared-styles'
import CameraIcon from '@/assets/icons/large/camera.svg'

/**
 * Шаг: Запрос доступа к камере
 */
export const SurveyStepCameraPermission: React.FC = () => {
	return (
		<View className="items-center gap-6">
			<CameraIcon />
			<Text style={sharedStyles.title}>Нужен доступ к камере</Text>
			<Text className="text-left text-t2 text-light-text-200">
				Камера используется для анализа движений и фото-прогресса. Видео не сохраняется и
				не передается.
			</Text>
		</View>
	)
}
