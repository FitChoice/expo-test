import React from 'react'
import { View, Text } from 'react-native'
import { RadioSelect, Icon } from '@/shared/ui'
import type { Gender } from '@/entities/survey'

interface GenderStepProps {
	gender: Gender | null
	onGenderChange: (gender: Gender) => void
}

export const GenderStep: React.FC<GenderStepProps> = ({ gender, onGenderChange }) => {
    return (
        <>
            <Text className="mb-8 w-full text-left text-[32px] font-bold text-white">
				ваш пол
            </Text>
            <View className="w-full">
                <RadioSelect
                    options={[
                        {
                            value: 'male',
                            label: 'Мужчина',
                            icon: <Icon name="gender-male" size={40} color="#FFFFFF" />,
                        },
                        {
                            value: 'female',
                            label: 'Женщина',
                            icon: <Icon name="gender-female" size={40} color="#FFFFFF" />,
                        },
                    ]}
                    value={gender || ''}
                    onChange={(value) => onGenderChange(value as Gender)}
                />
            </View>
        </>
    )
}
