import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
    NAVBAR_HEIGHT,
    NAVBAR_MIN_BOTTOM_OFFSET,
    NAVBAR_CONTENT_GAP,
} from '@/shared/constants/sizes'

/**
 * Хук для расчёта отступов NavigationBar с учётом safe area
 *
 * @returns {Object}
 * - navbarBottom: отступ для позиционирования NavigationBar (bottom style)
 * - contentPaddingBottom: отступ для ScrollView контента (paddingBottom)
 *
 * @example
 * // В NavigationBar:
 * const { navbarBottom } = useNavbarLayout()
 * <View style={[styles.container, { bottom: navbarBottom }]}>
 *
 * @example
 * // В экранах с NavigationBar:
 * const { contentPaddingBottom } = useNavbarLayout()
 * <ScrollView contentContainerStyle={{ paddingBottom: contentPaddingBottom }}>
 */
export const useNavbarLayout = () => {
    const insets = useSafeAreaInsets()

    // Отступ от нижнего края экрана до NavigationBar
    // На устройствах с home indicator: insets.bottom (~34px)
    // На устройствах без safe area: минимум 16px для визуального комфорта
    const navbarBottom = Math.max(insets.bottom, NAVBAR_MIN_BOTTOM_OFFSET)

    // Полный отступ для контента страницы:
    // высота навбара + отступ от края + gap между контентом и навбаром
    const contentPaddingBottom = NAVBAR_HEIGHT + navbarBottom + NAVBAR_CONTENT_GAP

    return {
        navbarBottom,
        contentPaddingBottom,
    }
}
