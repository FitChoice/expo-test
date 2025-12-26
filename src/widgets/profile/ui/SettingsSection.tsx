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
		<View>
			<Text className="mb-4 pl-3 text-t1.1 font-medium text-white">{title}</Text>
			<View className=" mb-4 rounded-3xl p-6 bg-bg-dark-500">
				{children}
			</View>

		</View>
	)
}
