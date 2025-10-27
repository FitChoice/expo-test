# Fitchoice Mobile App

Мобильное приложение для фитнес-тренировок с анализом позы на базе **Expo + React Native**.

## 📦 Быстрый старт

```bash
# Установка зависимостей
pnpm install

# Запуск dev сервера
pnpm start

# Запуск на платформах
pnpm android    # Android
pnpm ios        # iOS
pnpm web        # Web

# Проверка кода
make check      # Полная проверка (prettier + eslint + typescript)
```

---

## 🏗️ Архитектура

Проект построен по принципам **Feature-Sliced Design (FSD)** с четким разделением слоев:

```
src/
├── app/              # Инициализация, провайдеры, роутинг
├── pages/            # Страницы (композиция features + entities)
├── widgets/          # Составные блоки (header, footer, pose-camera)
├── features/         # Бизнес-фичи (auth, survey-flow, user)
├── entities/         # Бизнес-сущности (survey, pose)
└── shared/           # Переиспользуемый код (ui, api, lib, config)
```

**Правила изоляции:**

- `entities` → только `shared`
- `features` → `entities` + `shared`
- `pages` → `features` + `entities` + `shared`
- `app` → все слои

---

## 📂 Основные модули

### App Layer

- **`_layout.tsx`** — корневой layout (Expo Router + ErrorBoundary)
- **`_providers/`** — глобальные провайдеры (SafeArea, TanStack Query, FontLoader)
- **Роуты**: landing, auth, register, verification, survey, home

### Pages

- `landing/` — Onboarding screen
- `auth/`, `register/`, `verification/` — Аутентификация
- `survey/` — Многошаговый опрос (14 шагов)
- `home/` — Главный экран
- `pose/` — Анализ позы (MediaPipe)

### Features

**`auth/`**

- API: `sendCode`, `registration`, `login`, `refresh`

**`survey-flow/`**

- Zustand store для управления опросом
- UI state: `currentStep`, `totalSteps` (14 шагов)
- Данные: `surveyData` (имя, пол, возраст, цели, рост/вес, ИМТ)
- Методы: `updateName`, `updateGender`, `calculateBMI`, `nextStep`, `submitSurvey`

**`user/`**

- API: `updateUser`, `buildTrainingPlan`, `getTrainingProgram`

### Entities

**`survey/`**

- `types.ts` — типы (`Gender`, `Goal`, `Direction`, `SurveyData`, `BMICategory`)
- `calculator.ts` — `calculateBMI`, `getBMICategory`
- `validator.ts` — `validateSurveyData`
- `constants.ts` — опции для селектов (пол, возраст, цели, направления)

**`pose/`**

- `analyzer.ts` — анализ позы (валидация landmarks, расчет углов)
- `types.ts` — типы для pose data

### Shared

**`api/`**

- `ApiClient` — централизованный HTTP клиент
- Автоматическая авторизация (Bearer token из `expo-secure-store`)
- Обработка 401 → logout + редирект на `/auth`

**`ui/`** — UI Kit компоненты:

- `Button` — варианты (primary, secondary, ghost), размеры (xs, s, l)
- `GlowButton` — кнопка с анимированной подсветкой (для RadioSelect/CheckboxSelect)
- `Input` — варианты (text, password, dropdown, textarea)
- `RadioSelect`, `CheckboxSelect` — выбор опций
- `BackButton` — кнопка "назад" с safe area support
- `Icon` — 65 SVG иконок
- `AuthGuard`, `ErrorBoundary`, `QueryBoundary`

**`lib/`**

- `useFonts` — загрузка кастомных шрифтов
- `useOrientation` — блокировка ориентации экрана

**`config/`**

- `env` — переменные окружения (`API_URL`, `isDevelopment`)

---

## 🎨 Стилизация

Используется **NativeWind 4** (Tailwind CSS для React Native).

**Кастомная палитра:**

- Brand: `brand-green-500/900`, `brand-purple-300/500/900`
- Fill: `fill-100` через `fill-900`
- Text: `light-text-100/200/500/900`
- Feedback: `feedback-negative-900`, `feedback-positive-900`

**Кастомные шрифты:**

- `font-rimma`, `font-rimma-bold`

**Safe area:**

- `pt-safe-top`, `pb-safe-bottom`, `pl-safe-left`, `pr-safe-right`

**Breakpoints:**

- xs: 320px, sm: 375px, md: 414px, lg: 768px, xl: 1024px

---

## 📚 Технологический стек

| Категория           | Технология                        |
| ------------------- | --------------------------------- |
| **Core**            | React Native 0.81.5, React 19.1.0 |
| **Framework**       | Expo SDK 54                       |
| **Язык**            | TypeScript 5.9 (strict mode)      |
| **Стилизация**      | NativeWind 4 (Tailwind CSS)       |
| **Роутинг**         | Expo Router 6 (file-based)        |
| **Server State**    | TanStack Query 5                  |
| **Client State**    | Zustand 5                         |
| **Анимации**        | React Native Reanimated 4         |
| **Computer Vision** | MediaPipe (pose detection)        |
| **Secure Storage**  | expo-secure-store (tokens)        |

---

## 🔧 Конфигурация

### TypeScript

Strict mode включен (`tsconfig.json`):

- `strict: true`
- `strictNullChecks: true`
- `noUncheckedIndexedAccess: true`

### Path Aliases

```typescript
@/* → ./src/*
@/shared/* → ./src/shared/*
@/entities/* → ./src/entities/*
@/features/* → ./src/features/*
```

### Metro Config

- Path aliases: `@` → `./src`
- SVG support: `react-native-svg-transformer`
- NativeWind: автоматическая обработка `global.css`
- Performance: `inlineRequires: true`, удаление `console.log` в production

---

## 🛠️ Разработка

### Скрипты

```bash
# Проверки кода
pnpm run type-check     # TypeScript
pnpm run lint           # ESLint (max-warnings: 0)
pnpm run format         # Prettier
pnpm run check          # Полная проверка

# Запуск
pnpm start              # Dev сервер
pnpm android            # Android
pnpm ios                # iOS
pnpm web                # Web
```

### Makefile команды

```bash
make check      # Полная проверка кода
make start      # Запуск dev сервера
make android    # Android
make ios        # iOS
```

### Качество кода

- ✅ TypeScript strict mode (0 errors)
- ✅ ESLint max-warnings: 0
- ✅ Prettier для единого стиля
- ✅ 100% FSD compliance

---

## 🚀 Сборка

### Web Deploy

```bash
pnpm run deploy  # export + EAS deploy
```

### Native Builds

```bash
pnpm exec eas-cli build --platform ios
pnpm exec eas-cli build --platform android
```

---

## 📖 Примеры использования

### Работа с API

```typescript
import { authApi } from '@/features/auth'
import { userApi } from '@/features/user'

// Аутентификация
const result = await authApi.sendCode(email)
if (result.success) {
	console.log(result.data) // TokenResponse
} else {
	console.error(result.error)
}

// Работа с пользователем
const program = await userApi.getTrainingProgram(userId)
```

### Работа с state (Zustand)

```typescript
import { useSurveyFlow } from '@/features/survey-flow'

const {
	surveyData,
	currentStep,
	updateName,
	updateGender,
	calculateBMI,
	nextStep,
	submitSurvey,
} = useSurveyFlow()

updateName('Иван')
updateGender('male')
calculateBMI()
nextStep()
```

### Работа с типами

```typescript
import type { Gender, Goal, SurveyData } from '@/entities/survey'
import { calculateBMI, GENDER_OPTIONS, GOAL_OPTIONS } from '@/entities/survey'

const gender: Gender = 'male'
const goals: Goal[] = ['strength', 'flexibility']
const bmi = calculateBMI(180, 75) // 23.15
```

### UI компоненты

```tsx
import { Button, Input, RadioSelect, Icon } from '@/shared/ui'

// Кнопка
<Button variant="primary" size="l" iconLeft={<Icon name="check" />}>
  Сохранить
</Button>

// Input
<Input
  variant="text"
  label="Email"
  value={email}
  onChangeText={setEmail}
  error={emailError}
/>

// RadioSelect
<RadioSelect
  options={GENDER_OPTIONS}
  value={gender}
  onChange={(value) => setGender(value as Gender)}
/>
```

### Стилизация с NativeWind

```tsx
<View className="flex-1 bg-fill-100 pt-safe-top">
	<Text className="font-rimma text-xl text-light-text-900">Fitchoice</Text>
	<Button className="mt-4" variant="primary">
		Начать
	</Button>
</View>
```

---

## 📱 Платформы

- ✅ **iOS**: `com.yzned.Fitchoice`
- ✅ **Android**: `com.yzned.Fitchoice`
- ✅ **Web**: static export

### Permissions

**iOS**: Camera (pose detection)  
**Android**: CAMERA, READ/WRITE_EXTERNAL_STORAGE, RECORD_AUDIO

---

## 📝 TODO

### Высокий приоритет

- **AuthGuard**: Реализовать проверку токена и редирект на `/auth`
  - Файл: `src/shared/ui/AuthGuard/AuthGuard.tsx`
  - Сейчас: просто возвращает `children`

- **Survey Submission**: Отправка данных опроса на сервер
  - Файл: `src/features/survey-flow/model/useSurveyFlow.ts`
  - Сейчас: только `console.warn`

### Средний приоритет

- **ErrorBoundary**: Интегрировать Sentry для отслеживания ошибок
- **Testing**: Добавить unit/integration/e2e тесты

---

## 📄 Документация

- `swagger.yaml` — OpenAPI спецификация backend API
- `refactor.md` — история архитектурных изменений

---

## 👥 Команда

Разработка: [Yzned Team](https://github.com/yzned)
