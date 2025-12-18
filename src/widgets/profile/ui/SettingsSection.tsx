/**
 * SettingsSection - секция настроек
 * Контейнер для группы элементов настроек
 */

import React, { type ReactNode } from 'react'
import { View, Text } from 'react-native'

interface SettingsSectionProps {
	title: string
	children: ReactNode
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({ title, children }) => {
	return (
		<View className="bg-dark-500 mb-4 rounded-2xl p-6">
			<Text className="mb-4 text-t1.1 font-medium text-white">{title}</Text>
			{children}
		</View>
	)
}
