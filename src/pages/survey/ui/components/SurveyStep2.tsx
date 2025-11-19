import React from 'react'
import { View, Text } from 'react-native'
import { Icon, RadioSelect } from '@/shared/ui'
import type { Gender } from '@/entities/survey'
import { sharedStyles } from './shared-styles'

interface SurveyStep2Props {
	gender: Gender | null
	onGenderChange: (gender: Gender) => void
}

/**
 * Шаг 2: Выбор пола
 */
export const SurveyStep2: React.FC<SurveyStep2Props> = ({ gender, onGenderChange }) => {
    return (
        <>
            <Text style={sharedStyles.title}>ваш пол</Text>
            <View className="bg-transparent">
                <RadioSelect
                    isNeedCheckbox={false}
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
