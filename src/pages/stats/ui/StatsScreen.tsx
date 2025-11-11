import React from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BackgroundLayout, BackButton, StatCard } from '@/shared/ui'

/**
 * Stats screen - Экран статистики пользователя
 */
export const StatsScreen = () => {
	const router = useRouter()
	const insets = useSafeAreaInsets()

	return (
		<BackgroundLayout>
			<View style={[styles.container, { paddingTop: insets.top }]}>
				<View style={styles.header}>
					<BackButton onPress={() => router.back()} />
					<Text style={styles.headerTitle}>Статистика</Text>
					<View style={{ width: 40 }} />
				</View>

				<ScrollView
					style={styles.scrollView}
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{ paddingBottom: 40 }}
				>
					<View style={styles.content}>
						{/* Общая статистика */}
						<View style={styles.section}>
							<Text style={styles.sectionTitle}>Общая статистика</Text>
							<View style={styles.statsGrid}>
								<StatCard
									title="Тренировки"
									value="0"
									subtitle="всего"
									iconName="barbell"
								/>
								<StatCard
									title="Опыт"
									value="20"
									subtitle="баллов"
									iconName="lightning"
								/>
								<StatCard
									title="Дни подряд"
									value="0"
									subtitle="текущая серия"
									iconName="fire"
								/>
								<StatCard
									title="Время"
									value="0"
									subtitle="минут"
									iconName="timer"
								/>
							</View>
						</View>

						{/* Прогресс */}
						<View style={styles.section}>
							<Text style={styles.sectionTitle}>Ваш прогресс</Text>
							<View style={styles.progressCard}>
								<Text style={styles.progressText}>
									Вы только начинаете свой путь к здоровью!
								</Text>
								<Text style={styles.progressSubtext}>
									Начните первую тренировку, чтобы отслеживать свой прогресс
								</Text>
							</View>
						</View>
					</View>
				</ScrollView>
			</View>
		</BackgroundLayout>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 20,
		paddingVertical: 16,
	},
	headerTitle: {
		fontFamily: 'Rimma_sans',
		fontSize: 20,
		fontWeight: '700',
		color: '#FFFFFF',
	},
	scrollView: {
		flex: 1,
	},
	content: {
		paddingHorizontal: 20,
	},
	section: {
		marginBottom: 32,
	},
	sectionTitle: {
		fontFamily: 'Inter',
		fontSize: 18,
		fontWeight: '600',
		color: '#FFFFFF',
		marginBottom: 16,
	},
	statsGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 12,
	},
	progressCard: {
		backgroundColor: '#1E1E1E',
		borderRadius: 24,
		padding: 24,
		gap: 12,
	},
	progressText: {
		fontFamily: 'Inter',
		fontSize: 16,
		fontWeight: '600',
		color: '#FFFFFF',
	},
	progressSubtext: {
		fontFamily: 'Inter',
		fontSize: 14,
		color: '#949494',
		lineHeight: 20,
	},
})

