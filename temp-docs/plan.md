# План интеграции API для аутентификации

## Текущая структура экранов

1. **AuthScreen** (`/auth`) - экран входа по email/паролю
2. **RegisterScreen** (`/register`) - экран регистрации (email, пароль, подтверждение пароля)
3. **VerificationScreen** (`/verification`) - экран ввода кода подтверждения

## Подключение эндпоинтов

### 1. **RegisterScreen** → `/auth/sendCode`
- **Где**: `handleSubmit()` в `RegisterScreen.tsx` (строка 196)
- **Когда**: После успешной валидации формы регистрации
- **Действие**: Отправка кода подтверждения на email
- **После успеха**: Переход на `/verification` с передачей email

### 2. **VerificationScreen** → `/auth/registration`
- **Где**: `handleSubmit()` в `VerificationScreen.tsx` (строка 52)
- **Когда**: После ввода 6-значного кода подтверждения
- **Действие**: Регистрация пользователя с кодом, email и паролем
- **После успеха**: Сохранение токенов и переход на `/survey`

### 3. **AuthScreen** → `/auth/login`
- **Где**: `handleSubmit()` в `AuthScreen.tsx` (строка 22)
- **Когда**: После ввода email и пароля
- **Действие**: Авторизация пользователя
- **После успеха**: Сохранение токенов и переход на `/home`

### 4. **VerificationScreen** → повторная отправка кода
- **Где**: `handleResend()` в `VerificationScreen.tsx` (строка 63)
- **Когда**: При нажатии "Прислать код повторно"
- **Действие**: Повторный вызов `/auth/sendCode`

## Что нужно добавить

### 1. **Хранение токенов**
- Использовать `AsyncStorage` для сохранения `access_token` и `refresh_token`
- Проверка срока действия токенов (`expires_at`)

### 2. **Состояние аутентификации**
- Контекст или стор для управления состоянием авторизации
- Проверка авторизации при запуске приложения
- Перенаправления для неавторизованных пользователей

### 3. **Обработка ошибок**
- Валидация ответов API
- Показ понятных сообщений об ошибках пользователю
- Обработка сетевых ошибок

### 4. **Типы TypeScript**
- Типы для запросов и ответов API
- Интерфейсы для токенов и ошибок

## Этап 1: Интеграция sendCode (ТЕКУЩИЙ ЭТАП)

### Задачи:
1. **Создать типы и интерфейсы** для API
   - `SendCodeInput` (email: string)
   - `SendCodeResponse` (message: string)
   - `ErrorResponse` (error: string)

2. **Настроить API клиент**
   - Базовый URL: `http://158.160.145.40:8080/api/v1`
   - Функция для POST запросов
   - Обработка ошибок 400, 500

3. **Создать функцию отправки кода**
   - Функция `sendCode(email: string)` в API клиенте
   - Валидация email на клиенте
   - Возврат успешного ответа или ошибки

4. **Интеграция в RegisterScreen**
   - В `handleSubmit()` добавить вызов `sendCode(email)`
   - Показывать loading во время запроса
   - При успехе → переход на `/verification` с email
   - При ошибке → показать сообщение об ошибке пользователю

5. **Интеграция в VerificationScreen**
   - В `handleResend()` добавить вызов `sendCode(email)`
   - Взять email из `useLocalSearchParams`
   - При успехе → перезапустить таймер на 59 секунд
   - При ошибке → показать сообщение об ошибке пользователю

### Важные моменты:
- Нужно сохранить email между экранами (передавать через navigation params)
- Нужно передать пароль на VerificationScreen для регистрации
- Добавить состояние loading для кнопок

## Порядок реализации (полный план)

### Этап 1: sendCode (ЗАВЕРШЕН) ✅
1. ✅ Создание типов и интерфейсов для sendCode
2. ✅ Настройка API клиента
3. ✅ Реализация функции sendCode
4. ✅ Интеграция в RegisterScreen
5. ✅ Интеграция в VerificationScreen (повторная отправка)

**Примечание**: Добавлен режим моков (MOCK_MODE = true) для разработки без бэкенда.
Когда бэкенд будет готов, установить MOCK_MODE = false в src/shared/api/auth.ts

### Этап 2: registration
1. Создание типов для registration
2. Реализация функции registration
3. Сохранение токенов (AsyncStorage)
4. Интеграция в VerificationScreen

### Этап 3: login
1. Создание типов для login
2. Реализация функции login
3. Интеграция в AuthScreen

### Этап 4: Дополнительно
1. Реализация refresh токенов
2. Управление состоянием аутентификации
3. Обработка logout

## Вопросы для уточнения

1. Нужен ли экран восстановления пароля?
2. Как обрабатывать ошибки - через тосты или модальные окна?
3. Нужен ли logout функционал?
4. Какой таймаут для refresh токенов?

## Схема API

### Аутентификация
- `POST /auth/sendCode` - отправка кода на email
- `POST /auth/registration` - регистрация с кодом
- `POST /auth/login` - вход по email/паролю
- `POST /auth/refresh` - обновление токенов

### Пользовательские данные
- `POST /user/update/{id}` - обновление профиля
- `POST /user/build-plan/{id}` - генерация плана тренировок
- `GET /user/train/{trainingId}/{index}` - данные тренировки
- `GET /user/train-program/{userId}` - программа пользователя

### Модели данных
- **SendCodeInput**: email
- **RegistrationInput**: код, email, пароль
- **LoginRequest**: email, пароль
- **TokenResponse**: access_token, refresh_token, expires_at
- **TrainingResponse**: id, user_id, period_id, date, activities[]

## Базовый URL
`http://158.160.145.40:8080/api/v1`

---

# План реализации экранов опроса

## Анализ флоу из Figma

Структура опроса состоит из **13 экранов** с различными типами вопросов. Все экраны объединены в единый flow с переходом "Далее".

### Экраны опроса (по порядку)

1. **Как к вам обращаться?** - текстовый ввод имени
2. **Ваш пол** - выбор одного из двух (Мужчина/Женщина)
3. **В какие дни тренироваться?** - выбор нескольких дней (минимум 3 из 7)
4. **Как часто тренируетесь сейчас?** - выбор одного из 4 вариантов
5. **Для чего тренируетесь?** - выбор до 3-х целей из 8 вариантов
6. **Основное направление** - выбор одного из 4 направлений
7. **Дополнительные направления** - выбор нескольких (без основного)
8. **Возраст** - выбор возрастной группы (10 групп)
9. **Параметры** - ввод роста и веса (числовые поля)
10. **Загрузка расчета ИМТ** - loader экран
11. **Результат ИМТ** - экран с результатом (7 вариантов в зависимости от ИМТ)
12. **Уведомления** - запрос разрешений на push-уведомления
13. **Финальный экран** - приветствие "Добро пожаловать"

## Подход к реализации

### Выбранный подход: **Один экран с условным рендерингом**

**Преимущества:**
- ✅ Переиспользуемость UI компонентов
- ✅ Простая навигация между шагами
- ✅ Единое состояние для всего опроса
- ✅ Легче тестировать отдельные части
- ✅ Проще контролировать прогресс

**Недостатки:**
- ❌ Один большой файл (можно разбить на компоненты)
- ❌ Все шаги в одном месте

## Что нужно создать

### 1. UI Компоненты (`src/shared/ui/`)

#### `RadioSelect` - выбор одного варианта
- **Где**: `src/shared/ui/RadioSelect/`
- **Что делает**: Рендерит список вариантов с возможностью выбрать один
- **Пропсы**: `options`, `value`, `onChange`, `columns` (для grid layout)
- **Использование**: Пол, частота тренировок, основное направление, возраст

#### `CheckboxSelect` - выбор нескольких вариантов
- **Где**: `src/shared/ui/CheckboxSelect/`
- **Что делает**: Рендерит список вариантов с возможностью выбрать несколько
- **Пропсы**: `options`, `value` (массив), `onChange`, `maxSelected`, `minSelected`
- **Использование**: Дни недели, цели тренировок, дополнительные направления

#### `ProgressBar` - индикатор прогресса
- **Где**: `src/shared/ui/ProgressBar/`
- **Что делает**: Показывает прогресс прохождения опроса
- **Пропсы**: `currentStep`, `totalSteps`
- **Текущее состояние**: Базовая версия уже есть в SurveyScreen

### 2. Модель данных (`src/entities/survey/`)

#### Типы данных (`model/types.ts`)
```typescript
// Типы ответов на вопросы
export type Gender = 'male' | 'female'
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
export type Frequency = 'never' | 'sometimes' | '2-3times' | 'almost_daily'
export type Goal = 'posture' | 'pain_relief' | 'flexibility' | 'strength' | 'weight_loss' | 'stress_relief' | 'energy' | 'wellness'
export type Direction = 'strength' | 'cardio' | 'stretching' | 'back_health'
export type AgeGroup = 'under_18' | '18_24' | '25_34' | '35_44' | '45_54' | '55_64' | '65_plus'

// Полные данные опроса
export interface SurveyData {
  name: string
  gender: Gender | null
  trainingDays: DayOfWeek[]
  frequency: Frequency | null
  goals: Goal[]
  mainDirection: Direction | null
  additionalDirections: Direction[]
  ageGroup: AgeGroup | null
  height: number | null
  weight: number | null
  bmi: number | null
  notificationsEnabled: boolean
}

// Результат ИМТ
export type BMICategory = 'underweight_severe' | 'underweight_mild' | 'normal' | 'overweight' | 'obese_1' | 'obese_2' | 'obese_3'
```

#### Store для состояния (`lib/store.ts`)
- **Где**: `src/entities/survey/lib/store.ts`
- **Что делает**: Хранит состояние опроса через Zustand
- **Содержит**: 
  - Данные ответов (`surveyData`)
  - Текущий шаг (`currentStep`)
  - Методы навигации (`nextStep`, `prevStep`)
  - Методы обновления ответов (`updateAnswer`)

### 3. Экран опроса (`src/screens/survey/`)

#### `SurveyScreen.tsx` - основной экран
- **Где**: `src/screens/survey/ui/SurveyScreen.tsx`
- **Что делает**: 
  - Рендерит текущий вопрос на основе `currentStep`
  - Управляет навигацией между шагами
  - Валидирует ответы перед переходом
  - Отображает индикатор прогресса
- **Структура**:
  ```typescript
  switch (currentStep) {
    case 1: return <NameQuestion />
    case 2: return <GenderQuestion />
    case 3: return <TrainingDaysQuestion />
    // ... и т.д.
  }
  ```

### 4. Утилиты

#### Расчет ИМТ (`src/entities/survey/lib/utils.ts`)
- **Функция**: `calculateBMI(height: number, weight: number): number`
- **Формула**: BMI = weight (kg) / height² (m²)
- **Пример**: 55 кг / (1.68 м)² = 19.5

#### Определение категории ИМТ (`src/entities/survey/lib/utils.ts`)
- **Функция**: `getBMICategory(bmi: number, gender: Gender): BMICategory`
- **Диапазоны**:
  - < 16.9: Ожирение третьей степени
  - 17.0 - 18.4: Ожирение второй степени
  - 18.5 - 24.9: Нормальный вес
  - 25.0 - 29.9: Избыточный вес
  - 30.0 - 34.9: Ожирение первой степени
  - 35.0 - 39.9: Ожирение второй степени
  - ≥ 40: Ожирение третьей степени

#### Валидация ответов (`src/entities/survey/lib/validation.ts`)
- **Функции**:
  - `validateName(name: string): boolean`
  - `validateGender(gender: Gender | null): boolean`
  - `validateTrainingDays(days: DayOfWeek[]): boolean` (минимум 3)
  - `validateFrequency(frequency: Frequency | null): boolean`
  - `validateGoals(goals: Goal[]): boolean` (до 3-х)
  - `validateMainDirection(direction: Direction | null): boolean`
  - `validateAdditionalDirections(directions: Direction[], main: Direction | null): boolean`
  - `validateAgeGroup(age: AgeGroup | null): boolean`
  - `validateParameters(height: number | null, weight: number | null): boolean`

### 5. Константы опросника (`src/entities/survey/config/`)

#### Опции для вопросов (`constants.ts`)
```typescript
export const GENDER_OPTIONS = [
  { value: 'male', label: 'Мужчина', icon: 'male' },
  { value: 'female', label: 'Женщина', icon: 'female' }
]

export const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Понедельник' },
  { value: 'tuesday', label: 'Вторник' },
  // ... и т.д.
]

export const FREQUENCY_OPTIONS = [
  { value: 'never', label: 'Не тренируюсь' },
  { value: 'sometimes', label: 'Иногда двигаюсь' },
  { value: '2-3times', label: '2-3 раза в неделю' },
  { value: 'almost_daily', label: 'Почти каждый день' }
]

export const GOAL_OPTIONS = [
  { value: 'posture', label: 'Улучшить осанку', icon: 'back' },
  { value: 'pain_relief', label: 'Избавиться от боли', icon: 'pain' },
  // ... и т.д.
]

export const DIRECTION_OPTIONS = [
  { value: 'strength', label: 'Силовые тренировки', icon: 'dumbbell' },
  { value: 'cardio', label: 'Кардио', icon: 'jump_rope' },
  { value: 'stretching', label: 'Растяжка', icon: 'stretching' },
  { value: 'back_health', label: 'Здоровая спина', icon: 'back' }
]

export const AGE_GROUPS = [
  { value: 'under_18', label: 'до 18' },
  { value: '18_24', label: '18 - 24' },
  { value: '25_34', label: '25 - 34' },
  // ... и т.д.
]
```

## Порядок реализации

### Этап 1: Создание компонентов (2-3 часа)
1. ✅ Создать `RadioSelect` компонент
2. ✅ Создать `CheckboxSelect` компонент
3. ✅ Создать/обновить `ProgressBar` компонент

### Этап 2: Модель данных (1-2 часа)
1. ✅ Создать типы в `entities/survey/model/types.ts`
2. ✅ Создать константы в `entities/survey/config/constants.ts`
3. ✅ Создать утилиты в `entities/survey/lib/utils.ts`

### Этап 3: Store и состояние (1 час)
1. ✅ Создать Zustand store в `entities/survey/lib/store.ts`
2. ✅ Интегрировать store в `SurveyScreen`

### Этап 4: Реализация экранов (3-4 часа)
1. ✅ Реализовать экраны вопросов в `SurveyScreen`
2. ✅ Добавить навигацию между шагами
3. ✅ Добавить валидацию ответов
4. ✅ Реализовать экран загрузки ИМТ
5. ✅ Реализовать экран результатов ИМТ

### Этап 5: Интеграция (1 час)
1. ✅ Подключить к API для сохранения данных
2. ✅ Добавить обработку ошибок
3. ✅ Тестирование

### Этап 6: Финальные экраны (1 час)
1. ✅ Реализовать экран уведомлений
2. ✅ Реализовать финальный экран приветствия
3. ✅ Добавить анимации переходов

## Вопросы для уточнения

1. Нужно ли сохранять прогресс опроса локально (чтобы можно было вернуться)?
2. Какие иконки использовать для целей и направлений (есть ли уже готовые)?
3. Нужна ли возможность пропустить шаг опроса?
4. Что делать если пользователь закроет приложение во время опроса?
5. Как обрабатывать некорректные данные (например, рост 300 см)?

## API интеграция

### Эндпоинт для сохранения данных опроса
- **URL**: `POST /user/update/{id}`
- **Payload**: полный объект `SurveyData`
- **Response**: успешное сохранение данных

### Эндпоинт для получения результатов
- **URL**: `POST /user/build-plan/{id}`
- **Payload**: data из опроса
- **Response**: сгенерированный план тренировок
