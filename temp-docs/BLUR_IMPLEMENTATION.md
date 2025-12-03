# Реализация Blur-эффекта с радиальным градиентом

## Дата: 2025-10-23

## Что реализовано

Добавлен blur-эффект с **радиальным градиентом**, исходящим из нижнего центра кнопки, для компонентов `RadioSelect` и `CheckboxSelect`.

## Архитектура

### Компоненты

1. **`RadioSelectOption.tsx`** - отдельный компонент для radio-опции с blur-анимацией
2. **`CheckboxSelectOption.tsx`** - отдельный компонент для checkbox-опции с blur-анимацией

**Почему отдельные компоненты?**
- React Hooks (useRef, useEffect) нельзя вызывать внутри циклов (map)
- Каждая опция управляет своей анимацией независимо
- Чистая архитектура и переиспользуемость

### Технологический стек

- **`expo-blur`** (v15.0.7) - BlurView для нативного blur-эффекта
- **`react-native-svg`** (v15.12.1) - RadialGradient для радиального свечения
- **React Native Animated API** - стандартный API для анимаций (opacity)

**Почему NOT используем:**
- ❌ `expo-linear-gradient` - поддерживает только линейные градиенты
- ❌ `react-native-reanimated` - избыточно, в проекте используется стандартный Animated API
- ❌ CSS `filter: blur()` - не работает в React Native

## Правильная реализация

### 1. BlurView + SVG RadialGradient

```tsx
import { BlurView } from 'expo-blur';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

<AnimatedBlurView
  intensity={isPressed ? 100 : isSelected ? 80 : 50}
  tint="dark"
  style={[styles.blurContainer, { opacity: opacityAnim }]}
  experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
  blurReductionFactor={Platform.OS === 'android' ? 4 : undefined}
>
  <Svg width="100%" height="100%" style={StyleSheet.absoluteFill} 
       viewBox="0 0 100 100" preserveAspectRatio="none">
    <Defs>
      <RadialGradient
        id="radialGlow"
        cx="0.5"      // 50% по горизонтали (центр)
        cy="1"        // 100% по вертикали (низ)
        r="1.2"       // Радиус 120% (покрывает всю кнопку)
        fx="0.5"      // Фокус в центре
        fy="1"        // Фокус внизу
        gradientUnits="objectBoundingBox"
      >
        <Stop offset="0%" stopColor="rgb(197, 246, 128)" stopOpacity="0.7" />
        <Stop offset="25%" stopColor="rgb(197, 246, 128)" stopOpacity="0.6" />
        <Stop offset="40%" stopColor="rgb(197, 246, 128)" stopOpacity="0.45" />
        <Stop offset="55%" stopColor="rgb(197, 246, 128)" stopOpacity="0.25" />
        <Stop offset="70%" stopColor="rgb(197, 246, 128)" stopOpacity="0.12" />
        <Stop offset="85%" stopColor="rgb(197, 246, 128)" stopOpacity="0.04" />
        <Stop offset="100%" stopColor="rgb(197, 246, 128)" stopOpacity="0" />
      </RadialGradient>
    </Defs>
    <Rect x="0" y="0" width="100" height="100" fill="url(#radialGlow)" />
  </Svg>
</AnimatedBlurView>
```

### 2. Правильное позиционирование blur-контейнера

```tsx
blurContainer: {
  position: 'absolute',
  top: 0,        // ← От верха
  left: 0,
  right: 0,
  bottom: 0,     // ← До низа (растягивается на всю высоту)
  borderRadius: 16,
  overflow: 'hidden',
}
```

**⚠️ Критичные ошибки, которых нужно избегать:**

```tsx
// ❌ НЕПРАВИЛЬНО - обрезает градиент!
blurContainer: {
  bottom: 0,      // Привязка к низу
  height: '100%', // + фиксированная высота
  // = градиент не достигает верха
}

// ✅ ПРАВИЛЬНО
blurContainer: {
  top: 0,         // От верха
  bottom: 0,      // До низа
  // = гарантированно покрывает всю высоту
}
```

### 3. Анимация только opacity (без scale)

```tsx
const opacityAnim = useRef(new Animated.Value(0)).current;

useEffect(() => {
  if (isSelected || isPressed) {
    Animated.timing(opacityAnim, {
      toValue: isPressed ? 0.9 : 0.7,
      duration: 300,
      useNativeDriver: true,
    }).start();
  } else {
    Animated.timing(opacityAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }
}, [isSelected, isPressed, opacityAnim]);
```

**Почему БЕЗ scale:**

```tsx
// ❌ НЕПРАВИЛЬНО - scale обрезает градиент!
transform: [{ scale: scaleAnim }]
// При scale: 0.8 градиент уменьшается на 20%
// и НЕ достигает верха кнопки!

// ✅ ПРАВИЛЬНО - только opacity
{ opacity: opacityAnim }
// Градиент всегда покрывает 100% высоты кнопки
```

### 4. SVG настройки для корректной работы RadialGradient

```tsx
<Svg 
  width="100%" 
  height="100%" 
  style={StyleSheet.absoluteFill}
  viewBox="0 0 100 100"           // Нормализованная система координат
  preserveAspectRatio="none"      // Растягивается на любой размер
>
```

**Ключевые параметры RadialGradient:**

- `cx`, `cy` - координаты центра (от 0 до 1 в режиме `objectBoundingBox`)
- `r` - радиус градиента (1.2 = 120% от диагонали bounding box)
- `fx`, `fy` - координаты фокуса (точка максимальной яркости)
- `gradientUnits="objectBoundingBox"` - координаты относительно границ объекта (по умолчанию)

**Почему именно эти значения:**
- `cx="0.5"`, `cy="1"` - центр внизу кнопки
- `r="1.2"` - радиус достаточный чтобы покрыть путь от низа до верхних углов
- `viewBox="0 0 100 100"` - квадратная система координат для корректной работы `objectBoundingBox`

### 5. Android совместимость

```tsx
experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
blurReductionFactor={Platform.OS === 'android' ? 4 : undefined}
```

## Удалённый легаси-код

- ❌ `assets/images/green-circle.png` - попытка анимации через PNG
- ❌ `assets/images/purple-circle.png` - неиспользуемое изображение
- ❌ CSS `filter: 'blur(50px)'` - не работает в React Native
- ❌ `expo-linear-gradient` для blur-эффекта - заменён на `react-native-svg` RadialGradient
- ❌ Анимация `scale` - обрезала градиент, оставлена только `opacity`
- ❌ Позиционирование через `bottom: 0` + `height: '100%'` - заменено на `top: 0` + `bottom: 0`

## Измененные файлы

### Созданные
- `src/shared/ui/RadioSelect/RadioSelectOption.tsx`
- `src/shared/ui/CheckboxSelect/CheckboxSelectOption.tsx`

### Изменённые
- `src/shared/ui/RadioSelect/RadioSelect.tsx` - рефакторинг для использования `RadioSelectOption`
- `src/shared/ui/CheckboxSelect/CheckboxSelect.tsx` - рефакторинг для использования `CheckboxSelectOption`
- `src/screens/survey/ui/SurveyScreen.tsx` - добавлен импорт `CheckboxSelect`

### Удалённые
- `assets/images/green-circle.png`
- `assets/images/purple-circle.png`
- `src/shared/ui/RadioSelect/styles.ts` - неиспользуемые NativeWind стили

## Результат

✅ **Радиальный градиент** от нижнего центра кнопки
✅ **Плавное затухание** до самого верха кнопки
✅ **Чистая анимация** только через opacity (без scale)
✅ **Правильное позиционирование** (top: 0, bottom: 0)
✅ **Кроссплатформенность** (iOS, Android, Web)
✅ **Высокая производительность** (useNativeDriver: true)
✅ **Чистая архитектура** без легаси-кода
✅ **Соответствие React Hooks правилам** (отдельные компоненты для опций)

## Ключевые уроки

### 1. Позиционирование blur-контейнера
**Всегда используйте `top: 0` + `bottom: 0`** для растягивания на полную высоту. Комбинация `bottom: 0` + `height: '100%'` непредсказуема.

### 2. RadialGradient в SVG
- Используйте `gradientUnits="objectBoundingBox"` (по умолчанию)
- Координаты от `0` до `1` (не проценты!)
- `viewBox` + `preserveAspectRatio="none"` для корректного масштабирования
- Радиус `r="1.2"` оптимален для покрытия от низа до верха

### 3. Анимации в React Native
- `transform: [{ scale }]` масштабирует от центра по умолчанию
- React Native **не поддерживает** `transformOrigin`
- Для blur-эффекта достаточно анимации `opacity`
- Всегда используйте `useNativeDriver: true` для производительности

### 4. React Hooks в циклах
- **Нельзя** вызывать `useRef`/`useEffect` внутри `map`
- Создавайте отдельные компоненты для элементов списка
- Каждый компонент управляет своим состоянием

### 5. Отладка градиентов
Когда градиент "не доходит до верха":
1. Проверьте позиционирование контейнера (`top: 0` vs `bottom: 0`)
2. Проверьте анимацию `scale` (убирает 20% при scale: 0.8)
3. Проверьте `overflow: 'hidden'` - он может обрезать содержимое
4. Увеличьте радиус `r` в `RadialGradient`

## Context 7 документация

При работе с новыми библиотеками всегда проверяйте:
- **`react-native-svg`** - для RadialGradient, Defs, Stop
- **`expo-blur`** - для BlurView и платформо-специфичных настроек
- **React Native Animated API** - для правильного использования анимаций

## Финальная архитектура

```
TouchableOpacity (кнопка)
└── AnimatedBlurView (position: absolute, top: 0, bottom: 0)
    └── Svg (viewBox="0 0 100 100", preserveAspectRatio="none")
        └── RadialGradient (cx="0.5", cy="1", r="1.2")
            └── Stop[] (7 точек от 0% до 100% с плавным затуханием opacity)
```

Эта архитектура гарантирует, что blur-эффект с радиальным градиентом всегда покрывает всю высоту кнопки, независимо от её размера.
