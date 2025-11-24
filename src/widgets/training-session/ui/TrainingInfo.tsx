import {
    View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Dimensions,
} from 'react-native'
import { router } from 'expo-router'
import { Switch, TrainingTags, ExerciseInfoCard,
} from '@/shared/ui'
import { useTrainingStore } from '@/entities/training'
import React, { useState, useMemo } from 'react'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import Entypo from '@expo/vector-icons/Entypo'
import { BottomActionBtn } from '@/shared/ui/BottomActionBtn/BottomActionBtn'
import { GradientBg } from '@/shared/ui/GradientBG'
const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('screen')

// eslint-disable-next-line @typescript-eslint/no-require-imports
const trainingInfoBanner = require('@/assets/images/training_info_banner.png')

// Динамический импорт картинок оборудования
const equipmentImages = [
    require('@/assets/images/equipment/1.png'),
    require('@/assets/images/equipment/2.png'),
    require('@/assets/images/equipment/3.png'),
    require('@/assets/images/equipment/4.png'),
    require('@/assets/images/equipment/5.png'),
    require('@/assets/images/equipment/6.png'),
    require('@/assets/images/equipment/7.png'),
    require('@/assets/images/equipment/8.png'),
    require('@/assets/images/equipment/9.png'),
    require('@/assets/images/equipment/10.png'),
    require('@/assets/images/equipment/11.png'),
]

export const TrainingInfo = () => {

    const training = useTrainingStore((state) => state.training)
    const startOnboarding = useTrainingStore((state) => state.startOnboarding)
    const [showTutorial, setShowTutorial] = useState(true)

    // Calculate training duration in minutes
    const trainingDuration = useMemo(() => {
        if (!training?.exercises) return 40
        let totalSeconds = 0
        training.exercises.forEach((exercise) => {
            // Duration per set * number of sets + rest time between sets
            const exerciseTime = exercise.duration * exercise.sets
            const restTime = exercise.rest_time * Math.max(0, exercise.sets - 1)
            totalSeconds += exerciseTime + restTime
        })
        return Math.ceil(totalSeconds / 60)
    }, [training])

    const experienceGained = training?.experience || 0

    const handleClose = () => {
        router.back()
    }

    const handleStart = () => {
        startOnboarding()
    }

    return (   <View   className="flex-1" >
        <View style={styles.gradientContainer}>
            <GradientBg />
        </View>
        <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}>
            {/* Banner Image with Close Button */}
            <View className="relative">
                <Image
                    source={trainingInfoBanner}
                    className="w-full"
                    resizeMode="cover"
                />
                {/* Close Button - Top Right */}
                <TouchableOpacity
                    onPress={handleClose}
                    className="absolute right-4 top-10 h-12 w-12 items-center justify-center rounded-2xl bg-white/30">
                    <Entypo name="cross" size={24} color="white" />
                </TouchableOpacity>
            </View>

            {/* Black Block with Text */}
            <View style={{ marginTop: -180 }}>
                {/* Tags */}
                <View className="bg-black px-6 pt-6 pb-6 mb-2 rounded-3xl">
                    <TrainingTags
                        icon1={<MaterialCommunityIcons name="clock-time-eight" size={16} color="#FFFFFF" />}
                        title1={`${trainingDuration} минут`}
                        icon2={<MaterialCommunityIcons name="bow-arrow" size={16} color="#FFFFFF" />}
                        title2={`+${experienceGained} опыта`}
                        className="mb-4"
                    />

                    <Text className="text-h2 text-white mb-4">
                        {training?.title || 'Подвижность верхнего отдела позвоночника'}
                    </Text>
                    <Text className="text-t2 text-light-text-500 leading-6 mb-6">

                        {
                            training?.description || 'Сделай тест и узнай свой уровень. Камера зафиксирует движения, а ИИ подскажет ошибки и подсчитает повторения. В конце ты получишь свой стартовый уровень и персональные рекомендации для тренировок. Всего несколько минут — и ты готов начать!'
                        }
                    </Text>

                    {/* Switch Section */}
                    <View className="flex-row items-center justify-between">
                        <Text className="text-t3 text-white">
							Обучение перед упражнением
                        </Text>
                        <Switch
                            checked={showTutorial}
                            onChange={setShowTutorial}
                        />
                    </View>
                </View>
            </View>

            {/* Equipment Section */}
            <View className="bg-black px-6 pt-6 pb-6 rounded-3xl mb-2 ">
                <Text className="text-t1.1 text-white mb-4">
						Инвентарь
                </Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 16 }}
                >
                    {training?.inventory.map((image, index) => (
                        <Image
                            key={index}
                            source={equipmentImages[image]}
                            className="w-16 h-16"
                            resizeMode="contain"
                        />
                    ))}
                </ScrollView>
            </View>

            <View className="bg-black px-6 pt-6 pb-20 rounded-3xl">
                <Text className="text-t1.1 text-white mb-4">
									3 упражнения
                </Text>

                {training?.exercises.map((exercise) => (
                    <ExerciseInfoCard key={exercise.id} exercise={exercise}/>))}

            </View>
        </ScrollView>

        {/* Start Button - Fixed at Bottom */}
				
        <BottomActionBtn  handleClickBottomBtn={handleStart} title={'Начать'}  />
  
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
