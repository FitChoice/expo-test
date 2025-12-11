import React from 'react'
import { View, Text } from 'react-native'
import type { ExerciseInfoCardProps } from './types'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'

/**
 * ExerciseInfoCard - компонент для отображения информации об упражнении
 * Показывает название, количество подходов, повторений и опционально тег AI-анализа
 */
export const ExerciseInfoCard: React.FC<ExerciseInfoCardProps> = ({ exercise }) => {
    const { progress, name, sets, reps, is_ai } = exercise

    return (
        <View className={'mb-2'}>
            <View className="flex-row">
                <View className="mr-6 items-center justify-center rounded-b-xl rounded-t-xl bg-fill-700 p-2">
                    <MaterialIcons name="sports-gymnastics" size={40} color="#8BC34A" />
                </View>

                <View className="flex-1">
                    <View className="flex-row items-center gap-3">
										 <Text className="mb-4 text-pretty text-t2-bold text-white">{name}</Text>
										 { !!progress && <View className="rounded-full bg-brand-green-500 h-5 w-5">
											 <FontAwesome6 name="check" size={4} color="black" />
										 </View>}
									 </View>

                    {/* Теги */}
                    <View className="flex-row gap-6">
                        {/* Тег подходов */}
                        <View className="rounded-full bg-gray-600/50 px-3 py-1.5">
                            <Text className="text-t4 text-white">{sets} подходы</Text>
                        </View>

                        {/* Тег повторений */}
                        <View className="rounded-full bg-gray-600/50 px-3 py-1.5">
                            <Text className="text-t4 text-white">{reps} повторения</Text>
                        </View>

                        {/* Тег AI-анализа (опционально) */}
                        <View
                            className={`rounded-full px-3 py-1.5 ${is_ai ? 'border border-brand-purple-500 bg-brand-purple-900/20' : 'opacity-0'}`}
                        >
                            <Text
                                className={`text-t4 ${is_ai ? 'text-brand-purple-500' : 'text-transparent'}`}
                            >
								AI-анализ
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    )
}
