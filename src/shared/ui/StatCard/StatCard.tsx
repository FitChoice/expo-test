/**
 * StatCard Component
 * Отображает одну статистику с иконкой, значением и подписью
 */

import { View, Text } from 'react-native'
import { Icon } from '@/shared/ui'
import type { IconName } from '@/shared/ui/Icon/types'

interface StatCardProps {
	icon: IconName
	value: string | number
	label: string
	size?: 'small' | 'medium' | 'large'
}

export function StatCard({ icon, value, label, size = 'medium' }: StatCardProps) {
	const sizeStyles = {
		small: 'p-3',
		medium: 'p-4',
		large: 'p-6',
	}

	const valueStyles = {
		small: 'text-h3-medium',
		medium: 'text-h2-medium',
		large: 'text-h1-medium',
	}

	return (
		<View className={`bg-brand-dark-300 rounded-2xl ${sizeStyles[size]}`}>
			<View className="mb-2 flex-row items-center gap-2">
				<Icon name={icon} size={20} color="#C5F680" />
				<Text className="text-caption-regular text-text-secondary">{label}</Text>
			</View>
			<Text className={`${valueStyles[size]} text-text-primary`}>{value}</Text>
		</View>
	)
}
