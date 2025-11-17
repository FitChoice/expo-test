import React from 'react'
import { View, Text } from 'react-native'
import type { ExerciseInfoCardProps } from './types'
import MaterialIcons from '@expo/vector-icons/MaterialIcons';


/**
 * ExerciseInfoCard - компонент для отображения информации об упражнении
 * Показывает название, количество подходов, повторений и опционально тег AI-анализа
 */
export const ExerciseInfoCard: React.FC<ExerciseInfoCardProps> = ({
	name,
	sets,
	reps,
	isAi = false,
	className,
	...props
}) => {
	return (
		<View className={`${className || ''} mb-2`} {...props}>

            <View  className="flex-row justify-between">

                

<View className="bg-fill-700 p-2 rounded-t-xl rounded-b-xl w-20 h-20 items-center justify-center">
<MaterialIcons name="sports-gymnastics" size={24} color="#8BC34A" />
</View>
           
<View>

<Text className="text-white text-h2-medium mb-4">
				{name}
			</Text>

			{/* Теги */}
			<View className="flex-row gap-2 flex-wrap">
				{/* Тег подходов */}
				<View className="bg-gray-800/50 rounded-full px-3 py-1.5">
					<Text className="text-white text-t4">
						{sets}
					</Text>
				</View>

				{/* Тег повторений */}
				<View className="bg-gray-800/50 rounded-full px-3 py-1.5">
					<Text className="text-white text-t4">
						{reps}
					</Text>
				</View>

				{/* Тег AI-анализа (опционально) */}
				{isAi ? (
					<View className="bg-brand-purple-900/20 border border-brand-purple-500 rounded-full px-3 py-1.5">
						<Text className="text-white text-t4">
							AI-анализ
						</Text>
					</View>
				) : <View className='w-20' /> }
			</View>
</View>


            </View>
			{/* Название упражнения */}
		
		</View>
	)
}

