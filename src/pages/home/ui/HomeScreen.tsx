import {
	View,
	Text,
	ScrollView,
	Platform,
	StyleSheet,
	TouchableOpacity,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Icon, Button, AuthGuard, BackgroundLayout } from '@/shared/ui'
import { NavigationBar } from '@/widgets/navigation-bar'

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
	const insets = useSafeAreaInsets()

	return (
		<View style={styles.container}>
			<ScrollView
				style={styles.scrollView}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: 120 }}
			>
				{/* Header with progress */}
				<View style={[styles.header, { paddingTop: insets.top + 14 }]}>
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
					{/* Progress Tag - moved to top */}
					<View style={styles.progressTag}>
						<Icon name="check-circle" size={16} color="#FFFFFF" />
						<Text style={styles.progressTagText}>0/2</Text>
					</View>

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
				</View>
			</ScrollView>

			{/* Navigation Bar */}
			<NavigationBar />
		</View>
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
		marginHorizontal: 14,
		backgroundColor: '#1E1E1E',
		borderRadius: 40,
		paddingVertical: 32,
		paddingHorizontal: 20,
		minHeight: 400,
	},
	cardHeader: {
		alignItems: 'center',
		gap: 12,
		marginBottom: 24,
		marginTop: 8,
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
		gap: 8,
		marginBottom: 20,
	},
	actionButton: {
		backgroundColor: '#3F3F3F',
		borderRadius: 64,
		paddingVertical: 8,
		paddingHorizontal: 8,
	},
	buttonContent: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		gap: 12,
	},
	buttonInfo: {
		flex: 1,
		gap: 6,
		paddingLeft: 20,
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
		marginRight: 8,
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
		<View className="flex-1 items-center justify-center bg-gray-900">
			<View className="items-center p-8">
				<Text className="mb-4 text-2xl font-bold text-white">Fitchoice</Text>
				<Text className="mb-6 text-center text-lg text-gray-300">
					Приложение для фитнеса с детекцией поз
				</Text>
				<Text className="mb-8 text-center text-sm text-gray-400">
					Камера доступна только на мобильных устройствах.{'\n'}
					Для тестирования установите Expo Go и отсканируйте QR-код.
				</Text>

				{/* Навигационные кнопки */}
				<View className="w-full max-w-sm space-y-4">
					<Button variant="primary" size="l" iconLeft={<Icon name="camera" />} fullWidth>
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
