import React from 'react'
import { View, Text, ScrollView } from 'react-native'
import { CheckboxSelect } from '@/shared/ui'
import type { Goal } from '@/entities/survey'
import { sharedStyles } from './shared-styles'

import GoalPosture from '@/shared/ui/Icon/assets/posture-purple.svg'
import GoalPainRelief from '@/shared/ui/Icon/assets/pain-relief-purple.svg'
import GoalFlexibility from '@/shared/ui/Icon/assets/flexibility-purple.svg'
import GoalStrength from '@/shared/ui/Icon/assets/strength-purple.svg'
import GoalWeightLoss from '@/shared/ui/Icon/assets/weight-loss-purple.svg'
import GoalStressRelief from '@/shared/ui/Icon/assets/low-stress-purple.svg'
import GoalEnergy from '@/shared/ui/Icon/assets/energy-purple.svg'
import GoalWellness from '@/shared/ui/Icon/assets/welness-purple.svg'

interface SurveyStep10Props {
	goals: Goal[]
	onGoalsChange: (goals: Goal[]) => void
	maxGoals?: number
}

/**
 * Шаг 10: Цели тренировок
 */
export const SurveyStep10: React.FC<SurveyStep10Props> = ({
    goals,
    onGoalsChange,
    maxGoals = 3,
}) => {

    return (
        <>
            <View className="gap-4 bg-transparent">
                <Text style={sharedStyles.title}>Для чего вы тренируетесь?</Text>
                <Text className="font-inter text-left text-base font-normal leading-[19.2px] text-white">
					Выберите до {maxGoals}-х целей
                </Text>
            </View>
            <ScrollView 
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
                bounces={false}
                style={{ maxHeight: 450 }}
            >
                <CheckboxSelect
                    isNeedCheckbox={true}
                    options={[
                        { value: 'posture', label: 'Улучшить осанку', icon: <GoalPosture /> },
                        { value: 'pain_relief', label: 'Избавиться от боли',  icon: <GoalPainRelief />  },
                        { value: 'flexibility', label: 'Повысить гибкость',  icon: <GoalFlexibility />  },
                        { value: 'strength', label: 'Укрепить тело и мышцы',  icon: <GoalStrength />  },
                        { value: 'weight_loss', label: 'Сбросить вес и подтянуть фигуру',  icon: <GoalWeightLoss />  },
                        { value: 'stress_relief', label: 'Снизить стресс и напряжение',  icon: <GoalStressRelief />  },
                        { value: 'energy', label: 'Повысить уровень энергии',  icon: <GoalEnergy />  },
                        { value: 'wellness', label: 'Улучшить общее самочувствие',  icon: <GoalWellness />  },
                    ]}
                    value={goals}
                    onChange={(value) => onGoalsChange(value as Goal[])}
                    size="full"
                    maxSelected={maxGoals}
                />
            </ScrollView>
        </>
    )
}
