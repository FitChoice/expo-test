import React from 'react'
import { View, Text } from 'react-native'
import { Icon, Input } from '@/shared/ui'
import { sharedStyles } from './shared-styles'

interface SurveyStep4Props {
	height: number | null
	weight: number | null
	onHeightChange: (height: number | null) => void
	onWeightChange: (weight: number | null) => void
}

/**
 * Шаг 4: Ввод параметров (рост и вес)
 */
export const SurveyStep4: React.FC<SurveyStep4Props> = ({
    height,
    weight,
    onHeightChange,
    onWeightChange,
}) => {
    return (
        <>
            <Text style={sharedStyles.title}>параметры</Text>
            <View className="gap-6 bg-transparent">
                <Input
                    label="Рост"
                    placeholder="В сантиметрах"
                    value={height?.toString() || ''}
                    onChangeText={(text) => onHeightChange(text ? parseFloat(text) : null)}
                    variant="text"
                    size="default"
                    keyboardType="numeric"
                    leftIcon={<Icon name="ruler" size={16} color="#FFFFFF" />}
                />
                <Input
                    label="Вес"
                    placeholder="В килограммах"
                    value={weight?.toString() || ''}
                    onChangeText={(text) => onWeightChange(text ? parseFloat(text) : null)}
                    variant="text"
                    size="default"
                    keyboardType="numeric"
                    leftIcon={<Icon name="barbell" size={16} color="#FFFFFF" />}
                />
            </View>
        </>
    )
}
