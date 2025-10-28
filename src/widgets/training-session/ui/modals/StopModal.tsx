/**
 * Stop Modal (5.10)
 * Модальное окно подтверждения остановки тренировки
 * Показывается при нажатии на кнопку закрытия
 */

import { View, Text, Modal as RNModal } from 'react-native'
import { Button } from '@/shared/ui'

interface StopModalProps {
	visible: boolean
	onConfirm: () => void
	onCancel: () => void
}

export function StopModal({ visible, onConfirm, onCancel }: StopModalProps) {
	return (
		<RNModal visible={visible} transparent animationType="fade">
			<View className="flex-1 items-center justify-center bg-black/80 px-6">
				{/* Content */}
				<View className="bg-brand-dark-400 w-full max-w-md rounded-3xl p-6">
					{/* Title */}
					<Text className="text-h3-medium text-text-primary mb-3 text-center">
						Завершить тренировку?
					</Text>

					{/* Description */}
					<Text className="text-body-regular text-text-secondary mb-6 text-center">
						Прогресс будет сохранен. Вы сможете продолжить тренировку позже.
					</Text>

					{/* Actions */}
					<View className="gap-3">
						<Button onPress={onConfirm} variant="secondary" className="w-full">
							Да, завершить
						</Button>
						<Button onPress={onCancel} variant="primary" className="w-full">
							Продолжить тренировку
						</Button>
					</View>
				</View>
			</View>
		</RNModal>
	)
}
