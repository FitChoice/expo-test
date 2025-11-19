import React from 'react'
import { View, Text } from 'react-native'
import type { ExerciseInfoCardProps } from './types'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'

/**
 * ExerciseInfoCard - компонент для отображения информации об упражнении
 * Показывает название, количество подходов, повторений и опционально тег AI-анализа
 */
export const ExerciseInfoCard: React.FC<ExerciseInfoCardProps> = ({
    exercise
}) => {

    const { name, sets, reps, isAi } = exercise

    return (
        <View className={'mb-2'} >

            <View  className="flex-row justify-between">

                <View className="bg-fill-700 p-2 rounded-t-xl rounded-b-xl items-center justify-center">
                    <MaterialIcons name="sports-gymnastics" size={40} color="#8BC34A" />
                </View>
           
                <View>

                    <Text className="text-white text-t2 mb-4">
                        {name}
                    </Text>

                    {/* Теги */}
                    <View className="flex-row gap-6">
                        {/* Тег подходов */}
                        <View className="bg-gray-600/50 rounded-full px-3 py-1.5">
                            <Text className="text-white text-t4">
                                {sets} сеты
                            </Text>
                        </View>

                        {/* Тег повторений */}
                        <View className="bg-gray-600/50 rounded-full px-3 py-1.5">
                            <Text className="text-white text-t4">
                                {reps} повторения
                            </Text>
                        </View>

                        {/* Тег AI-анализа (опционально) */}
                        <View className={`rounded-full px-3 py-1.5 ${isAi ? 'bg-brand-purple-900/20 border border-brand-purple-500' : 'opacity-0'}`}>
                            <Text className={`text-t4 ${isAi ? 'text-brand-purple-500' : 'text-transparent'}`}>
						AI-анализ
                            </Text>
                        </View>
                    </View>
                </View>

            </View>
            {/* Название упражнения */}
		
        </View>
    )
}
