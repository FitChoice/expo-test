import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { Icon } from '@/shared/ui'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import Fontisto from '@expo/vector-icons/Fontisto'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'

/**
 * Bottom navigation bar widget
 * Displays main navigation icons at the bottom of the screen
 */
export const NavigationBar = () => {
    const router = useRouter()

    return (
        <View style={[styles.container]}>
            <View style={styles.navContent}>
                <TouchableOpacity
                    style={styles.navButton}
                    onPress={() => router.push('/home')}
                    accessibilityRole="button"
                    accessibilityLabel="Главная"
                >
                    <View style={styles.activeButton}>
                        <Icon name="house" size={32} />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.navButton}
                    onPress={() => router.push('/chat')}
                    accessibilityRole="button"
                    accessibilityLabel="Чат"
                >
                    <MaterialCommunityIcons name="message-processing" size={32} color="white" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.navButton}
                    onPress={() => {
                        // TODO: Add logout/profile navigation
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Выход"
                >
                    <Fontisto name="pie-chart-2" size={32} color="white" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.navButton}
                    onPress={() => router.push('/profile')}
                    accessibilityRole="button"
                    accessibilityLabel="Профиль"
                >
                    <FontAwesome6 name="user-large" size={32} color="white" />
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 10,
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
