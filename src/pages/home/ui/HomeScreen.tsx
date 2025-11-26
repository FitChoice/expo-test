import {
    View,
    Text,
    ScrollView,
    Platform,
    StyleSheet,
    TouchableOpacity,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import {
    Icon,
    Button,
    AuthGuard,
    BackgroundLayoutNoSidePadding,
    TrainingTags,
} from '@/shared/ui'
import { NavigationBar } from '@/widgets/navigation-bar'
import type { Training } from '@/entities/training'
import { useTrainingStore } from '@/entities/training'
import { trainingApi } from '@/features/training/api'
import { getUserId } from '@/shared/lib/auth'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5'
import Ionicons from '@expo/vector-icons/Ionicons'

/**
 * Home screen - main page according to Figma design
 */
export const HomeScreen = () => {
    return (
        <AuthGuard>
            <BackgroundLayoutNoSidePadding>
                {Platform.OS === 'web' ? <WebContent /> : <MobileContent />}
            </BackgroundLayoutNoSidePadding>
        </AuthGuard>
    )
}

/**
 * Mobile version according to Figma design
 */
const MobileContent = () => {

    const router = useRouter()
    const startTraining = useTrainingStore((state) => state.startTraining)

    const [userId, setUserId] = useState<number | null>(null)

    // Get user ID on mount
    useEffect(() => {
        const fetchUserId = async () => {
            const id = await getUserId()
            setUserId(id)
        }
        fetchUserId()
    }, [])

    // Fetch training plan when userId is available
    const { data: trainingPlan } = useQuery({
        queryKey: ['trainingPlan', userId],
        queryFn: async () => {
            if (!userId) throw new Error('User ID is required')
            return await trainingApi.getTrainingPlan(userId)
        },
        enabled: !!userId,
        retry: false,
    })

    const handleOpenDemo = () => {
        const demo: Training = {
            'id': 295,
            'trainingType': 't7',
            'title': 'Ноги и Ягодицы + Пресс',
            'description': 'Создай своё лучшее тело от ягодиц до кубиков! Каждое приседание и подъем — это шаг к подтянутой фигуре и уверенности в себе. Заверши сессию укреплением кора и почувствуй, как твоё тело становится сильнее и гармоничнее.',
            'difficulty': 2,
            'experience': 60,
            'inventory': [
                1,
                2,
                3
            ],
            'exercises': [
                {
                    'id': 'squat',
                    'side': 'single',
                    'name': 'Классический присед с резинкой',
                    'rest_time': 10,
                    'duration': 5,
                    'progress': 15,
                    'sets': 2,
                    'reps': 5,
                    'isAi': false,
                    'VideoTheory': 'https://storage.yandexcloud.net/fitdb/trainings/0001%20-%20%D1%82%D0%B5%D0%BE%D1%80%D0%B8%D1%8F.mp4',
                    'VideoPractice': 'https://storage.yandexcloud.net/fitdb/trainings/0001%20-%20%D1%82%D0%B5%D0%BE%D1%80%D0%B8%D1%8F.mp4',
                    'isVertical': true,
                },

                {
                    'id': 'leg_abduction_l',
                    'side': 'single',
                    'name': 'Отведение ноги назад с опорой на локти ',
                    'rest_time': 40,
                    'duration': 5,
                    'progress': 15,
                    'sets': 2,
                    'reps': 5,
                    'isAi': false,
                    'VideoTheory': 'https://storage.yandexcloud.net/fitdb/trainings/0009%20-%20%D1%82%D0%B5%D0%BE%D1%80%D0%B8%D1%8F.mp4',
                    'VideoPractice': 'https://storage.yandexcloud.net/fitdb/trainings/0009%20-%20%D0%BF%D1%80%D0%B0%D0%BA%D1%82%D0%B8%D0%BA%D0%B0%20%20-%20L.mp4',

                    'isVertical': false,
                },
                // {
                //     'id': 'leg_abduction_r',
                //     'side': 'both',
                //     'name': 'Отведение ноги назад с опорой на локти ',
                //     'rest_time': 40,
                //     'duration': 5,
                //     'progress': 15,
                //     'sets': 2,
                //     'reps': 5,
                //     'isAi': false,
                //     'VideoTheory': 'https://storage.yandexcloud.net/fitdb/trainings/0009%20-%20%D1%82%D0%B5%D0%BE%D1%80%D0%B8%D1%8F.mp4',
                //     'VideoPractice': 'https://storage.yandexcloud.net/fitdb/trainings/0009%20-%20%D0%BF%D1%80%D0%B0%D0%BA%D1%82%D0%B8%D0%BA%D0%B0%20%20-%20L.mp4',
								//
                //     'isVertical': false,
                // },
            ]
        }

        startTraining(demo)
        router.push({ pathname: '/(training)/session', params: { trainingId: 1 } })
	  }

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}

            >
                {/* Header with progress */}
                <View className="pt-4">
                    <View style={styles.progressSection}>
                        <View style={styles.progressItem}>
                            <View style={styles.progressIcon}>
                                <Ionicons name="barbell-outline" size={56} color="white" style={styles.topIcon} />
                            </View>
                            <Text style={styles.progressText}>1 / 12</Text>
                        </View>
                        <Text style={styles.monthText}>Месяц 1</Text>
                        <View style={styles.progressItem}>
                            <View style={styles.progressIcon}>
                                <MaterialCommunityIcons name="bow-arrow" size={56} color="white" style={styles.topIconBow}  />
                            </View>
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

                    <View style={{ marginBottom: 65 }}>
                        {/* Progress Tag - moved to top */}
                        <View style={styles.progressTag}>
                            <FontAwesome5 name="font-awesome-flag" size={16} color="white" />
                            <Text style={styles.progressTagText}>0/2</Text>
                        </View>

                        <View style={styles.cardHeader}>
                            <Text style={styles.dayTitle}>День 1</Text>
                            <Text style={styles.dayDescription}>
							Самое время начать{'\n'}Первая тренировка уже ждёт тебя
                            </Text>
                        </View>

                    </View>
                    {/* Action Buttons */}
                    <View style={styles.actionButtons}>
                        <TouchableOpacity style={styles.actionButton}
                            onPress={handleOpenDemo}
                        >
                            <View style={styles.buttonContent}>
                                <View style={styles.buttonInfo}>
                                    <Text style={styles.buttonTitle}>Тренировка</Text>
                                    <TrainingTags
                                        icon1={<MaterialIcons name="timer" size={16} color="white" />}
                                        title1={'40 минут'}
                                        icon2={<MaterialCommunityIcons name="bow-arrow" size={16} color="white"  />}
                                        title2={'+20 опыта'}
                                    />
                                </View>
                                <View style={styles.buttonIcon}>
                                    <Icon name="barbell" size={32} color="white" />
                                </View>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton}>
                            <View style={styles.buttonContent}>
                                <View style={styles.buttonInfo}>
                                    <Text style={styles.buttonTitle}>Дневник</Text>
                                    <TrainingTags
                                        icon1={<MaterialIcons name="timer" size={16} color="white" />}
                                        title1={'40 минут'}
                                        icon2={<MaterialCommunityIcons name="bow-arrow" size={16} color="white"  />}
                                        title2={'+20 опыта'}
                                    />
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
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },

    progressSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 94,
        paddingHorizontal: 14,
    },
    progressItem: {
        width: 56,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    progressIcon: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressText: {
        fontFamily: 'Inter',
        fontWeight: '700',
        fontSize: 16,
        lineHeight: 19.2,
        color: '#FFFFFF',
        textAlign: 'center',
        zIndex: 1,
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
        marginBottom: 70,
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
        backgroundColor: 'black',
        borderRadius: 25,
        paddingVertical: 10,
        paddingHorizontal: 5,
        justifyContent: 'space-between',
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
    topIcon: {
        opacity: 0.2,
        transform: [{ rotate: '-45deg' }],
    },
    topIconBow: {
        opacity: 0.2,
		
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
