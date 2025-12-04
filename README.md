# Fitchoice Mobile App

Мобильное приложение для фитнес-тренировок с анализом позы и ИИ-ассистентом на базе **Expo + React Native**.

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
├── widgets/          # Составные блоки (header, chat, pose-camera)
├── features/         # Бизнес-фичи (auth, survey-flow, chat, training)
├── entities/         # Бизнес-сущности (survey, pose, chat, training)
└── shared/           # Переиспользуемый код (ui, api, lib, config)
```

**Правила изоляции:**

- `entities` → только `shared`
- `features` → `entities` + `shared`
- `widgets` → `entities` + `shared` (чистые UI хуки)
- `pages` → `features` + `widgets` + `entities` + `shared`
- `app` → все слои

---

## 📂 Основные модули

### App Layer

- **`_layout.tsx`** — корневой layout (Expo Router + ErrorBoundary)
- **`_providers/`** — глобальные провайдеры (SafeArea, TanStack Query, FontLoader)
- **Роуты**: landing, auth, register, verification, survey, home, chat, training

### Pages

- `landing/` — Onboarding screen
- `auth/`, `register/`, `verification/` — Аутентификация
- `survey/` — Многошаговый опрос (14 шагов)
- `home/` — Главный экран
- `chat/` — ИИ-ассистент чат
- `pose/` — Анализ позы (MediaPipe)
- `training/` — Тренировки

### Features

**`auth/`**
- API: `sendCode`, `registration`, `login`, `refresh`

**`survey-flow/`**
- Zustand store для управления опросом
- UI state: `currentStep`, `totalSteps` (14 шагов)
- Данные: `surveyData` (имя, пол, возраст, цели, рост/вес, ИМТ)

**`chat/`**
- `chatApi` — API для истории, отправки сообщений, загрузки файлов, SSE стриминга
- `useChatHistory` — TanStack Query infinite scroll для истории
- `useSendMessage` — мутация отправки с optimistic updates
- `useStreamResponse` — стриминг AI ответов через SSE
- `useChatStore` — Zustand для pending attachments
- `useAttachmentUpload` — загрузка файлов с прогрессом

**`training/`**
- API: `getTrainingPlan`, `getTrainingProgram`
- Store: управление тренировочной сессией

**`user/`**
- API: `updateUser`, `buildTrainingPlan`

### Widgets

**`chat/`**
- `ChatHeader` — шапка с градиентом, blur, BackButton
- `MessageList` — FlashList с infinite scroll
- `MessageBubble` — пузыри сообщений (user/assistant)
- `MessageInput` — ввод текста, запись аудио, вложения
- `AudioPlayer` — воспроизведение голосовых
- `AttachmentPicker` — popup выбора файлов
- `TypingIndicator` — анимация печати AI
- `useAudioRecorder` — запись аудио (expo-av)
- `useAudioPlayer` — воспроизведение аудио
- `useFilePicker` — выбор изображений/документов

**`training-session/`**
- Управление тренировкой, анализ ошибок

**`navigation-bar/`**
- Нижняя навигация

### Entities

**`chat/`**
- `types.ts` — `Message`, `Attachment`, `MessageRole`, `AttachmentType`
- `mappers.ts` — маппинг DTO ↔ Domain entities
- `WELCOME_MESSAGE` — приветственное сообщение

**`survey/`**
- `types.ts` — `Gender`, `Goal`, `Direction`, `SurveyData`, `BMICategory`
- `calculator.ts` — `calculateBMI`, `getBMICategory`
- `constants.ts` — опции для селектов

**`pose/`**
- `analyzer.ts` — анализ позы (валидация landmarks, расчет углов)

**`training/`**
- Типы и модели тренировок

### Shared

**`api/`**
- `ApiClient` — централизованный HTTP клиент
- Методы: `get`, `post`, `put`, `delete`, `upload`
- Автоматическая авторизация (Bearer token из `expo-secure-store`)
- Обработка 401 → logout + редирект на `/auth`
- `types.ts` — API DTO типы

**`ui/`** — UI Kit компоненты:
- `Button` — варианты (primary, secondary, ghost), размеры (xs, s, l)
- `GlowButton` — кнопка с анимированной подсветкой
- `Input` — варианты (text, password, dropdown, textarea)
- `RadioSelect`, `CheckboxSelect` — выбор опций
- `BackButton` — кнопка "назад" с safe area support
- `Icon` — 70+ SVG иконок (включая chat иконки)
- `GradientBG/` — градиентные фоны (GradientHeader, GradientBg)
- `BackgroundLayout` — layout с фоновым градиентом
- `AuthGuard`, `ErrorBoundary`, `QueryBoundary`

**`lib/`**
- `useFonts` — загрузка кастомных шрифтов
- `useOrientation` — блокировка ориентации экрана
- `formatters.ts` — `formatDuration`, `formatFileSize`
- `utils.ts` — `generateId`

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
- `Inter` — для основного текста

**Safe area:**

- `pt-safe-top`, `pb-safe-bottom`, `pl-safe-left`, `pr-safe-right`

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
| **Audio**           | expo-av (recording/playback)      |
| **Media**           | expo-image-picker, expo-document-picker |
| **Secure Storage**  | expo-secure-store (tokens)        |
| **Lists**           | @shopify/flash-list               |

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
pnpm run lint           # ESLint
pnpm run lint:fix       # ESLint с автофиксом
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
make lint-fix   # Автофикс линтинга
make start      # Запуск dev сервера
make android    # Android
make ios        # iOS
make install    # Установка всех зависимостей (pnpm + pods)
make rebuild    # Полная пересборка
```

### Качество кода

- ✅ TypeScript strict mode
- ✅ ESLint
- ✅ Prettier для единого стиля
- ✅ FSD architecture

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

## 📱 Платформы

- ✅ **iOS**: `com.yzned.Fitchoice`
- ✅ **Android**: `com.yzned.Fitchoice`
- ✅ **Web**: static export

### Permissions

**iOS**: Camera, Microphone, Photo Library  
**Android**: CAMERA, READ/WRITE_EXTERNAL_STORAGE, RECORD_AUDIO, MODIFY_AUDIO_SETTINGS

---

## 👥 Команда

Разработка: [Yzned Team](https://github.com/yzned)
