/**
 * FAQAccordion - аккордеон для FAQ
 * Отображает список вопросов с возможностью раскрытия ответов
 */

import React, { useState } from 'react'
import { View, Text, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native'
import { Icon } from '@/shared/ui'
import type { FAQItem } from '@/shared/constants/profile'

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true)
}

interface FAQAccordionProps {
	items: FAQItem[]
}

export const FAQAccordion: React.FC<FAQAccordionProps> = ({ items }) => {
    const [expandedIds, setExpandedIds] = useState<string[]>([])

    const toggleItem = (id: string) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
        setExpandedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        )
    }

    return (
        <View>
            {items.map((item, index) => {
                const isExpanded = expandedIds.includes(item.id)
                const isLast = index === items.length - 1

                return (
                    <View key={item.id}>
                        <TouchableOpacity
                            onPress={() => toggleItem(item.id)}
                            className="flex-row items-center justify-between py-3"
                            activeOpacity={0.7}
                        >
                            <Text className="flex-1 pr-4 text-t2 text-white">
                                {item.question}
                            </Text>
                            <Icon
                                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                                size={20}
                                color="#FFFFFF"
                            />
                        </TouchableOpacity>

                        {isExpanded && (
                            <Text className="pb-3 text-t2 leading-6 text-light-text-200">
                                {item.answer}
                            </Text>
                        )}

                        {!isLast && <View className="h-px bg-fill-800" />}
                    </View>
                )
            })}
        </View>
    )
}
