import React from 'react'
import { View, Text, Image } from 'react-native'
import { useRouter } from 'expo-router'
import type { Gender } from '@/entities/survey'
import { sharedStyles } from './shared-styles'
import { Chip, CircleIconButton } from '@/shared/ui'

interface SurveyStep14Props {
	userName: string,
	gender: Gender,
}

/**
 * Шаг 14: Финальный экран приветствия
 */
export const SurveyStep14: React.FC<SurveyStep14Props> = ({ userName, gender }) => {
    const router = useRouter()

    const imageSource = gender === 'female'
        ? require('../../../../../assets/images/girl_sample.png')
        : require('../../../../../assets/images/boy_sample.png')

    return (
        <View className="items-center gap-8 h-full pt-20">
            <View className="h-[72px] w-[72px] rounded-full bg-brand-purple-500" />
            <View className="items-center gap-2 bg-transparent">
                <Text className="font-inter text-center text-t2 font-normal leading-[19.2px] text-light-text-200">
					Добро пожаловать,
                </Text>
                <Text style={sharedStyles.titleCenter}>{userName}!</Text>
            </View>

            <View className="flex-1 justify-between w-full">
                <Text className="font-inter text-center text-t2 font-normal leading-[19.2px] text-light-text-200 px-10 ">
			Теперь мы знаем все что нужно, чтобы сформировать лучшую систему тренировок для
			вас
                </Text>

                {/* Карточка с фото начала пути */}
                <View className="relative h-[200px] w-full overflow-hidden rounded-3xl bg-black ">

                    {/* Изображение девушки справа (верхняя часть) */}
                    <Image
                        source={imageSource}
                        className="absolute right-0 top-0 h-full w-[50%]"
                        resizeMode="cover"
                        style={{ transform: [{ translateY: 0 }] }}
                    />

                    {/* Контент */}
                    <View className="relative flex-1 p-6">
                        {/* Текст и чипы слева */}
                        <View className="flex-1 justify-between">
                            <Text className="text-t3 text-white">
						Сделать фото{'\n'}начала пути?
                            </Text>

                            <View className="flex-row gap-3">
                                <Chip icon="clock-time-eight" text="3 минуты" variant="accent"/>
                                <Chip icon="bow-arrow" text="+20 опыта" variant="accent" />
                            </View>
                        </View>

                        {/* Кнопка справа внизу */}
                        <View className="absolute bottom-6 right-6">
                            <CircleIconButton
                                icon="chevrons-right"
                                size="large"
                                onPress={() => router.push('/stats')}
                            />
                        </View>
                    </View>
                </View>

            </View>
        </View>
    )
}
