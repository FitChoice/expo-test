import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter, usePathname } from 'expo-router'
import { useNavbarLayout } from '@/shared/lib'
import { Icon } from '@/shared/ui'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import Fontisto from '@expo/vector-icons/Fontisto'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'

type NavItem = {
	route: string
	label: string
	matchRoutes: string[] // routes that should activate this tab
}

const NAV_ITEMS: NavItem[] = [
	{ route: '/home', label: 'Главная', matchRoutes: ['/home'] },
	{ route: '/chat', label: 'Чат', matchRoutes: ['/chat'] },
	{ route: '/stats', label: 'Статистика', matchRoutes: ['/stats'] },
	{
		route: '/profile',
		label: 'Профиль',
		matchRoutes: [
			'/profile',
			'/settings',
			'/change-password',
			'/privacy-policy',
			'/terms',
		],
	},
]

/**
 * Bottom navigation bar widget
 * Displays main navigation icons at the bottom of the screen
 * Automatically highlights active tab based on current route
 */
export const NavigationBar = () => {
	const router = useRouter()
	const pathname = usePathname()
	const { navbarBottom } = useNavbarLayout()

	const isActive = (item: NavItem) => {
		return item.matchRoutes.some((route) => pathname.startsWith(route))
	}

	const renderIcon = (route: string, active: boolean) => {
		const color = active ? '#000000' : '#FFFFFF'
		const size = 32

		switch (route) {
			case '/home':
				return <Icon name="house" size={size} color={color} />
			case '/chat':
				return (
					<MaterialCommunityIcons name="message-processing" size={size} color={color} />
				)
			case '/stats':
				return <Fontisto name="pie-chart-2" size={size} color={color} />
			case '/profile':
				return <FontAwesome6 name="user-large" size={size} color={color} />
			default:
				return null
		}
	}

	return (
		<View style={[styles.container, { bottom: navbarBottom }]}>
			<View style={styles.navContent}>
				{NAV_ITEMS.map((item) => {
					const active = isActive(item)
					return (
						<TouchableOpacity
							key={item.route}
							style={styles.navButton}
							onPress={() => router.push(item.route as any)}
							accessibilityRole="button"
							accessibilityLabel={item.label}
						>
							{active ? (
								<View style={styles.activeButton}>{renderIcon(item.route, true)}</View>
							) : (
								renderIcon(item.route, false)
							)}
						</TouchableOpacity>
					)
				})}
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
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
