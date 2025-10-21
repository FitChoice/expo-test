import { View, Text, ScrollView, Platform, StyleSheet, TouchableOpacity } from 'react-native'
import { useState } from 'react'
import { useRouter } from 'expo-router'
import { Header } from '@/widgets/header'
import { Footer } from '@/widgets/footer'
import { Icon, Button, Input, AuthGuard, BackgroundLayout } from '@/shared/ui'

/**
 * Home screen - main page according to Figma design
 */
export const HomeScreen = () => {
	return (
		<AuthGuard>
			<BackgroundLayout>
				<View style={styles.container}>
					{Platform.OS === 'web' ? <WebContent /> : <MobileContent />}
				</View>
			</BackgroundLayout>
		</AuthGuard>
	)
}

/**
 * Mobile version according to Figma design
 */
const MobileContent = () => {
	return (
		<ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
			{/* Header with progress */}
			<View style={styles.header}>
				<View style={styles.progressSection}>
					<View style={styles.progressItem}>
						<Icon name="barbell" size={56} color="rgba(255, 255, 255, 0.1)" />
						<Text style={styles.progressText}>1 / 12</Text>
					</View>
					<Text style={styles.monthText}>Месяц 1</Text>
					<View style={styles.progressItem}>
						<Icon name="fire" size={56} color="rgba(255, 255, 255, 0.1)" />
						<Text style={styles.progressText}>40</Text>
					</View>
				</View>
			</View>

			{/* Mini Calendar */}
			<View style={styles.calendarSection}>
				<View style={styles.calendarContainer}>
					{/* Calendar days */}
					<View style={styles.calendarDays}>
						{['8', '10', '11', '12', '13', '14'].map((day, index) => (
							<View key={index} style={styles.calendarDay}>
								<View style={styles.dayCard}>
									<Icon name="barbell" size={16} color="#FFFFFF" />
									<View style={styles.dayInfo}>
										<Text style={styles.dayNumber}>{day}</Text>
										<Text style={styles.dayName}>
											{['пн', 'ср', 'чт', 'пт', 'сб', 'вс'][index]}
										</Text>
									</View>
								</View>
								<View style={styles.dayDot} />
							</View>
						))}
					</View>
				</View>
			</View>

			{/* Main Content Card */}
			<View style={styles.mainCard}>
				<View style={styles.cardHeader}>
					<Text style={styles.dayTitle}>День 1</Text>
					<Text style={styles.dayDescription}>
						Самое время начать{'\n'}Первая тренировка уже ждёт тебя
					</Text>
				</View>

				{/* Action Buttons */}
				<View style={styles.actionButtons}>
					<TouchableOpacity style={styles.actionButton}>
						<View style={styles.buttonContent}>
							<View style={styles.buttonInfo}>
								<Text style={styles.buttonTitle}>Тренировка</Text>
								<View style={styles.buttonTags}>
									<View style={styles.tag}>
										<Icon name="timer" size={16} color="#FFFFFF" />
										<Text style={styles.tagText}>40 минут</Text>
									</View>
									<View style={styles.tag}>
										<Icon name="fire" size={16} color="#FFFFFF" />
										<Text style={styles.tagText}>+20 опыта</Text>
									</View>
								</View>
							</View>
							<View style={styles.buttonIcon}>
								<Icon name="barbell" size={32} color="#A172FF" />
							</View>
						</View>
					</TouchableOpacity>

					<TouchableOpacity style={styles.actionButton}>
						<View style={styles.buttonContent}>
							<View style={styles.buttonInfo}>
								<Text style={styles.buttonTitle}>Дневник</Text>
								<View style={styles.buttonTags}>
									<View style={styles.tag}>
										<Icon name="timer" size={16} color="#FFFFFF" />
										<Text style={styles.tagText}>40 минут</Text>
									</View>
									<View style={styles.tag}>
										<Icon name="fire" size={16} color="#FFFFFF" />
										<Text style={styles.tagText}>+20 опыта</Text>
									</View>
								</View>
							</View>
							<View style={styles.buttonIcon}>
								<Icon name="diary" size={32} color="#A172FF" />
							</View>
						</View>
					</TouchableOpacity>
				</View>

				{/* Progress Tag */}
				<View style={styles.progressTag}>
					<Icon name="check-circle" size={16} color="#FFFFFF" />
					<Text style={styles.progressTagText}>0/2</Text>
				</View>
			</View>
		</ScrollView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#151515',
	},
	scrollView: {
		flex: 1,
	},
	header: {
		paddingTop: 52,
		paddingHorizontal: 14,
	},
	progressSection: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		gap: 94,
	},
	progressItem: {
		width: 56,
		height: 56,
		justifyContent: 'center',
		alignItems: 'center',
		gap: 8,
	},
	progressText: {
		fontFamily: 'Inter',
		fontWeight: '700',
		fontSize: 16,
		lineHeight: 19.2,
		color: '#FFFFFF',
		textAlign: 'center',
	},
	monthText: {
		fontFamily: 'Inter',
		fontWeight: '700',
		fontSize: 16,
		lineHeight: 19.2,
		color: '#FFFFFF',
		textAlign: 'center',
	},
	calendarSection: {
		marginTop: 20,
		paddingHorizontal: 0,
	},
	calendarContainer: {
		height: 120,
		justifyContent: 'center',
	},
	calendarDays: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		gap: 16,
		paddingHorizontal: 49,
	},
	calendarDay: {
		alignItems: 'center',
		gap: 8,
	},
	dayCard: {
		backgroundColor: '#1E1E1E',
		borderRadius: 40,
		paddingVertical: 12,
		paddingHorizontal: 20,
		alignItems: 'center',
		gap: 8,
		minWidth: 60,
	},
	dayInfo: {
		alignItems: 'center',
	},
	dayNumber: {
		fontFamily: 'Inter',
		fontWeight: '500',
		fontSize: 12,
		lineHeight: 15.6,
		color: '#949494',
	},
	dayName: {
		fontFamily: 'Inter',
		fontWeight: '500',
		fontSize: 12,
		lineHeight: 15.6,
		color: '#949494',
	},
	dayDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: '#6E6E6E',
	},
	mainCard: {
		marginTop: 64,
		marginHorizontal: 4,
		backgroundColor: '#1E1E1E',
		borderRadius: 40,
		paddingVertical: 32,
		paddingHorizontal: 8,
		minHeight: 400,
	},
	cardHeader: {
		alignItems: 'center',
		gap: 12,
		marginBottom: 20,
	},
	dayTitle: {
		fontFamily: 'Rimma_sans',
		fontWeight: '700',
		fontSize: 24,
		lineHeight: 31.2,
		color: '#FFFFFF',
		textAlign: 'center',
	},
	dayDescription: {
		fontFamily: 'Inter',
		fontWeight: '400',
		fontSize: 16,
		lineHeight: 19.2,
		color: '#949494',
		textAlign: 'center',
	},
	actionButtons: {
		gap: 4,
		marginBottom: 20,
	},
	actionButton: {
		backgroundColor: '#3F3F3F',
		borderRadius: 64,
		paddingVertical: 8,
		paddingHorizontal: 28,
		paddingLeft: 8,
	},
	buttonContent: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		gap: 60,
	},
	buttonInfo: {
		flex: 1,
		gap: 6,
	},
	buttonTitle: {
		fontFamily: 'Inter',
		fontWeight: '600',
		fontSize: 16,
		lineHeight: 19.2,
		color: '#FFFFFF',
	},
	buttonTags: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
	},
	tag: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		backgroundColor: 'rgba(255, 255, 255, 0.2)',
		borderRadius: 24,
		paddingVertical: 4,
		paddingHorizontal: 8,
	},
	tagText: {
		fontFamily: 'Inter',
		fontWeight: '500',
		fontSize: 12,
		lineHeight: 15.6,
		color: '#FFFFFF',
	},
	buttonIcon: {
		width: 64,
		height: 64,
		backgroundColor: '#A172FF',
		borderRadius: 99,
		justifyContent: 'center',
		alignItems: 'center',
	},
	progressTag: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		backgroundColor: 'rgba(255, 255, 255, 0.2)',
		borderRadius: 24,
		paddingVertical: 4,
		paddingHorizontal: 8,
		alignSelf: 'flex-end',
		marginRight: 24,
	},
	progressTagText: {
		fontFamily: 'Inter',
		fontWeight: '500',
		fontSize: 12,
		lineHeight: 15.6,
		color: '#FFFFFF',
	},
})

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
						Вход
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

