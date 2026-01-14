# Fitchoice Mobile App

Мобильное фитнес‑приложение на **Expo + React Native** (FSD): тренировки с контролем позы, дневник, чат, статистика и фото‑прогресс. Роутинг — **Expo Router**, состояние сервера — **TanStack Query**.

## Быстрый старт

```bash
pnpm install          # зависимости
pnpm start            # Metro
pnpm android | pnpm ios | pnpm web

pnpm run check        # format + lint (+warn≤10) + type-check
make start | make check | make clean | make doctor
```

Требования: `pnpm 10.19.0`, Node 18+, Expo SDK 54.

## Архитектура

- FSD слои: `app/` (инит, провайдеры, маршруты), `pages/` (композиция), `widgets/` (составные блоки), `features/` (бизнес-флоу), `entities/` (доменные данные/стороны), `shared/` (UI kit, lib, api, constants).
- Алиас путей: `@/*`.
- Провайдеры (`app/_layout.tsx`): ErrorBoundary → SafeAreaProvider → FontLoader → TanStack Query (staleTime 5 мин, gcTime 10 мин, toasts на ошибках).
- Основные роуты: `landing`, `auth`, `register`, `forgot-password`, `verification`, `survey`, `home`, `chat`, `diary`, `stats`, `stats-day`, `photo-progress`, `profile`, `settings`, `change-password`, `privacy-policy`, `terms`, `(training)/[trainingId|session|report]` и вспомогательные `*_count`.

## Технологии

- React Native 0.81.5, React 19.1.0, TypeScript 5.9
- Expo SDK 54, Expo Router 6
- Стили: NativeWind 4 (Tailwind для RN), шрифты Rimma Sans
- Server state: TanStack Query 5; Client state: точечно Zustand 5
- CV/Pose: TensorFlow.js + MoveNet, poseflow-js, MediaPipe
- Media: expo-camera, expo-media-library, expo-av/video
- Интеграции: expo-notifications, expo-secure-store

## API и данные

- HTTP клиент: `shared/api/apiClient` (REST); user API в `features/user/api`.
- Auth: user_id и токены в SecureStore (`shared/lib/auth`); без user_id запросы профиля не стартуют.
- Аватар: `useUploadAvatar` — presign → PUT в бакет по presign URL → финальный CDN `https://storage.yandexcloud.net/fitdb/{fileName}` → `updateUser`; кэш профиля `['profile', userId]` обновляется и инвалидируется.

## Выполнение упражнения

1.  **Теория и подготовка** (`theory`):
    *   Отображение обучающего видео.
    *   Обратный отсчет.
2.  **Проверка ориентации** (`rotate`):
    *   Контроль соответствия положения устройства (Portrait/Landscape) требованиям упражнения.
    *   Автоматический переход при повороте экрана.
3.  **Позиционирование** (`position`):
    *   AI-анализ через `PoseCamera`.
    *   Проверка видимости всех 17 ключевых точек тела в контуре.
    *   Автоматический старт после 1.5 сек стабильного удержания позы.
4.  **Выполнение** (`execution`):
    *   Запуск `ExerciseEngine` с правилами конкретного упражнения (`rules/*.json`).
    *   Детекция фаз движения (Top -> Down -> Bottom -> Up) и подсчет повторов.
    *   Обновление глобального прогресса в `useTrainingStore` в реальном времени.
5.  **Смена стороны** (`side_switch`):
    *   Для односторонних упражнений (mirror).
    *   Повторный этап позиционирования для новой рабочей стороны.
6.  **Отдых** (`rest`):
    *   Таймер отдыха между подходами или упражнениями.
    *   Опциональное отображение видео с практикой/коррекцией техники.

## Фото‑прогресс (кратко)

- Хранилище: `expo-file-system/legacy`, путь `documentDirectory/progress/<userId>/<side>/<id>.<ext>`, мета `index.json`.
- Запросы/мутации: `useProgressListQuery`, `useSaveProgressBatchMutation`, `useDeleteProgressPhotoMutation`, `useResetProgressMutation`, `useProgressSeriesQuery`; все с invalidate.
- Флоу съёмки (`features/progress-capture`): шаги CameraPermission → PhonePosition → PositionReady (PoseCamera) → CountdownCapture → PreviewScreen → FinalScreen (пересъёмка стороны, опционально сохранение в галерею).
- Просмотр (`pages/photo-progress`): если данных нет — старт съёмки; иначе `ExistingPhotosScreen` с батчами и окнами в 30 дней; `PhotoSetShow` показывает выбранный батч.

## Стили

- NativeWind с кастомной палитрой (`brand-*`, `light-text`, `bg-dark`).
- UI kit в `shared/ui` (кнопки, лейауты, тосты, StepProgress, BackgroundLayout и др.).
- Градиенты/фоновые компоненты для онбординга и фото-флоу; шрифты грузятся через `FontLoader`.

## Скрипты

- `pnpm run lint` — `eslint src --ext .ts,.tsx --max-warnings 10`
- `pnpm run format` / `format:check` — Prettier (tailwind plugin)
- `pnpm run type-check` — `tsc --noEmit`
- EAS: `pnpm run deploy`, `pnpm run update:preview`, `pnpm run update:production`, `pnpm run build:preview:*` (см. `package.json`).

## Платформы

- Портрет по умолчанию (Expo `orientation: "portrait"`).
- iOS: deployment target 15.1, разрешения на камеру/микрофон/галерею в `app.json`.
- Android: minSdk 24, targetSdk 35, edge-to-edge, Proguard/shrink в release.

## Полезные пути

- `src/features/user/hooks/useUploadAvatar.ts` — загрузка аватара (presign → PUT → updateUser).
- `src/entities/progress/lib/storage.ts` — файловое хранилище фото‑прогресса.
- `src/features/progress-capture/ui/*` — шаги флоу съёмки.
- `src/widgets/pose-camera` — PoseCamera и MoveNet.
- `src/app/_providers` — конфигурация провайдеров и QueryClient.
