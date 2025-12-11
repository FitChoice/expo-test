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
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Icon, Button, BackgroundLayoutNoSidePadding, TrainingTags } from '@/shared/ui'
import { NavigationBar } from '@/widgets/navigation-bar'
import { useNavbarLayout } from '@/shared/lib'
import {
    type Activity, trainingApi, type TrainingPlan,
} from '@/features/training/api'
import { getUserId } from '@/shared/lib/auth'
import type { ApiResult } from '@/shared/api/types'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5'
import Ionicons from '@expo/vector-icons/Ionicons'
import { Loader } from '@/shared/ui/Loader/Loader'

import MorningExercise from '@/assets/images/morning_ex.svg'
import Stretching from '@/assets/images/stretching.svg'
import Barbell	 from '@/assets/images/barbell.svg'

import { Feather } from '@expo/vector-icons'

/**
 * Home screen - main page according to Figma design
 */
export const HomeScreen = () => {
    return (
        <BackgroundLayoutNoSidePadding>
            {Platform.OS === 'web' ? <WebContent /> : <MobileContent />}
        </BackgroundLayoutNoSidePadding>
    )
}

/**
 * Mobile version according to Figma design
 */
const MobileContent = () => {
    const router = useRouter()
    const { contentPaddingBottom } = useNavbarLayout()

    const [userId, setUserId] = useState<number | null>(null)
    const [selectedDayIdx, setSelectedDayIdx] = useState(1)
    const [selectedDayId, setSelectedDayId] = useState(0)
    const [selectedDateInternal, setSelectedDateInternal] = useState<string>(() => {
        const d = new Date()
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    })

    const { data: trainingDays, isLoading } = useQuery<
        ApiResult<TrainingPlan>,
        Error
    >({
        queryKey: ['trainingPlan', userId],
        queryFn: async () => {
            if (!userId) throw new Error('User ID is required')
            return await trainingApi.getTrainingPlan(userId)
        },
        staleTime: 5 * 60 * 1000,
        enabled: !!userId,
        retry: false,
    })

    const [ selectedDayTraining, setSelectedDayTraining ] = useState<Activity[]>([])

    useEffect(() => {
        if (!trainingDays?.success) return
        const trainingByDayIdx = trainingDays.data.findIndex((day) => day.date.slice(0, 10) == selectedDateInternal)
        setSelectedDayTraining(trainingDays.data[trainingByDayIdx]?.activities ?? [])

        setSelectedDayIdx(trainingByDayIdx)
        setSelectedDayId(trainingDays.data[trainingByDayIdx]?.id)
			
    }, [selectedDateInternal, trainingDays])

    const [calendarWidth, setCalendarWidth] = useState(0)
    const scrollRef = useRef<ScrollView>(null)
    const itemLayoutsRef = useRef<Record<string, { x: number; width: number }>>({})

    // Get user ID on mount
    useEffect(() => {
        const fetchUserId = async () => {
            const id = await getUserId()
            setUserId(id)
        }
        fetchUserId()
    }, [])

    const weekDayFormatter = useMemo(
        () =>
            new Intl.DateTimeFormat('ru-RU', {
                weekday: 'short',
                timeZone: 'UTC',
            }),
        []
    )

    const getDateKey = (value?: string | Date | null) => {
        if (!value) return ''
        if (typeof value === 'string') return value.slice(0, 10)
        
        const dateObj = value
        if (Number.isNaN(dateObj.getTime())) return ''
        
        const year = dateObj.getFullYear()
        const month = String(dateObj.getMonth() + 1).padStart(2, '0')
        const day = String(dateObj.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }
	
    const calendarDays = useMemo(() => {
        if (!trainingDays?.success) return []
        return trainingDays?.data?.map((day, index) => {
            const parsedDate = day.date ? new Date(day.date) : null
            const isValidDate = parsedDate && !Number.isNaN(parsedDate.getTime())
            const safeDate = isValidDate ? parsedDate : null
            const dateKey = day.date ? day.date.slice(0, 10) : getDateKey(safeDate)

            return {
                key: String(day.id ?? day.date ?? index),
                id: day.id,
                dateKey,
                dayNumber: safeDate ? String(safeDate.getDate()) : '--',
                dayName: safeDate ? weekDayFormatter.format(safeDate).replace('.', '') : '',
            }
        })
    }, [trainingDays, weekDayFormatter])

    const resolvedSelectedDate = useMemo(() => {
        if (!calendarDays?.length) return selectedDateInternal

        const hasExplicit = calendarDays.some((day) => day.dateKey === selectedDateInternal)
        if (hasExplicit) return selectedDateInternal

        const todayKey = getDateKey(new Date())
        const hasToday = calendarDays.some((day) => day.dateKey === todayKey)
        if (hasToday) return todayKey

        return calendarDays[0]?.dateKey ?? selectedDateInternal
    }, [calendarDays, selectedDateInternal])

    const scrollToDate = (dateKey: string) => {
        if (!dateKey || !calendarWidth) return
        const layout = itemLayoutsRef.current[dateKey]
        if (!layout || !scrollRef.current) return

        const offset = Math.max(0, layout.x - calendarWidth / 2 + layout.width / 2)
        scrollRef.current.scrollTo({ x: offset, animated: true })
    }

    useEffect(() => {
        scrollToDate(resolvedSelectedDate)
    }, [resolvedSelectedDate, calendarWidth, calendarDays])

    const handleOpenDemo = (trainingId: number) => {
    
        router.push({ pathname: '/(training)/session', params: { trainingId } })
    }

    const handleOpenDiary = (id: number) => {
        router.push({ pathname: '/diary', params: { id } })
    }

    const getTrainingTitle = (activity: Activity) => {
        return activity.Type.includes('t') ? 'Тренировка' :
            activity.Type.includes('w') ? 'Зарядка' :
                'Дополнительная тренировка'
    }

    const isFinishedTraining = (activity: Activity) => !activity?.Progress.includes(0)

    const getTrainingIcon = (activity: Activity): React.ReactNode => {

        if (isFinishedTraining(activity)) {
            return <Feather name="check" size={24} color="black" />
        }
        return activity?.Type.includes('t') ?  <Barbell/> :
            activity?.Type.includes('w') ? <MorningExercise /> :
                <Stretching />
    }

    if (isLoading )  {
        return <Loader text="Загрузка тренировочного плана" />
    }

    return (
        <View className="flex-1">
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: contentPaddingBottom }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Header with progress */}
                <View className="pt-4">
                    <View style={styles.progressSection}>
                        <View style={styles.progressItem}>
                            <View style={styles.progressIcon}>
                                <Ionicons
                                    name="barbell-outline"
                                    size={56}
                                    color="white"
                                    style={styles.topIcon}
                                />
                            </View>
                            <Text style={styles.progressText}>1 / 12</Text>
                        </View>
                        <Text style={styles.monthText}>Месяц 1</Text>
                        <View style={styles.progressItem}>
                            <View style={styles.progressIcon}>
                                <MaterialCommunityIcons
                                    name="bow-arrow"
                                    size={56}
                                    color="white"
                                    style={styles.topIconBow}
                                />
                            </View>
                            <Text style={styles.progressText}>40</Text>
                        </View>
                    </View>
                </View>

                {/* Mini Calendar */}
                <View style={styles.calendarSection}>
                    <View style={styles.calendarContainer}>
                        {/* Calendar days */}
                        <ScrollView
                            ref={scrollRef}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.calendarDays}
                            onLayout={(event) => setCalendarWidth(event.nativeEvent.layout.width)}
                        >
                            {calendarDays?.map((day, idx) => {
                                const isSelected = day.dateKey === resolvedSelectedDate
                                return (
                                    <TouchableOpacity
                                        key={day.key}
                                        style={styles.calendarDay}
                                        activeOpacity={0.8}
                                        onLayout={(event) => {
                                            const { x, width } = event.nativeEvent.layout
                                            if (day.dateKey) {
                                                itemLayoutsRef.current[day.dateKey] = { x, width }
                                                if (isSelected) {
                                                    scrollToDate(day.dateKey)
                                                }
                                            }
                                        }}
                                        onPress={() => {
                                            if (day.dateKey) {
                                                setSelectedDateInternal(day.dateKey)
                                            }
                                        }}
                                    >
                                        <View style={[styles.dayCard, isSelected && styles.dayCardSelected]}>
                                            <Icon name="barbell" size={16} color="#FFFFFF" />
                                            <View style={styles.dayInfo}>
                                                <Text style={styles.dayNumber}>{day.dayNumber}</Text>
                                                <Text style={styles.dayName}>{day.dayName}</Text>
                                            </View>
                                        </View>
                                        <View style={[styles.dayDot, isSelected && styles.dayDotSelected]} />
                                    </TouchableOpacity>
                                )
                            })}
                        </ScrollView>
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
                            <Text style={styles.dayTitle}>День {selectedDayIdx}</Text>
                            <Text style={styles.dayDescription}>
								Самое время начать{'\n'}Тренировка уже ждёт тебя
                            </Text>
                        </View>
                    </View>
                    {/* Action Buttons */}
									
                    {
                        selectedDayTraining.map((training, idx) =>  <View  key={training.ID}  style={styles.actionButtons}>
                            <TouchableOpacity style={styles.actionButton} onPress={() => handleOpenDemo(training.ID)}>
                                <View style={styles.buttonContent}>
                                    <View style={styles.buttonInfo}>
                                        <Text style={styles.buttonTitle}>{getTrainingTitle(training)}</Text>
                                        <TrainingTags
                                            icon1={<MaterialIcons name="timer" size={16} color="white" />}
                                            title1={`${training.Duration} мин.`}
                                            icon2={
                                                <MaterialCommunityIcons name="bow-arrow" size={16} color="white" />
                                            }
                                            title2={`+${training.Experience} опыт`}
                                        />
                                    </View>
                                    <View style={[styles.buttonIcon, isFinishedTraining(training) ? { backgroundColor: '#aaec4d' } : { backgroundColor: '#a172ff' } ]}>
                                        {/*<Icon name="barbell" size={32} color="white" />*/}
                                        {getTrainingIcon(training)}
                                    </View>
                                </View>
                            </TouchableOpacity>

                            { selectedDayTraining.length - 1 == idx && <TouchableOpacity style={styles.actionButton} onPress={() => handleOpenDiary(selectedDayId)}>
                                <View style={styles.buttonContent}>
                                    <View style={styles.buttonInfo}>
                                        <Text style={styles.buttonTitle}>Дневник</Text>
                                        <TrainingTags
                                            icon1={<MaterialIcons name="timer" size={16} color="white" />}
                                            title1={'40 минут'}
                                            icon2={
                                                <MaterialCommunityIcons name="bow-arrow" size={16} color="white" />
                                            }
                                            title2={'+20 опыта'}
                                        />
                                    </View>
                                    <View style={[styles.buttonIcon, { backgroundColor: trainingDays?.data[selectedDayIdx].is_diary_complete ? '#aaec4d' :  '#a172ff' } ]} >
                                        {
                                            training.is_diary_complete ? <Feather name="check" size={24} color="black" /> :  <Icon name="diary" size={32} color="#A172FF" />
                                        }
                                    </View>
                                </View>
                            </TouchableOpacity>
                            }
                        </View>)
                    }
                </View>
            </ScrollView>

            {/* Navigation Bar */}
            <NavigationBar />
        </View>
    )
}

const styles = StyleSheet.create({
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
        paddingHorizontal: 10,
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
    dayCardSelected: {
        borderWidth: 1,
        borderColor: 'white',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
    dayDotSelected: {
        backgroundColor: '#aaec4d',
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
        marginBottom: 8
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
