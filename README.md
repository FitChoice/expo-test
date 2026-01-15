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

## Онбординг перед тренировкой

Флоу отвечает за проверку условий перед стартом тренировки и живёт в `src/widgets/training-session/ui/OnboardingFlow.tsx`.

1. **Проверка звука** (`sound`):
   - Экран `SoundCheckScreen`.
   - Пользователь подтверждает, что звук включён.
2. **Разрешение камеры** (`camera`):
   - Экран `CameraPermissionScreen`.
   - Запрашивается доступ к камере, без него флоу не продолжает.
3. **Поворот телефона (если нужно)** (`rotate`):
   - Экран `RotatePhoneScreen`.
   - Если первое упражнение горизонтальное (`currentExerciseDetail.is_horizontal`), просим повернуть телефон.
4. **Позиционирование телефона** (`position`):
   - Экран `PhonePositionScreen`.
   - Для вертикальных упражнений: ставим телефон вертикально, камера направлена на пользователя.
5. **Калибровка уровня** (`gyroscope`):
   - Экран `GyroscopeLevelScreen`.
   - Читаем сенсоры, нормализуем оси по ориентации, отображаем угол наклона.
   - Условие готовности: угол близок к `0°` (|angle| ≤ 5).
6. **Старт тренировки**:
   - `resume()` переводит тренировку из `onboarding` в `running`.

Порядок шагов:
`sound` → `camera` → (`rotate` | `position`) → `gyroscope` → `running`

## Выполнение упражнения

Процесс выполнения упражнения управляется через стейт-машину в `useTrainingFlow` и визуализируется в `ExerciseFlow`. Основные этапы:

1.  **Проверка ориентации** (`rotate`):
    *   Автоматический контроль соответствия положения устройства (Portrait/Landscape) требованиям упражнения (`is_horizontal`).
    *   Если ориентация не совпадает, выполнение блокируется до поворота устройства.
2.  **Теория и подготовка** (`theory`):
    *   Отображается, если включен флаг `showTutorial` в `useTrainingStore`.
    *   Показывает обучающее видео и запускает обратный отсчет перед началом.
3.  **Позиционирование** (`position`):
    *   AI-анализ через `PoseCamera` проверяет видимость всех 17 ключевых точек тела.
    *   Автоматический переход в режим выполнения происходит после **1.5 секунд** стабильного удержания тела внутри контура.
    *   Этот шаг повторяется перед каждым сетом и после смены стороны.
4.  **Выполнение** (`execution`):
    *   Запуск `ExerciseEngine` с правилами конкретного упражнения (`rules/*.json`).
    *   Детекция фаз движения (Top -> Down -> Bottom -> Up) и подсчет повторов.
    *   При достижении целевого количества повторов (`exercise.reps`) выдерживается пауза 2 секунды перед завершением сета.
    *   Обновление текущего прогресса (`currentReps`) в `useTrainingStore` в реальном времени.
5.  **Отдых и смена стороны** (`rest` / `side_switch`):
    *   **Между подходами:** После завершения подхода запускается отдых (`restType: 'set'`) длительностью `rest_between_sets`. После него возвращаемся на этап `position`.
    *   **Между сторонами (mirror):** Для упражнений с `is_mirror: true` после завершения всех подходов на первую сторону (обычно правую) запускается этап `side_switch`. Счётчики повторов и подходов сбрасываются, и упражнение выполняется заново для второй стороны.
    *   **Между упражнениями:** После завершения всех подходов (и сторон) запускается отдых (`restType: 'exercise'`) длительностью `rest_after_exercise`, затем переход к следующему упражнению (начиная с шага `rotate`).
    *   **Завершение:** После последнего сета последнего упражнения отдых не показывается.
6.  **Синхронизация и завершение**:
    *   **Отправка упражнения:** После завершения всех сторон упражнения данные (ID, общее кол-во повторов, качество) отправляются на бэк через `onExecuteExercise`.
    *   **Завершение тренировки:** После последнего упражнения вызывается `onCompleteTraining` с итоговой аналитикой за всю сессию и состояние тренировки переходит в `finished`.

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
