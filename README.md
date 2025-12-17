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
├── app/              # Инициализация, провайдеры, роутинг (Expo Router)
├── pages/            # Страницы (композиция features + entities)
├── widgets/          # Составные блоки (header, chat, pose-camera, profile)
├── features/         # Бизнес-фичи (auth, survey-flow, chat, training, user, dairy)
├── entities/         # Бизнес-сущности (survey, pose, chat, training)
└── shared/           # Переиспользуемый код (ui, api, lib, config, constants)
```

**Правила изоляции:**

- `entities` → только `shared`
- `features` → `entities` + `shared`
- `widgets` → `entities` + `shared` (чистые UI компоненты)
- `pages` → `features` + `widgets` + `entities` + `shared`
- `app` → все слои

---

## 📂 Основные модули

### App Layer

- **`_layout.tsx`** — корневой layout (Expo Router + ErrorBoundary)
- **`_providers/`** — глобальные провайдеры (SafeArea, TanStack Query, FontLoader)
- **Роуты**: `landing`, `auth`, `register`, `forgot-password`, `verification`, `survey`, `home`, `chat`, `diary`, `stats`, `profile`, `settings`, `change-password`, `privacy-policy`, `terms`, `training`

### Pages

- `landing/` — Onboarding screen
- `auth/` — Экраны авторизации (`AuthScreen`, `RegisterScreen`, `ForgotPasswordScreen`)
- `verification/` — Экран верификации кода
- `survey/` — Многошаговый опрос (компоненты шагов в `ui/components/steps/`)
- `home/` — Главный экран
- `chat/` — ИИ-ассистент чат
- `diary/` — Дневник тренировок
- `stats/` — Статистика пользователя
- `profile/` — Модуль профиля пользователя (`ProfileScreen`, `SettingsScreen`, `ChangePasswordScreen`, `PrivacyPolicyScreen`, `TermsOfServiceScreen`)
- `(training)/` — Тренировки (`session`, `report`, `[trainingId]`)

### Features

**`auth/`**
- API: `authApi` (регистрация, вход, отправка кода)

**`survey-flow/`**
- `useSurveyFlow` — хук управления опросом
- `surveyApi` — отправка данных опроса

**`chat/`**
- `chatApi` — API чата (real-only: `/chat`, `/chat/latest`, `/chat/message`, `/chat/upload`; `env.API_URL` задаёт базу)
- `model` — хуки `useChatQueries` (offset/limit infiniteQuery), `useSendMessage` (оптимистичный user + ответ ассистента), `useAttachmentUpload` (upload + прогресс), `useChatStore` (pending attachments)

**`training/`**
- `trainingApi` — API тренировок
- `queryKeys` — ключи для React Query

**`user/`**
- `userApi` — API пользователя (профиль, аватар, пароль, уведомления)
- `useProfileQuery` — хук получения профиля

**`dairy/`**
- `dairyApi` — API дневника тренировок

### Widgets

**`chat/`**
- UI: `ChatHeader`, `MessageList`, `MessageBubble`, `MessageInput`, `AttachmentPicker`, `TypingIndicator`, `AudioPlayer`, `FileAttachment`
- Lib: `useAudioRecorder`, `useAudioPlayer`, `useFilePicker`

**`profile/`**
- UI: `ProfileHeader`, `SettingsSection`, `FAQAccordion`

**`training-session/`**
- `OnboardingFlow` — подготовка к тренировке (камера, звук, положение)
- `ExerciseFlow` — основной флоу выполнения упражнений (FSM):
  - Инициализация: стартовый шаг `theory` (если `showTutorial`), иначе `position`. Состояния: текущий шаг, сторона (`right/left`), тип отдыха (`rep/set/exercise`), фаза отдыха (`main/practice`), счётчики повторов/сетов, индекс упражнения.
  - Ориентация: перед стартом сверяет требуемую ориентацию (`is_horizontal`). Если не совпадает, показывает `rotate`, затем возвращает в стартовый шаг.
  - Базовый маршрут шагов: `theory → position → execution → rest` (без смены стороны) либо `theory → position → execution → rest → side_switch → execution → rest` (для зеркальных `is_mirror`).
  - Выполнение (`execution`): после завершения подхода сбрасывает повторы. Для зеркальных упражнений: первая сторона уводит в `rest (rep)` с флагом смены стороны → `side_switch` → вторая сторона завершает сет и либо уходит на `rest (set/exercise)`, либо завершает тренировку. Для не-зеркальных: завершает сет и идёт в `rest (set/exercise)` или завершает тренировку.
  - Отдых (`rest`): тип зависит от контекста (`rep`=5с, `set`=`rest_between_sets` или 15с по умолчанию, `exercise`=`rest_after_exercise` или 30с). Если длительность >10с, делится на `main` и `practice`: сначала `RestScreen` на `base - 10`, затем `ExerciseTheoryScreen` (practice, 10с, может использовать `video_practice`).
  - Переходы отдыха: `rep` → возвращает в `execution` или запускает `side_switch`; `set` → сбрасывает сторону на `right`, идёт в `position`; `exercise` → выбирает следующее упражнение или `finishTraining()`.
  - Экранные компоненты по шагам: `rotate` → `RotateScreen`; `theory/practice` → `ExerciseTheoryScreen`; `position/side_switch` → `BodyPositionScreen` (со спец. заголовком для смены стороны); `execution` → `ExerciseExecutionScreen`; `rest` (main) → `RestScreen`.
- `TrainingInfo`, `TrainingAnalytics` — инфо-панели
- Экраны: `AIExerciseScreen`, `BodyPositionScreen` (кастомные заголовок/подзаголовок через пропсы), `ExerciseTheoryScreen`, `RestScreen`, `ExerciseSuccess`

**`pose-camera/`**
- `PoseCamera` — камера с анализом движений
- `usePoseCameraSetup` — настройка камеры

**`navigation-bar/`**, **`header/`**, **`footer/`** — Навигационные компоненты

### Entities

**`chat/`**
- `types.ts`, `mappers.ts` — типы и мапперы сообщений

**`survey/`**
- `calculator.ts`, `validator.ts` — логика расчета ИМТ и валидации
- `constants.ts` — константы конфигурации

**`pose/`**
- `analyzer.ts` — анализ keypoints

**`training/`**
- `useTrainingStore.ts` — Zustand store тренировки
- `types.ts` — типы тренировок

### Shared

**`api/`**
- `client.ts` — Axios/Fetch клиент с интерцепторами

**`ui/`** — UI Kit (частичный список):
- Кнопки: `Button`, `GlowButton`, `BackButton`, `BottomActionBtn`, `CloseBtn`, `ControlButton`, `CircleIconButton`
- Ввод: `Input`, `Checkbox`, `Switch`, `RadioSelect`, `CheckboxSelect`
- Индикаторы: `Loader`, `DotsProgress`, `StepProgress`, `ProgressBar`, `VideoProgressBar`
- Карточки: `FeatureCard`, `MetricCard`, `StatCard`, `ExerciseInfoCard`
- Лейаут: `Container`, `SafeAreaContainer`, `BackgroundLayout`, `GradientBG`
- Разное: `Icon`, `Avatar`, `Chip`, `InfoTag`, `Toast`, `ConfirmModal`, `LargeNumberDisplay`

**`lib/`**
- `auth.ts` — управление токенами
- `formatters.ts` — форматирование данных
- `useFonts.ts` — загрузка шрифтов
- `useOrientation.ts`, `useStatusBar.ts`, `useNavbarLayout.ts`
- `useBeepSound.ts` — звуковые эффекты
- `media/pickAvatarImage.ts` — выбор аватара

---

## 🏋️ PoseFlow-JS Engine

Движок анализа упражнений с FSM для подсчёта повторений (`poseflow-js/`):

- **Core**: `ExerciseEngine.ts`, `normalizer.ts`, `smoothers.ts`
- **Features**: расчет углов (`angles.ts`), осей (`axes.ts`), высот (`heights.ts`)
- **FSM**: `RepCounterFSM.ts` — конечный автомат повторений
- **Rules**: JSON конфигурации упражнений (`crunch`, `squat`, `hip_bridge` и др.)

---

## 🎨 Стилизация

Используется **NativeWind 4** (Tailwind CSS для React Native).

- **Шрифты**: Rimma Sans (Regular, Bold)
- **Цвета**: Кастомная палитра (`brand-green`, `brand-purple`, `bg-dark`, `light-text`)
- **Анимации**: React Native Reanimated 4

---

## 📚 Технологический стек

| Категория | Технология |
| --- | --- |
| **Core** | React Native 0.81.5, React 19.1.0 |
| **Framework** | Expo SDK 54 |
| **Язык** | TypeScript 5.9.3 |
| **Стилизация** | NativeWind 4.2.1 |
| **Роутинг** | Expo Router 6 |
| **Server State** | TanStack Query 5.90 |
| **Client State** | Zustand 5.0.8 |
| **Computer Vision** | MediaPipe, TensorFlow.js |
| **Media** | expo-av, expo-camera, expo-video |
| **Package Manager** | pnpm 10.19.0 |

---

## 🛠️ Разработка

### Скрипты (pnpm)

```bash
pnpm start              # Dev сервер
pnpm android            # Android build
pnpm ios                # iOS build
pnpm web                # Web build

pnpm run check          # Полная проверка (format + lint + type-check)
pnpm run lint:fix       # Автофикс линтинга
pnpm run generate:api   # Генерация Orval-клиента (OpenAPI → hooks + схемы)
```

### Makefile

```bash
make start      # Запуск
make check      # Проверка кода
make install    # Установка зависимостей
make doctor     # Диагностика
make clean      # Очистка кэша
```

---

## 📱 Платформы

- ✅ **iOS**: Deployment target 15.1
- ✅ **Android**: Min SDK 24, Target SDK 35
- ✅ **Web**: Static export supported

---

## 👥 Команда

Разработка: [Yzned Team](https://github.com/yzned)
