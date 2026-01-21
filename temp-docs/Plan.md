# План реализации: Модальное окно выбора метрики состояния

## Задача

При нажатии на кнопку "Настроение" открывается fullscreen модальное окно с выбором метрики (Настроение, Самочувствие, Уровень энергии, Качество сна). Выбранная метрика сохраняется в родительском компоненте `DayStatistic`, и данные графика обновляются. Также добавляется переключатель периода "За эту неделю" / "За этот месяц".

---

## Анализ подходов

### Подход 1: React Native Modal (RNModal) + локальный state ✅ РЕКОМЕНДУЕМЫЙ

**Описание:** Использование стандартного `Modal` из `react-native` с `BlurView` для размытого фона. Состояние хранится локально в компоненте `DayStatistic` через `useState`.

| Критерий | Оценка |
|----------|--------|
| Соответствие паттернам кодовой базы | ✅✅ (ConfirmModal, PauseModal, StopModal) |
| Сложность реализации | Низкая |
| Производительность | Лучшая |
| Управление состоянием | Простое (useState) |
| Необходимость изменений роутинга | Нет |

**Плюсы:**
- ✅ Уже установленный паттерн в кодовой базе
- ✅ Простая реализация — вся логика в одном месте
- ✅ Прямой доступ к state без внешних stores
- ✅ Использует существующий BlurView паттерн
- ✅ Нет накладных расходов на навигацию
- ✅ Соответствует дизайну из скриншота

**Минусы:**
- ❌ Логика модалки в компоненте (легко вынести в отдельный файл)

---

### Подход 2: Expo Router Modal (Route-based) ❌

**Описание:** Использование `presentation: 'modal'` в expo-router для создания модальной screen.

| Критерий | Оценка |
|----------|--------|
| Соответствие паттернам кодовой базы | ❌ |
| Сложность реализации | Высокая |
| Производительность | Хорошая |
| Управление состоянием | Сложное (context/zustand/URL params) |
| Необходимость изменений роутинга | Да |

**Плюсы:**
- ✅ Нативная презентация модалки
- ✅ Deep linking из коробки

**Минусы:**
- ❌ Требует изменений `_layout.tsx`
- ❌ Сложное разделение состояния между экранами
- ❌ Избыточно для простой модалки выбора
- ❌ Не соответствует существующим паттернам

---

### Подход 3: Zustand Store + Modal Component ❌

**Описание:** Использование глобального zustand store для управления видимостью модалки и выбранной метрикой.

| Критерий | Оценка |
|----------|--------|
| Соответствие паттернам кодовой базы | ❌ |
| Сложность реализации | Средняя |
| Производительность | Лучшая |
| Управление состоянием | Избыточное |
| Необходимость изменений роутинга | Нет |

**Плюсы:**
- ✅ State доступен из любой части приложения
- ✅ Zustand уже в зависимостях

**Минусы:**
- ❌ Избыточно для локального UI состояния
- ❌ Добавляет ненужную сложность
- ❌ Засоряет глобальный store

---

## Итоговое сравнение

| Критерий | RNModal (1) | Expo Router (2) | Zustand (3) |
|----------|-------------|-----------------|-------------|
| Соответствие паттернам | ✅✅ | ❌ | ❌ |
| Сложность | Низкая | Высокая | Средняя |
| Производительность | Лучшая | Хорошая | Лучшая |
| Управление state | Простое | Сложное | Избыточное |

**Победитель: Подход 1 — React Native Modal с локальным состоянием**

---

## Детальный план реализации

### Шаг 1: Определение типов и констант

**Файл:** `src/pages/stats/ui/DayStatistic.tsx` (или вынести в отдельный файл типов)

```typescript
type MetricType = 'mood' | 'wellbeing' | 'energy' | 'sleep'
type PeriodType = 'week' | 'month'

const METRIC_LABELS: Record<MetricType, string> = {
  mood: 'Настроение',
  wellbeing: 'Самочувствие',
  energy: 'Уровень энергии',
  sleep: 'Качество сна',
}

const METRIC_OPTIONS: { key: MetricType; label: string }[] = [
  { key: 'mood', label: 'Настроение' },
  { key: 'wellbeing', label: 'Самочувствие' },
  { key: 'energy', label: 'Энергия' },
  { key: 'sleep', label: 'Качество сна' },
]
```

---

### Шаг 2: Добавление состояния в DayStatistic

```typescript
import React, { useState, useMemo } from 'react'

export function DayStatistic() {
  // Существующий код...
  
  // Новое состояние
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('mood')
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('week')
  const [isMetricModalVisible, setIsMetricModalVisible] = useState(false)
  
  // ...
}
```

---

### Шаг 3: Создание компонента MetricSelectorModal

**Файл:** `src/pages/stats/ui/MetricSelectorModal.tsx`

**Структура компонента (следует паттерну PauseModal/StopModal):**

```typescript
import { View, Text, Modal as RNModal, StyleSheet, Platform, TouchableOpacity } from 'react-native'
import { BlurView } from 'expo-blur'
import { GlowButton } from '@/shared/ui/GlowButton/GlowButton'
import { SafeAreaView } from 'react-native-safe-area-context'

interface MetricSelectorModalProps {
  visible: boolean
  selectedMetric: MetricType
  onSelect: (metric: MetricType) => void
  onClose: () => void
}

export function MetricSelectorModal({ 
  visible, 
  selectedMetric, 
  onSelect, 
  onClose 
}: MetricSelectorModalProps) {
  const handleSelect = (metric: MetricType) => {
    onSelect(metric)
    onClose()
  }

  return (
    <RNModal
      visible={visible}
      statusBarTranslucent
      navigationBarTranslucent
      transparent
      animationType="fade"
    >
      <View className="flex-1">
        {/* Blurred background */}
        <BlurView
          intensity={50}
          tint="dark"
          style={StyleSheet.absoluteFill}
          experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
          blurReductionFactor={Platform.OS === 'android' ? 4 : undefined}
        />

        <SafeAreaView className="flex-1 justify-center px-6">
          <View className="gap-3">
            {METRIC_OPTIONS.map((option) => (
              <GlowButton
                key={option.key}
                isSelected={selectedMetric === option.key}
                onPress={() => handleSelect(option.key)}
                style={styles.optionButton}
                contentStyle={styles.optionContent}
              >
                <Text className="text-t2 text-white text-center">
                  {option.label}
                </Text>
              </GlowButton>
            ))}
          </View>
        </SafeAreaView>
      </View>
    </RNModal>
  )
}

const styles = StyleSheet.create({
  optionButton: {
    minHeight: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
})
```

---

### Шаг 4: Создание данных для графика (hardcoded)

```typescript
// Данные для недели
const weeklyMoodPoints = [
  { day: 'пн', Icon: Emo3, color: '#FFB800', height: 180, rating: 3 },
  { day: 'вт', Icon: Emo2, color: '#FF69B4', height: 110, rating: 2 },
  // ... остальные дни
]

const weeklyWellbeingPoints = [
  { day: 'пн', Icon: Emo4, color: '#6B7280', height: 160, rating: 4 },
  // ... 
]

const weeklyEnergyPoints = [
  { day: 'пн', Icon: Emo5, color: '#10B981', height: 200, rating: 5 },
  // ...
]

const weeklySleepPoints = [
  { day: 'пн', Icon: Emo3, color: '#FFB800', height: 150, rating: 3 },
  // ...
]

// Данные для месяца (1-31 вместо пн-вс)
const monthlyMoodPoints = [
  { day: '1', Icon: Emo3, color: '#FFB800', height: 180, rating: 3 },
  { day: '2', Icon: Emo2, color: '#FF69B4', height: 110, rating: 2 },
  // ... до 31
]

// Аналогично для других метрик...

const METRIC_DATA = {
  week: {
    mood: weeklyMoodPoints,
    wellbeing: weeklyWellbeingPoints,
    energy: weeklyEnergyPoints,
    sleep: weeklySleepPoints,
  },
  month: {
    mood: monthlyMoodPoints,
    wellbeing: monthlyWellbeingPoints,
    energy: monthlyEnergyPoints,
    sleep: monthlySleepPoints,
  },
}
```

---

### Шаг 5: Вычисление отображаемых данных

```typescript
// В компоненте DayStatistic
const displayedPoints = useMemo(() => {
  return METRIC_DATA[selectedPeriod][selectedMetric]
}, [selectedPeriod, selectedMetric])
```

---

### Шаг 6: Вычисление среднего показателя

```typescript
// Используем ratingOptions из DiaryScreen
const ratingOptions = [
  { id: 1, Icon: Emo1, color: '#FF4B6E' },
  { id: 2, Icon: Emo2, color: '#FF69B4' },
  { id: 3, Icon: Emo3, color: '#FFB800' },
  { id: 4, Icon: Emo4, color: '#6B7280' },
  { id: 5, Icon: Emo5, color: '#10B981' },
]

const averageData = useMemo(() => {
  const points = displayedPoints
  const avgRating = Math.round(
    points.reduce((sum, p) => sum + p.rating, 0) / points.length
  )
  const ratingOption = ratingOptions.find(r => r.id === avgRating) || ratingOptions[2]
  return {
    Icon: ratingOption.Icon,
    label: 'В среднем',
  }
}, [displayedPoints])
```

---

### Шаг 7: Обновление UI элементов

**Кнопка выбора метрики (строки 239-245):**

```tsx
<TouchableOpacity
  className="w-40 flex-row items-center justify-center rounded-2xl bg-fill-800 py-2"
  activeOpacity={0.9}
  onPress={() => setIsMetricModalVisible(true)}
>
  <Text className="text-t3 text-light-text-200">
    {METRIC_LABELS[selectedMetric]}
  </Text>
  <EvilIcons name="chevron-right" size={24} color="white" />
</TouchableOpacity>
```

**Переключатель периода (строка 236):**

```tsx
<TouchableOpacity onPress={() => setSelectedPeriod(p => p === 'week' ? 'month' : 'week')}>
  <Text className="text-t3 text-light-text-500">
    {selectedPeriod === 'week' ? 'За эту неделю' : 'За этот месяц'}
  </Text>
</TouchableOpacity>
```

**Средний показатель (строки 262-265):**

```tsx
<View className="mt-4 h-20 flex-row items-center gap-4 rounded-full bg-[#3f3f3f] px-4">
  <averageData.Icon width={40} height={40} />
  <Text className="text-body-regular text-light-text-200">{averageData.label}</Text>
</View>
```

---

### Шаг 8: Подключение модалки

```tsx
// В конце компонента DayStatistic, перед закрывающим </>
<MetricSelectorModal
  visible={isMetricModalVisible}
  selectedMetric={selectedMetric}
  onSelect={setSelectedMetric}
  onClose={() => setIsMetricModalVisible(false)}
/>
```

---

## Структура файлов после реализации

```
src/pages/stats/ui/
├── DayStatistic.tsx          # Обновлённый компонент
├── MetricSelectorModal.tsx   # Новый компонент модалки
└── types.ts                  # (опционально) типы MetricType, PeriodType
```

---

## Зависимости

Все зависимости уже есть в проекте:
- `react-native` — Modal
- `expo-blur` — BlurView
- `GlowButton` — `@/shared/ui/GlowButton/GlowButton`
- Иконки Emo1-Emo5 — `@/assets/images/moods/`

---

## Примечания

1. **GlowButton** автоматически добавляет зелёную подсветку для `isSelected={true}`
2. **Данные hardcoded** — в будущем можно заменить на API
3. **Формат месячных данных** — дни как строки '1', '2', ..., '31'
4. **Анимация модалки** — `animationType="fade"` соответствует существующим модалкам

---

## Оценка трудозатрат

- Создание типов и констант: ~15 мин
- Создание MetricSelectorModal: ~30 мин
- Создание hardcoded данных: ~20 мин
- Интеграция в DayStatistic: ~30 мин
- Тестирование и полировка: ~20 мин

**Итого: ~2 часа**
