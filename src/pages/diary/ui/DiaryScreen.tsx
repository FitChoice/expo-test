import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet } from 'react-native'
import { GradientHeader } from '@/shared/ui/GradientBG'
import { useState } from 'react'
import { useRouter } from 'expo-router'
import { CloseBtn } from '@/shared/ui/CloseBtn'
import { SafeAreaContainer } from '@/shared/ui/SafeAreaContainer'
import { sharedStyles } from '@/pages/survey/ui/components/shared-styles'
import Emo1 from '@/assets/images/moods/emo1.svg'
import Emo2 from '@/assets/images/moods/emo2.svg'
import Emo3 from '@/assets/images/moods/emo3.svg'
import Emo4 from '@/assets/images/moods/emo4.svg'
import Emo5 from '@/assets/images/moods/emo5.svg'

interface RatingOption {
    id: number
    Icon: React.ComponentType<any>
    color: string
}

const ratingOptions: RatingOption[] = [
    { id: 1, Icon: Emo1, color: '#FF4B6E' },
    { id: 2, Icon: Emo2, color: '#FF69B4' },
    { id: 3, Icon: Emo3, color: '#FFB800' },
    { id: 4, Icon: Emo4, color: '#6B7280' },
    { id: 5, Icon: Emo5, color: '#10B981' },
]

interface QuestionSectionProps {
    title: string
    subtitle: string
    selectedValue: number | null
    onSelect: (value: number) => void
}

const QuestionSection = ({ title, subtitle, selectedValue, onSelect }: QuestionSectionProps) => {
    return (
        <View className="mb-2 bg-bg-dark-500 p-4" style={{ overflow: 'hidden', borderRadius: 14 }}>
            <Text className="text-white text-t1.1 font-semibold mb-1">{title}</Text>
            <Text className="text-gray-400 text-t3 mb-4">{subtitle}</Text>
            <View className="flex-row justify-between">
                {ratingOptions.map((option) => {
                    const Icon = option.Icon
                    const isSelected = selectedValue === option.id
                    return (
                        <TouchableOpacity
                            key={option.id}
                            onPress={() => onSelect(option.id)}
                        >
                            <View
                                style={{
                                    borderRadius: 27,
                                    borderWidth: isSelected ? 1 : 0,
                                    borderColor: isSelected ? option.color : 'transparent',
                                    padding: 0,
                                }}
                            >
                                <View
                                    style={{
                                        width: 54,
                                        height: 54,
                                        borderRadius: 27,
                                        borderWidth: 10,
                                        borderColor: '#3f3f3f',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Icon width={35} height={35} />
                                </View>
                            </View>
                        </TouchableOpacity>
                    )
                })}
            </View>
        </View>
    )
}

export const DiaryScreen = () => {
    const router = useRouter()
    const [mood, setMood] = useState<number | null>(null)
    const [wellBeing, setWellBeing] = useState<number | null>(null)
    const [energyLevel, setEnergyLevel] = useState<number | null>(null)
    const [sleepQuality, setSleepQuality] = useState<number | null>(null)
    const [sleepTime, setSleepTime] = useState('00:00')
    const [wakeTime, setWakeTime] = useState('07:00')
    const [notes, setNotes] = useState('')

    const currentDate = new Date().toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        weekday: 'long',
    })

    return (
        <View className="flex-1 bg-black">
            {/* Header with gradient */}
            <View className="absolute top-0 left-0 right-0 z-0" style={{ overflow: 'hidden', borderRadius: 34 }}>
                <GradientHeader />
            </View>
            <SafeAreaContainer style={styles.contentContainer}>
            {/* Header Content */}
            <View className="pt-10 px-4 pb-14 z-10"  >
                <View className=" items-center mb-2">
                    <Text className="text-gray-400 text-t2 text-center">{currentDate}</Text>
                    </View>
                    <CloseBtn classNames={'rounded-2xl'} handlePress={() => router.back()} />
       
                <Text className='font-rimma text-2xl text-center text-white '>НОВАЯ ЗАПИСЬ</Text>
            </View>

            {/* Scrollable Content */}
            <ScrollView className="flex-1 px-4 bg-black  pt-10" showsVerticalScrollIndicator={false}>
                <QuestionSection
                    title="Настроение"
                    subtitle="Какое у вас общее настроение?"
                    selectedValue={mood}
                    onSelect={setMood}
                />

                <QuestionSection
                    title="Самочувствие"
                    subtitle="Когда вы чувствуете себя физически?"
                    selectedValue={wellBeing}
                    onSelect={setWellBeing}
                />

                <QuestionSection
                    title="Уровень энергии"
                    subtitle="Сколько у вас сил сегодня?"
                    selectedValue={energyLevel}
                    onSelect={setEnergyLevel}
                />

                <QuestionSection
                    title="Качество сна"
                    subtitle="Как вы спали прошлой ночью?"
                    selectedValue={sleepQuality}
                    onSelect={setSleepQuality}
                />

                {/* Sleep Time Section */}
                <View className="mb-6 bg-bg-dark-500 p-4" style={{ overflow: 'hidden', borderRadius: 14 }}>

                    <Text className="text-white text-lg font-semibold mb-1">Время сна</Text>
                    <Text className="text-gray-400 text-sm mb-4">
                        Во сколько легли и когда проснулись?
                    </Text>
                    <View className="flex-row justify-between">
                        <View className="flex-1 mr-2">
                            <Text className="text-gray-400 text-sm mb-2">Засыпание</Text>
                            <TextInput
                                value={sleepTime}
                                onChangeText={setSleepTime}
                                className="bg-[#2E322D] text-white px-4 py-3 rounded-xl"
                                placeholder="00:00"
                                placeholderTextColor="#666"
                            />
                        </View>
                        <View className="flex-1 ml-2">
                            <Text className="text-gray-400 text-sm mb-2">Пробуждение</Text>
                            <TextInput
                                value={wakeTime}
                                onChangeText={setWakeTime}
                                className="bg-[#2E322D] text-white px-4 py-3 rounded-xl"
                                placeholder="07:00"
                                placeholderTextColor="#666"
                            />
                        </View>
                    </View>
                </View>

                {/* Notes Section */}
                <View className="mb-6 bg-bg-dark-500 p-4" style={{ overflow: 'hidden', borderRadius: 14 }}>
                    <Text className="text-white text-lg font-semibold mb-1">Заметки</Text>
                    <Text className="text-gray-400 text-sm mb-4">
                        Можете ли напишите что добавить?
                    </Text>
                    <TextInput
                        value={notes}
                        onChangeText={setNotes}
                        className="bg-[#2E322D] text-white px-4 py-3 rounded-xl min-h-[100px]"
                        placeholder="Сегодня я..."
                        placeholderTextColor="#666"
                        multiline
                        textAlignVertical="top"
                    />
                    <Text className="text-gray-500 text-xs text-right mt-2">
                        0 / 500 символов
                    </Text>
                </View>
            </ScrollView>
            </SafeAreaContainer>
        </View>
    )
}



const styles = StyleSheet.create({
  
    contentContainer: {
        flex: 1,
        paddingHorizontal: 14,
    },
})
