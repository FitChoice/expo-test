import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Icon } from '@/shared/ui'

/**
 * Bottom navigation bar widget
 * Displays main navigation icons at the bottom of the screen
 */
export const NavigationBar = () => {
	const insets = useSafeAreaInsets()
	const router = useRouter()

	return (
		<View
			style={[
				styles.container,
				{
					paddingBottom: insets.bottom + 8,
				},
			]}
		>
			<View style={styles.navContent}>
				<TouchableOpacity
					style={styles.navButton}
					onPress={() => router.push('/home')}
					accessibilityRole="button"
					accessibilityLabel="Главная"
				>
					<View style={styles.activeButton}>
						<Icon name="house" size={32} color="#1E1E1E" />
					</View>
				</TouchableOpacity>

				<TouchableOpacity
					style={styles.navButton}
					onPress={() => {
						// TODO: Add chat navigation
					}}
					accessibilityRole="button"
					accessibilityLabel="Чат"
				>
					<Icon name="dots-three-vertical" size={32} color="#FFFFFF" />
				</TouchableOpacity>

				<TouchableOpacity
					style={styles.navButton}
					onPress={() => {
						// TODO: Add logout/profile navigation
					}}
					accessibilityRole="button"
					accessibilityLabel="Выход"
				>
					<Icon name="sign-out" size={32} color="#FFFFFF" />
				</TouchableOpacity>

				<TouchableOpacity
					style={styles.navButton}
					onPress={() => {
						// TODO: Add profile navigation
					}}
					accessibilityRole="button"
					accessibilityLabel="Профиль"
				>
					<Icon name="user-circle" size={32} color="#FFFFFF" />
				</TouchableOpacity>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		paddingHorizontal: 20,
		paddingTop: 12,
	},
	navContent: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: '#3F3F3F',
		borderRadius: 99,
		paddingHorizontal: 20,
		paddingVertical: 12,
		gap: 20,
	},
	navButton: {
		width: 56,
		height: 56,
		borderRadius: 99,
		justifyContent: 'center',
		alignItems: 'center',
	},
	activeButton: {
		width: 56,
		height: 56,
		backgroundColor: '#FFFFFF',
		borderRadius: 99,
		justifyContent: 'center',
		alignItems: 'center',
	},
})
