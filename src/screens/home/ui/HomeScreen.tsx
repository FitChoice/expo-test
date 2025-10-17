import { View, Text, ScrollView, Platform } from 'react-native'
import { useState } from 'react'
import { useRouter } from 'expo-router'
import { Header } from '@/widgets/header'
import { Footer } from '@/widgets/footer'
import { Icon, Button, Input, AuthGuard } from '@/shared/ui'

/**
 * Home screen - main page with pose detection camera
 */
export const HomeScreen = () => {
	return (
		<AuthGuard>
			<View className="flex flex-1">
				<Header />
				{Platform.OS === 'web' ? <WebContent /> : <MobileContent />}
				<Footer />
			</View>
		</AuthGuard>
	)
}

/**
 * Mobile version with camera
 */
const MobileContent = () => {
	// Динамический импорт для мобильных платформ
	const { PoseCamera } = require('@/widgets/pose-camera')
	return <PoseCamera />
}

/**
 * Web version content (camera not available in browser)
 */
const WebContent = () => {
	const router = useRouter()
	
	return (
		<View className="flex-1 bg-gray-900 items-center justify-center">
			<View className="items-center p-8">
				<Text className="text-white text-2xl font-bold mb-4">
					Fitchoice
				</Text>
				<Text className="text-gray-300 text-lg mb-6 text-center">
					Приложение для фитнеса с детекцией поз
				</Text>
				<Text className="text-gray-400 text-sm text-center mb-8">
					Камера доступна только на мобильных устройствах.{'\n'}
					Для тестирования установите Expo Go и отсканируйте QR-код.
				</Text>
				
				{/* Навигационные кнопки */}
				<View className="space-y-4 w-full max-w-sm">
					<Button 
						variant="primary" 
						size="l"
						iconLeft={<Icon name="camera" />}
						fullWidth
					>
						Открыть в мобильном приложении
					</Button>
					
					<Button 
						variant="secondary" 
						size="l"
						iconLeft={<Icon name="user" />}
						fullWidth
						onPress={() => router.push('/auth')}
					>
						Вход / Регистрация
					</Button>
					
					<Button 
						variant="special" 
						size="l"
						iconLeft={<Icon name="file" />}
						fullWidth
						onPress={() => router.push('/survey')}
					>
						Пройти опрос
					</Button>
				</View>
			</View>
		</View>
	)
}

/**
 * Content section with Button, Icon and Input examples
 */
const Content = () => {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [comment, setComment] = useState('')
	const [selectedWorkout, setSelectedWorkout] = useState('')
	
	return (
		<ScrollView className="flex-1">
			{/* Примеры инпутов из Figma */}
			<View className="p-4 bg-gray-900">
				<Text className="text-2xl font-bold mb-4 text-white">Инпуты из Figma</Text>
				
				{/* Text Input */}
				<Text className="text-lg font-semibold mb-3 text-white">Text Input:</Text>
				<View className="gap-3 mb-6">
					<Input 
						variant="text"
						label="Email"
						value={email}
						onChangeText={setEmail}
						placeholder="example@mail.com"
						leftIcon={<Icon name="user" />}
					/>
					<Input 
						variant="text"
						label="Username"
						placeholder="Введите username"
						helperText="Только латинские буквы и цифры"
						rightIcon={<Icon name="check-circle" />}
					/>
				</View>

				{/* Password Input */}
				<Text className="text-lg font-semibold mb-3 text-white">Password Input:</Text>
				<View className="gap-3 mb-6">
					<Input 
						variant="password"
						label="Пароль"
						value={password}
						onChangeText={setPassword}
						placeholder="Введите пароль"
						forgotPassword
						onForgotPassword={() => console.log('Forgot password')}
					/>
				</View>

				{/* Dropdown */}
				<Text className="text-lg font-semibold mb-3 text-white">Dropdown:</Text>
				<View className="gap-3 mb-6">
					<Input 
						variant="dropdown"
						label="Выберите тренировку"
						value={selectedWorkout}
						dropdownOptions={[
							{ label: 'Кардио', value: 'cardio' },
							{ label: 'Силовая', value: 'strength' },
							{ label: 'Растяжка', value: 'stretching' },
							{ label: 'Йога', value: 'yoga' },
						]}
						onDropdownSelect={setSelectedWorkout}
						leftIcon={<Icon name="barbell" />}
					/>
				</View>

				{/* Textarea */}
				<Text className="text-lg font-semibold mb-3 text-white">Textarea:</Text>
				<View className="gap-3 mb-6">
					<Input 
						variant="textarea"
						label="Комментарий"
						value={comment}
						onChangeText={setComment}
						placeholder="Введите текст..."
						maxLength={500}
					/>
				</View>

				{/* Input states */}
				<Text className="text-lg font-semibold mb-3 text-white">Состояния:</Text>
				<View className="gap-3 mb-6">
					<Input 
						label="Обычный"
						placeholder="Default state"
					/>
					<Input 
						label="С ошибкой"
						value="invalid@email"
						error="Неверный формат email"
					/>
					<Input 
						label="Отключенный"
						disabled
						value="Нельзя редактировать"
					/>
				</View>

				{/* Settings variant */}
				<Text className="text-lg font-semibold mb-3 text-white">Settings (меньший размер):</Text>
				<View className="gap-3 mb-6">
					<Input 
						size="settings"
						label="Настройка"
						placeholder="Value"
						leftIcon={<Icon name="gear-fine" />}
					/>
				</View>
			</View>

			{/* Примеры кнопок из Figma */}
			<View className="p-4 bg-white">
				<Text className="text-2xl font-bold mb-4">Кнопки из Figma</Text>
				
				{/* Варианты кнопок */}
				<Text className="text-lg font-semibold mb-3">Варианты:</Text>
				<View className="gap-3 mb-6">
					<Button variant="primary">Primary Button</Button>
					<Button variant="secondary">Secondary Button</Button>
					<Button variant="special">Special Button</Button>
					<Button variant="tertiary">Tertiary Button</Button>
					<Button variant="ghost">Ghost Button</Button>
				</View>

				{/* Размеры */}
				<Text className="text-lg font-semibold mb-3">Размеры:</Text>
				<View className="gap-3 mb-6">
					<Button size="xs">Extra Small</Button>
					<Button size="s">Small (default)</Button>
					<Button size="l">Large</Button>
				</View>

				{/* С иконками */}
				<Text className="text-lg font-semibold mb-3">С иконками:</Text>
				<View className="gap-3 mb-6">
					<Button 
						variant="primary" 
						iconLeft={<Icon name="fire" />}
					>
						Начать тренировку
					</Button>
					<Button 
						variant="secondary" 
						iconRight={<Icon name="arrow-forward" />}
					>
						Далее
					</Button>
					<Button 
						variant="special"
						size="l"
						iconLeft={<Icon name="lightning" />}
					>
						Премиум подписка
					</Button>
				</View>

				{/* Кнопки только с иконкой */}
				<Text className="text-lg font-semibold mb-3">Только иконки:</Text>
				<View className="flex-row gap-3 mb-6">
					<Button 
						variant="primary"
						size="l"
						iconOnly
						iconLeft={<Icon name="plus" />}
					/>
					<Button 
						variant="secondary"
						size="s"
						iconOnly
						iconLeft={<Icon name="gear-fine" />}
					/>
					<Button 
						variant="ghost"
						size="s"
						iconOnly
						iconLeft={<Icon name="dots-three-vertical" />}
					/>
				</View>

				{/* Состояния */}
				<Text className="text-lg font-semibold mb-3">Состояния:</Text>
				<View className="gap-3 mb-6">
					<Button variant="primary">Обычная</Button>
					<Button variant="primary" disabled>Отключенная</Button>
					<Button variant="special" fullWidth>Полная ширина</Button>
				</View>

				{/* Реальные примеры */}
				<Text className="text-lg font-semibold mb-3">Примеры использования:</Text>
				<View className="gap-3">
					<Button 
						variant="special"
						size="l"
						fullWidth
						iconLeft={<Icon name="workout-cardio" />}
					>
						Кардио тренировка
					</Button>
					<View className="flex-row gap-2">
						<Button 
							variant="ghost"
							iconLeft={<Icon name="arrow-back" />}
						>
							Назад
						</Button>
						<Button 
							variant="primary"
							iconRight={<Icon name="arrow-forward" />}
						>
							Далее
						</Button>
					</View>
				</View>
			</View>
		</ScrollView>
	)
}

