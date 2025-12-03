/**
 * InfoTag - небольшой тег для отображения мета-информации
 * Используется для длительности, опыта, категории и т.д.
 */

import { View, Text, type ViewProps } from 'react-native'
import { Icon } from '../Icon'
import type { IconName } from '../Icon/types'

export interface InfoTagProps extends ViewProps {
	/** Текст тега */
	label: string
	/** Иконка (опционально) */
	icon?: IconName
	/** Вариант отображения */
	variant?: 'default' | 'accent' | 'success'
}

export function InfoTag({
    label,
    icon,
    variant = 'default',
    className,
    ...props
}: InfoTagProps) {
    const variantStyles = {
        default: 'bg-brand-dark-200 border-brand-dark-300',
        accent: 'bg-brand-purple-500/10 border-brand-purple-500/20',
        success: 'bg-brand-green-500/10 border-brand-green-500/20',
    }

    const textStyles = {
        default: 'text-text-secondary',
        accent: 'text-brand-purple-500',
        success: 'text-brand-green-500',
    }

    return (
        <View
            {...props}
            className={`flex-row items-center gap-1 rounded-full border px-3 py-1.5 ${variantStyles[variant]} ${className || ''}`}
        >
            {icon && (
                <Icon
                    name={icon}
                    size={14}
                    color={
                        variant === 'default'
                            ? '#9CA3AF'
                            : variant === 'accent'
                                ? '#9333EA'
                                : '#10B981'
                    }
                />
            )}
            <Text className={`text-caption-medium ${textStyles[variant]}`}>{label}</Text>
        </View>
    )
}
