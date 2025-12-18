/**
 * ConfirmModal - модальное окно подтверждения действия
 * Используется для удаления аккаунта, выхода и других подтверждений
 */

import React from 'react'
import { View, Text, Modal as RNModal, StyleSheet, Platform } from 'react-native'
import { BlurView } from 'expo-blur'
import { Button } from '../Button'
import type { ConfirmModalProps } from './types'

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
	visible,
	title,
	subtitle,
	confirmText,
	cancelText,
	confirmVariant = 'primary',
	onConfirm,
	onCancel,
	isLoading = false,
}) => {
	return (
		<RNModal visible={visible} transparent animationType="fade">
			<View className="flex-1 items-center justify-center">
				{/* Blurred background */}
				<BlurView
					intensity={52}
					tint="dark"
					style={StyleSheet.absoluteFill}
					experimentalBlurMethod={
						Platform.OS === 'android' ? 'dimezisBlurView' : undefined
					}
					blurReductionFactor={Platform.OS === 'android' ? 4 : undefined}
				/>

				{/* Content card */}
				<View className="bg-dark-500 mx-6 w-full max-w-sm rounded-2xl p-6">
					<Text className="mb-2 text-center font-rimma text-2xl text-white">{title}</Text>

					{subtitle && (
						<Text className="mb-6 text-center text-t2 text-light-text-500">
							{subtitle}
						</Text>
					)}

					<View className="flex-row gap-1">
						<View className="flex-1">
							<Button
								variant="tertiary"
								size="l"
								fullWidth
								onPress={onCancel}
								disabled={isLoading}
							>
								{cancelText}
							</Button>
						</View>
						<View className="flex-1">
							<Button
								variant={confirmVariant === 'danger' ? 'tertiary' : 'primary'}
								size="l"
								fullWidth
								onPress={onConfirm}
								disabled={isLoading}
							>
								{isLoading ? 'Загрузка...' : confirmText}
							</Button>
						</View>
					</View>
				</View>
			</View>
		</RNModal>
	)
}
