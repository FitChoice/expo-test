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

## 🎨 Стилизация

Используется **NativeWind 4** (Tailwind CSS для React Native).

- **Шрифты**: Rimma Sans (Regular, Bold)
- **Цвета**: Кастомная палитра (`brand-green`, `brand-purple`, `bg-dark`, `light-text`)
- **Анимации**: React Native Reanimated 4

---

## 📚 Технологический стек

| Категория           | Технология                        |
| ------------------- | --------------------------------- |
| **Core**            | React Native 0.81.5, React 19.1.0 |
| **Framework**       | Expo SDK 54                       |
| **Язык**            | TypeScript 5.9.3                  |
| **Стилизация**      | NativeWind 4.2.1                  |
| **Роутинг**         | Expo Router 6                     |
| **Server State**    | TanStack Query 5.90               |
| **Client State**    | Zustand 5.0.8                     |
| **Computer Vision** | MediaPipe, TensorFlow.js          |
| **Media**           | expo-av, expo-camera, expo-video  |
| **Package Manager** | pnpm 10.19.0                      |

---

## 📂 Текущая структура и ключевые модули (FSD)

### App (Expo Router)
- `_layout.tsx` — корневой layout, ErrorBoundary
- `_providers/` — SafeArea, TanStack Query, FontLoader
- Роуты: `landing`, `auth`, `register`, `forgot-password`, `verification`, `survey`, `home`, `chat`, `diary`, `stats`, `profile`, `settings`, `change-password`, `privacy-policy`, `terms`, `training`, `photo-progress`

### Pages
- `photo-progress/` — экран фото-прогресса: миниатюры 4 ракурсов, запуск флоу съёмки
- `stats/` — статистика, карточка “Фото-прогресс” ведёт на `/photo-progress`
- Остальные: `landing`, `auth`, `survey`, `home`, `chat`, `diary`, `profile`, `(training)/...`

### Features
- `progress-capture/` — флоу съёмки 4 ракурсов (permission → вертикаль → позиция → отсчёт 5s → кадр → превью → финальный экран с сохранением/галереей)
- `auth/`, `survey-flow/`, `chat/`, `training/`, `user/`, `dairy/`, `stats/` — API и бизнес-логика по доменам

### Entities
- `progress/` — локальный домен фото-прогресса: типы, файловое хранение в `documentDirectory`, метаданные `progress/index.json`, TanStack Query (список, сохранение батчем, удаление)
- `chat/`, `survey/`, `pose/`, `training/` — типы, хранилища, вспомогательные функции

### Widgets
- `training-session/` — онбординг/выполнение тренировок (FSM), экраны `BodyPositionScreen`, `ExerciseTheoryScreen`, `RestScreen` и др.
- `chat/`, `profile/`, `navigation-bar/` и пр. — составные UI-блоки

### Shared
- `ui/` — UI Kit (кнопки, инпуты, индикаторы, карточки, лейауты, тосты и др.)
- `api/client.ts` — HTTP-клиент с интерцепторами
- `lib/` — утилиты и хуки (`auth`, `formatters`, `useOrientation`, `useBeepSound`, media helpers)

---

## 📸 Фото-прогресс (актуальное состояние)
- Локальное хранение файлов: `documentDirectory/progress/<userId>/<side>/<timestamp>.jpg`
- Метаданные: `progress/index.json` на пользователя (список `ProgressPhoto[]`)
- Ракурсы: `front`, `back`, `left`, `right`
- Флоу:
  1) `CameraPermissionScreen` — запрос камеры
  2) `PhonePositionScreen` — проверка портретной ориентации устройства
  3) Экран готовности (силуэт без PoseCamera): “Примите исходное положение”, через 2с “Начнём”
  4) Съёмка 4 сторон: отсчёт 5s, кадр, превью с “Переснять/Далее”, цикл по ракурсам
  5) Финальный экран: миниатюры, тумблер “Сохранить в галерею” (MediaLibrary), кнопка “Сохранить”
- Просмотр: `/photo-progress` — заглушка без фото, миниатюры при наличии; из stats карточка ведёт на этот роут

---

## 🧩 Публичные API слоёв

- Entities: импортируются через `@/entities/<name>` (например, `progress`: `useProgressListQuery`, `useSaveProgressBatchMutation`, типы)
- Features: через `@/features/<name>` (например, `progress-capture`: `ProgressCaptureFlow`)
- Pages: через `@/pages/<name>`
- Shared UI/lib/api: через `@/shared/*`

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
