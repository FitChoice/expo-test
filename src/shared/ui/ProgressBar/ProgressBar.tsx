/**
 * ProgressBar - индикатор прогресса
 * Используется для отображения опыта в профиле
 */

import React from 'react'
import { View } from 'react-native'
import type { ProgressBarProps } from './types'

export const ProgressBar: React.FC<ProgressBarProps> = ({
    progress,
    height = 8,
    trackColor = '#3F3F3F',
    fillColor = '#C5F680',
}) => {
    const clampedProgress = Math.min(Math.max(progress, 0), 1)

    return (
        <View
            style={{
                height,
                backgroundColor: trackColor,
                borderRadius: height,
                overflow: 'hidden',
            }}
        >
            <View
                style={{
                    width: `${clampedProgress * 100}%`,
                    height: '100%',
                    backgroundColor: fillColor,
                    borderRadius: height,
                }}
            />
        </View>
    )
}
