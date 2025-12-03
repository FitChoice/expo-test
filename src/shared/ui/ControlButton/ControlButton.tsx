/**
 * ControlButton - кнопка управления с иконкой
 * Используется для паузы, закрытия и других действий управления
 */

import { TouchableOpacity, View, type TouchableOpacityProps } from 'react-native'
import { type ReactNode } from 'react'

export interface ControlButtonProps extends Omit<TouchableOpacityProps, 'children'> {
	/** Элемент иконки (например, из AntDesign, Entypo и т.д.) */
	icon: ReactNode
	/** Размер кнопки (по умолчанию 48px) */
	size?: number
}

export function ControlButton({
    icon,
    size = 48,
    onPress,
    className = '',
    ...props
}: ControlButtonProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            className={`items-center justify-center bg-fill-200/20 rounded-2xl ${className}`}
            style={{ width: size, height: size }}
            activeOpacity={0.7}
            {...props}
        >
            <View>{icon}</View>
        </TouchableOpacity>
    )
}
