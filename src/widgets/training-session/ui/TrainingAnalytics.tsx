import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import { GradientBg } from '@/shared/ui/GradientBG'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import Ionicons from '@expo/vector-icons/Ionicons'
import { TrainingTags } from '@/shared/ui/TrainingTags'
const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('screen')

import React from 'react'
import { Button } from '@/shared/ui'
import { router } from 'expo-router'
import { useTrainingStore } from '@/entities/training'
const trainingInfoBanner = require('@/assets/images/training_info_banner.png')

export const TrainingAnalytics = () => {
    const reportTraining = useTrainingStore((state) => state.reportTraining)

    const handleFinish = () => {
        // Navigate to home
        router.replace('/home')
    }

    const handleGoToReportPage = () => {
        reportTraining()
    }

    return (
        <View className="flex-1">
            <View style={styles.gradientContainer}>
                <GradientBg />
            </View>
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Header with Back Button */}
                <View className="flex-row items-center px-4 pb-4 pt-10">
                    <TouchableOpacity
                        className="h-12 w-12 items-center justify-center rounded-2xl bg-gray-500/50"
                        // onPress={handleBack}
                        onPress={handleGoToReportPage}
                    >
                        <Ionicons name="chevron-back" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Purple Section with Image */}
                <View className="relative overflow-hidden rounded-t-3xl bg-purple-500">
                    <Image source={trainingInfoBanner} className="h-80 w-full" resizeMode="cover" />

                    {/* Overlay Tags - Top Left and Top Right */}
                    <View className="absolute left-4 right-4 top-5 w-40">
                        <TrainingTags
                            icon1={
                                <MaterialCommunityIcons name="lightning-bolt" size={16} color="#FFFFFF" />
                            }
                            title1="Чистота техники 82%"
                            icon2={null}
                            title2="Точек роста 2"
                            className="justify-between"
                        />
                    </View>

                    {/* Exercise Name - Bottom Left */}
                    <View className="absolute bottom-4 left-4">
                        <Text className="text-t1 font-bold text-white">Присед с резинкой</Text>
                    </View>
                </View>

                {/* Feedback Section - Dark Grey Background */}
                <View className="bg-gray-900 px-6 pb-6 pt-6">
                    {/* First Feedback Block */}
                    <View className="mb-6">
                        <Text className="mb-4 text-t2 leading-6 text-light-text-500">
							Во втором подходе бедро поднималось слишком высоко — нагрузка смещалась в
							поясницу
                        </Text>
                        <View className="flex-row items-center rounded-xl bg-gray-800 px-4 py-3">
                            <MaterialCommunityIcons name="check-circle" size={20} color="#AAEC4D" />
                            <Text className="ml-3 flex-1 text-t3 text-white">
								Держи таз неподвижно, концентрируйся на движении бедра
                            </Text>
                        </View>
                    </View>

                    {/* Second Feedback Block */}
                    <View>
                        <Text className="mb-4 text-t2 leading-6 text-white">
							В конце движения не было короткой паузы — мышцы не успевали зафиксироваться
                        </Text>
                        <View className="mb-3 flex-row items-center rounded-xl bg-gray-800 px-4 py-3">
                            <MaterialCommunityIcons name="check-circle" size={20} color="#AAEC4D" />
                            <Text className="ml-3 flex-1 text-t3 text-white">
								Добавь короткую паузу (1 секунда) в верхней точке
                            </Text>
                        </View>
                        <View className="flex-row items-center rounded-xl bg-gray-800 px-4 py-3">
                            <MaterialCommunityIcons name="check-circle" size={20} color="#AAEC4D" />
                            <Text className="ml-3 flex-1 text-t3 text-white">
								Сделай пробную серию перед зеркалом или стеной — поможет стабилизировать
								корпус
                            </Text>
                        </View>
                    </View>
                </View>
                {/* Purple Section with Image */}
                <View className="relative overflow-hidden rounded-t-3xl bg-purple-500">
                    <Image source={trainingInfoBanner} className="h-80 w-full" resizeMode="cover" />

                    {/* Overlay Tags - Top Left and Top Right */}
                    <View className="absolute left-4 right-4 top-5 w-40">
                        <TrainingTags
                            icon1={
                                <MaterialCommunityIcons name="lightning-bolt" size={16} color="#FFFFFF" />
                            }
                            title1="Чистота техники 82%"
                            icon2={null}
                            title2="Точек роста 2"
                            className="justify-between"
                        />
                    </View>

                    {/* Exercise Name - Bottom Left */}
                    <View className="absolute bottom-4 left-4">
                        <Text className="text-t1 font-bold text-white">
							Отведение ноги назад с опорой на локти
                        </Text>
                    </View>
                </View>

                {/* Feedback Section - Dark Grey Background */}
                <View className="bg-gray-900 px-6 pb-6 pt-6">
                    {/* First Feedback Block */}
                    <View className="mb-6">
                        <Text className="mb-4 text-t2 leading-6 text-light-text-500">
							Во втором подходе бедро поднималось слишком высоко — нагрузка смещалась в
							поясницу
                        </Text>
                        <View className="flex-row items-center rounded-xl bg-gray-800 px-4 py-3">
                            <MaterialCommunityIcons name="check-circle" size={20} color="#AAEC4D" />
                            <Text className="ml-3 flex-1 text-t3 text-white">
								Держи таз неподвижно, концентрируйся на движении бедра
                            </Text>
                        </View>
                    </View>

                    {/* Second Feedback Block */}
                    <View>
                        <Text className="mb-4 text-t2 leading-6 text-white">
							В конце движения не было короткой паузы — мышцы не успевали зафиксироваться
                        </Text>
                        <View className="mb-3 flex-row items-center rounded-xl bg-gray-800 px-4 py-3">
                            <MaterialCommunityIcons name="check-circle" size={20} color="#AAEC4D" />
                            <Text className="ml-3 flex-1 text-t3 text-white">
								Добавь короткую паузу (1 секунда) в верхней точке
                            </Text>
                        </View>
                        <View className="flex-row items-center rounded-xl bg-gray-800 px-4 py-3">
                            <MaterialCommunityIcons name="check-circle" size={20} color="#AAEC4D" />
                            <Text className="ml-3 flex-1 text-t3 text-white">
								Сделай пробную серию перед зеркалом или стеной — поможет стабилизировать
								корпус
                            </Text>
                        </View>
                    </View>
                </View>

                <View className="flex-row gap-2 py-2 pb-20">
                    <Button
                        iconLeft={<Ionicons name="chevron-back" size={24} color="#FFFFFF" />}
                        variant="tertiary"
                        onPress={handleGoToReportPage}
                        className="flex-1"
                    >
						К отчёту
                    </Button>
                    <Button variant="tertiary" onPress={handleFinish} className="flex-1">
						Закрыть
                    </Button>
                </View>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    gradientContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
    },
})
