/**
 * Pause Modal (5.9)
 * Модальное окно паузы
 * Показывается при нажатии на кнопку паузы
 */

import { View, Text, Modal as RNModal } from 'react-native'
import { Button } from '@/shared/ui'

interface PauseModalProps {
	visible: boolean
	onResume: () => void
	onStop: () => void
}

export function PauseModal({ visible, onResume, onStop }: PauseModalProps) {
	return (
		<RNModal visible={visible} transparent animationType="fade">
			<View className="flex-1 items-center justify-center bg-black/80 px-6">
				{/* Content */}
				<View className="bg-brand-dark-400 w-full max-w-md rounded-3xl p-6">
					{/* Title */}
					<Text className="text-h3-medium text-text-primary mb-3 text-center">
						Примите исходное положение
					</Text>

					{/* Description */}
					<Text className="text-body-regular text-text-secondary mb-6 text-center">
						Встаньте так, чтобы ваше тело полностью помещалось в видоискатель, и нажмите
						кнопку "Продолжить".
					</Text>

					{/* Actions */}
					<View className="gap-3">
						<Button onPress={onResume} variant="primary" className="w-full">
							Продолжить
						</Button>
						<Button onPress={onStop} variant="secondary" className="w-full">
							Завершить тренировку
						</Button>
					</View>
				</View>
			</View>
		</RNModal>
	)
}
