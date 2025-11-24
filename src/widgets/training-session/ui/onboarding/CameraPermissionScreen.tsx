/**
 * Camera Permission Screen (2.1)
 * Второй шаг onboarding - запрос разрешения на использование камеры
 */

import { View, Text } from 'react-native'
import { Button } from '@/shared/ui'
import { DotsProgress } from '@/shared/ui/DotsProgress'
import CameraIcon from '@/assets/icons/large/camera.svg'
import { useCameraPermissions } from 'expo-camera'
import { CloseBtn } from '@/shared/ui/CloseBtn'
import { router } from 'expo-router'

interface CameraPermissionScreenProps {
	onNext: () => void;
}

export function CameraPermissionScreen({ onNext }: CameraPermissionScreenProps) {
    const [permission, requestPermission] = useCameraPermissions()

    const handleStop = () => {
        router.back()
    }

    const handleNext = async () => {
	
        if (permission?.granted) {
            onNext()
            return
        }
	
        await requestPermission()
		
    }

    return (
        <View className="flex-1">
            {/* Close Button */}
            <View className="absolute right-4  z-10">
                <CloseBtn handlePress={handleStop} classNames="h-12 w-12 rounded-2xl" />
            </View>

            {/* Progress Dots */}
            <View className="absolute left-1/2 -translate-x-1/2 top-10 z-10">
                <DotsProgress total={4} current={1} variant="onboarding" />
            </View>

            {/* Icon Section */}
            <View className="flex-1 justify-center items-center">
                <CameraIcon width={194} height={186} />
            </View>

            {/* Text and Button Section */}
            <View className="px-6 pb-6">
                {/* Title */}
                <Text className="text-h2 font-bold text-light-text-100 mb-3 text-left">
					Конфиденциальность
                </Text>

                {/* Description */}
                <Text className="text-t2 text-light-text-500 text-left leading-6 mb-20">
					Камера используется только для анализа движений. Видео не сохраняется и не передаётся
                </Text>

                {/* Button */}
                <Button
                    variant="primary"
                    onPress={handleNext}
                    //disabled={!permission?.granted} // блокируем, пока не запрашивали и нет разрешения
                    className="w-full"
                >
                    {permission?.granted ? 'Далее' : 'Разрешить доступ'}
                </Button>
            </View>
        </View>
    )
}
