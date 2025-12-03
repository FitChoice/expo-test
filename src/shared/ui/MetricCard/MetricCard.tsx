import React from 'react'
import { View, Text } from 'react-native'

interface MetricCardProps {
	icon: React.ReactElement
	displayNumber: number
	title: string
	description: string
}

export const MetricCard: React.FC<MetricCardProps> = ({
    icon,
    displayNumber,
    title,
    description,
}) => {
    return (
        <View className="rounded-3xl p-4 bg-white/20 h-full flex-1">
            {/* Icon in top right corner */}
            <View className="justify-end items-end">
                <View className="h-12 w-12 items-center justify-center rounded-full bg-brand-green-500/30">
                    <View className="items-center justify-center">
                        {icon}
                    </View>
                </View>
            </View>

            {/* Content */}
            <View className="justify-center items-center px-6 py-8 flex-1">
                {/* Number and Title */}
                <View className="items-center justify-center ">
                    <Text className="font-rimma text-[50px] leading-[72px] text-light-text-100">
                        {displayNumber}
                    </Text>
                    <Text className="text-t2 text-light-text-100 mt-1">
                        {title}
                    </Text>
                </View>

                {/* Description */}
                <Text className="text-t4 text-light-text-200 text-center mt-4">
                    {description}
                </Text>
            </View>
        </View>
    )
}
