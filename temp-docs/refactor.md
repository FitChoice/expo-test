# 🔧 ПЛАН РЕФАКТОРИНГА ПРОЕКТА FITCHOICE

> Объединенный аудит архитектуры и кодовой базы React Native приложения

**Дата аудита:** 23 октября 2025  
**Общая оценка:** 7.5/10  
**Оценка готовности к production:** 6/10

---

## 📊 EXECUTIVE SUMMARY

Проект демонстрирует **продвинутый уровень разработки** с качественной архитектурой FSD и современным стеком. Однако выявлены **критические проблемы** в области безопасности, тестирования и некоторые архитектурные несоответствия методологии FSD.

**Приоритет действий:**

1. 🔴 **Критично** — Error Boundary, AuthGuard, MOCK_MODE
2. 🟠 **Важно** — Архитектурный рефакторинг (FSD), авторизационные механизмы, TypeScript strict mode
3. 🟡 **Улучшения** — Performance, A11y

---

## 🔴 КРИТИЧЕСКИЕ ПРОБЛЕМЫ (Требуют немедленного решения)

> **Примечание:** Тестирование и интеграция с Sentry исключены из текущего плана рефакторинга.

### 1. Безопасность API и данных — 5/10

#### 1.1 Отсутствие авторизационных механизмов

**Проблемы:**

- ❌ Нет добавления токенов в заголовки
- ❌ Нет interceptors
- ❌ Нет механизма refresh token
- ❌ Нет обработки 401 ошибок

**✅ Решение:**

```typescript
// shared/api/client.ts
import * as SecureStore from 'expo-secure-store'

class ApiClient {
	private async getAuthHeaders(): Promise<Record<string, string>> {
		const token = await SecureStore.getItemAsync('auth_token')
		return token ? { Authorization: `Bearer ${token}` } : {}
	}

	async post<TRequest, TResponse>(
		endpoint: string,
		data: TRequest
	): Promise<ApiResult<TResponse>> {
		const authHeaders = await this.getAuthHeaders()

		try {
			const response = await fetch(`${this.baseUrl}${endpoint}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					...authHeaders,
				},
				body: JSON.stringify(data),
			})

			// Handle 401 - unauthorized
			if (response.status === 401) {
				await this.handleUnauthorized()
				return { success: false, error: 'Unauthorized' }
			}

			// ... rest of the logic
		} catch (err) {
			// ... error handling
		}
	}

	private async handleUnauthorized() {
		await SecureStore.deleteItemAsync('auth_token')
		// Redirect to auth screen
		router.replace('/auth')
	}
}
```

> **⚠️ Важно:** Используйте `expo-secure-store` вместо `AsyncStorage` для хранения токенов. SecureStore обеспечивает шифрование данных на уровне ОС (iOS Keychain / Android Keystore), что критично для безопасности аутентификационных токенов.

#### 1.2 MOCK_MODE в production коде

```typescript
// ❌ src/shared/api/auth.ts:9
const MOCK_MODE = true // TODO: Set to false when backend is ready
```

**Риск:** Случайный деплой с моками в production.

**✅ Решение:**

```typescript
const MOCK_MODE = __DEV__ && process.env.EXPO_PUBLIC_USE_MOCKS === 'true'
```

---

### 2. Отсутствие Error Boundary — Критично

**Проблема:** React Native crashит при unhandled errors без возможности восстановления.

**✅ Решение:**

```tsx
// shared/ui/ErrorBoundary/ErrorBoundary.tsx
import { Component, ReactNode } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'

interface Props {
	children: ReactNode
}

interface State {
	hasError: boolean
	error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
	state: State = { hasError: false, error: null }

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error }
	}

	componentDidCatch(error: Error, errorInfo: unknown) {
		// TODO: Send to Sentry/Crashlytics
		console.error('ErrorBoundary caught:', error, errorInfo)
	}

	handleReset = () => {
		this.setState({ hasError: false, error: null })
	}

	render() {
		if (this.state.hasError) {
			return (
				<View style={styles.container}>
					<Text style={styles.title}>Что-то пошло не так</Text>
					<Text style={styles.message}>
						{this.state.error?.message || 'Неизвестная ошибка'}
					</Text>
					<TouchableOpacity style={styles.button} onPress={this.handleReset}>
						<Text style={styles.buttonText}>Попробовать снова</Text>
					</TouchableOpacity>
				</View>
			)
		}
		return this.props.children
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
		backgroundColor: '#151515',
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#FFFFFF',
		marginBottom: 16,
	},
	message: {
		fontSize: 16,
		color: '#FFFFFF',
		marginBottom: 24,
		textAlign: 'center',
	},
	button: {
		backgroundColor: '#A172FF',
		paddingHorizontal: 24,
		paddingVertical: 12,
		borderRadius: 8,
	},
	buttonText: {
		color: '#FFFFFF',
		fontSize: 16,
		fontWeight: '600',
	},
})
```

```tsx
// app/_layout.tsx
import { ErrorBoundary } from '@/shared/ui'

export default function Layout() {
	return (
		<ErrorBoundary>
			<AppProvider>
				<Slot />
			</AppProvider>
		</ErrorBoundary>
	)
}
```

---

### 3. AuthGuard не используется в роутах

**Проблема:** Компонент `AuthGuard` существует, но не применяется.

```tsx
// ❌ app/home.tsx — НЕТ защиты
export default function HomePage() {
	return <HomeScreen />
}
```

**✅ Решение:**

```tsx
// app/home.tsx
import { AuthGuard } from '@/shared/ui'
import { HomeScreen } from '@/screens/home'

export default function HomePage() {
	return (
		<AuthGuard>
			<HomeScreen />
		</AuthGuard>
	)
}
```

Применить на все защищенные роуты: `/home`, `/survey` (после авторизации).

---

## 🟠 ВАЖНЫЕ ПРОБЛЕМЫ (Архитектура FSD)

### 4. Переименование `screens` → `pages` для соответствия FSD

**Проблема:** В FSD используется слой `pages`, а не `screens`.

**Текущая структура:**

```
src/
├── screens/     ❌ Нестандартно для FSD
```

**✅ Целевая структура:**

```
src/
├── pages/       ✅ Страницы (роуты)
```

**План рефакторинга:**

```bash
# 1. Переименовать директорию
mv src/screens src/pages

# 2. Переименовать компоненты
# LandingScreen → LandingPage
# AuthScreen → AuthPage
# SurveyScreen → SurveyPage
# HomeScreen → HomePage
# VerificationScreen → VerificationPage
# PoseScreen → PosePage

# 3. Обновить tsconfig.json
{
  "paths": {
    "@/pages/*": ["./src/pages/*"]
  }
}

# 4. Обновить все импорты во всех файлах
```

---

### 5. Отсутствует слой `features`

**Проблема:** В проекте нет слоя `features`, который должен содержать бизнес-функциональность.

**Что должно быть в `features`:**

- `features/auth` — авторизация пользователя
- `features/registration` — регистрация
- `features/survey-flow` — прохождение опроса

**Текущее состояние:**

- Логика авторизации смешана между `screens/auth` и `shared/api`
- Логика опроса находится в `entities/survey/lib/store.ts` (неправильно!)

**✅ Правильная структура:**

```
src/
├── features/
│   ├── auth/
│   │   ├── ui/
│   │   │   ├── LoginForm.tsx
│   │   │   └── index.ts
│   │   ├── model/
│   │   │   ├── useAuth.ts
│   │   │   └── types.ts
│   │   ├── api/
│   │   │   ├── authApi.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── registration/
│   │   ├── ui/
│   │   │   └── RegistrationForm.tsx
│   │   ├── model/
│   │   │   └── useRegistration.ts
│   │   └── index.ts
│   └── survey-flow/
│       ├── ui/
│       │   ├── SurveyStep.tsx
│       │   └── steps/
│       │       ├── NameStep.tsx
│       │       ├── GenderStep.tsx
│       │       └── ...
│       ├── model/
│       │   ├── useSurveyFlow.ts  ← Переместить сюда store
│       │   └── types.ts
│       └── index.ts
```

---

### 6. Неправильное размещение бизнес-логики в `entities`

**Проблема:**

```typescript
// ❌ entities/survey/lib/store.ts
export const useSurveyStore = create<SurveyStore>((set) => ({
  currentStep: 1,  // ← UI-логика
  nextStep: () => { ... },  // ← UI-логика
  prevStep: () => { ... },  // ← UI-логика
  updateName: (name) => { ... },  // ← Мутация формы
```

**Почему это ошибка:**

- `entities` должны содержать только **данные сущностей** и **бизнес-правила**
- Управление шагами опроса (`currentStep`, `nextStep`) — это **UI/flow логика** → относится к `features`
- Методы `updateName`, `updateGender` — это **мутации формы** → относится к `features`

**✅ Правильное разделение:**

**entities/survey — Только данные, валидация и бизнес-логика:**

```typescript
// entities/survey/model/types.ts
export interface SurveyData {
	name: string
	gender: Gender | null
	ageGroup: AgeGroup | null
	height: number | null
	weight: number | null
	bmi: number | null
}

// entities/survey/lib/validator.ts
export const validateSurveyData = (data: Partial<SurveyData>): boolean => {
	if (data.name && data.name.length < 2) return false
	if (data.height && (data.height < 100 || data.height > 250)) return false
	if (data.weight && (data.weight < 30 || data.weight > 300)) return false
	return true
}

// entities/survey/lib/calculator.ts
export const calculateBMI = (height: number, weight: number): number => {
	const heightInMeters = height / 100
	return weight / (heightInMeters * heightInMeters)
}

// entities/survey/lib/bmicategory.ts
export interface BMICategory {
	bmi: number
	description: string
}

export const getBMICategory = (bmi: number | null): BMICategory | null => {
	if (!bmi) return null

	if (bmi < 16.9) {
		return {
			bmi,
			description:
				'Это недостаточный вес, поэтому мы обратим внимание на питание и укрепление мышц',
		}
	} else if (bmi >= 17 && bmi < 18.5) {
		return {
			bmi,
			description:
				'Это слегка пониженный вес, тренировки помогут добавить силы и энергии',
		}
	} else if (bmi >= 18.5 && bmi < 25) {
		return {
			bmi,
			description:
				'Это нормальный вес для вашего роста. Отличная база, чтобы развивать тело и достигать новых целей',
		}
	} else if (bmi >= 30 && bmi < 35) {
		return {
			bmi,
			description:
				'Это избыточный вес, сосредоточимся на тренировки возвращении легкости и улучшении самочувствия',
		}
	} else if (bmi >= 35 && bmi < 40) {
		return {
			bmi,
			description:
				'Это ожирение второй степени. Мы будем идти маленькими шагами, чтобы укреплять тело без перегрузок',
		}
	} else {
		return {
			bmi,
			description:
				'Это ожирение третьей степени. Даже небольшая активность и регулярность принесут заметный результат для здоровья',
		}
	}
}
```

> **✅ Примечание:** Методы `calculateBMI` и `getBMICategory` — это чистая бизнес-логика, которая **правильно** размещена в `entities`. Они описывают правила работы с сущностью Survey и не содержат UI-логики.

**features/survey-flow — Вся логика прохождения:**

```typescript
// features/survey-flow/model/useSurveyFlow.ts
import { create } from 'zustand'
import { SurveyData, calculateBMI, getBMICategory } from '@/entities/survey'

interface SurveyFlowStore {
	// UI state
	currentStep: number
	totalSteps: number

	// Data
	surveyData: SurveyData

	// Actions
	updateName: (name: string) => void
	updateGender: (gender: Gender) => void
	nextStep: () => void
	prevStep: () => void
	submitSurvey: () => Promise<void>
}

export const useSurveyFlow = create<SurveyFlowStore>((set, get) => ({
	currentStep: 1,
	totalSteps: 14,
	surveyData: initialSurveyData,

	updateName: (name) =>
		set((state) => ({
			surveyData: { ...state.surveyData, name },
		})),

	nextStep: () =>
		set((state) => ({
			currentStep: Math.min(state.currentStep + 1, state.totalSteps),
		})),

	calculateBMI: () =>
		set((state) => {
			const { height, weight } = state.surveyData
			if (height && weight) {
				const bmi = calculateBMI(height, weight)
				return {
					surveyData: { ...state.surveyData, bmi: parseFloat(bmi.toFixed(1)) },
				}
			}
			return state
		}),

	submitSurvey: async () => {
		// API call
	},
}))
```

---

### 7. Нарушение изоляции слоев: `entities` импортирует UI-типы

**Проблема:**

```typescript
// ❌ entities/survey/config/constants.ts
import { RadioSelectOption } from '@/shared/ui/RadioSelect'
import { CheckboxSelectOption } from '@/shared/ui/CheckboxSelect'
```

**Почему это ошибка:**

- Слой `entities` не должен зависеть от UI-компонентов из `shared`
- Нарушается принцип изоляции слоев

**✅ Решение — перенести общие типы в `shared/types`:**

```typescript
// shared/types/ui.ts
export interface SelectOption {
	value: string
	label: string
	icon?: ReactNode
}

// entities/survey/config/constants.ts
import { SelectOption } from '@/shared/types'

export const GENDER_OPTIONS: SelectOption[] = [
	{ value: 'male', label: 'Мужчина' },
	{ value: 'female', label: 'Женщина' },
]
```

---

### 8. Прямые импорты минуя Public API

**Проблема:**

```typescript
// ❌ Найдено в 4 файлах
import { Input } from '@/shared/ui/Input/Input'
```

**Должно быть:**

```typescript
// ✅ Через Public API
import { Input } from '@/shared/ui'
```

**Файлы для исправления:**

- `src/screens/auth/ui/AuthScreen.tsx:5`
- `src/screens/auth/ui/RegisterScreen.tsx:5`
- `src/screens/survey/ui/SurveyScreen.tsx:5`
- `src/screens/verification/ui/VerificationScreen.tsx:5`

**Решение:** Проверить, что `Input` экспортируется из `shared/ui/index.ts`:

```typescript
// shared/ui/index.ts
export { Input } from './Input' // ← Добавить если отсутствует
```

---

### 9. Реорганизация API-методов

**Проблема:** `shared/api/auth.ts` содержит методы для конкретного домена (auth), но в FSD это должно быть в соответствующем слайсе.

**Текущая структура:**

```
shared/api/
├── client.ts    ← API клиент
├── auth.ts      ← ❌ Методы auth
```

**✅ Правильная структура:**

```
shared/api/
├── client.ts    ← ✅ Только HTTP-клиент, interceptors
└── index.ts

features/auth/api/
├── authApi.ts   ← sendCode, verifyCode
└── index.ts
```

**Рефакторинг:**

```typescript
// features/auth/api/authApi.ts
import { apiClient } from '@/shared/api'

export const authApi = {
	async sendCode(email: string) {
		return apiClient.post('/auth/send-code', { email })
	},

	async verifyCode(email: string, code: string) {
		return apiClient.post('/auth/verify', { email, code })
	},
}

// features/auth/index.ts
export { authApi } from './api/authApi'
```

---

### 10. Несоответствие API-типов схеме Swagger — Важно

**Проблема:** В проекте отсутствуют критичные типы и методы, определённые в `swagger.yaml`.

#### 10.1 Отсутствующие типы

**Необходимо добавить в `shared/api/types.ts`:**

```typescript
// Registration
export interface RegistrationInput {
	code: number // integer в Swagger
	email: string
	password: string
}

// Login
export interface LoginRequest {
	email: string
	password: string
}

// Token refresh
export interface RefreshInput {
	refresh_token: string
}

// Token response (используется в registration, login, refresh)
export interface TokenResponse {
	access_token: string
	refresh_token: string
	expires_at: string // ISO 8601 date-time
}

// Training
export interface TrainingResponse {
	id: number
	user_id: number
	period_id: number
	date: string // ISO 8601 date-time
	activities: Array<{
		type: string
		progress: number[]
	}>
}
```

#### 10.2 Отсутствующие API-методы

**Swagger определяет 7 эндпоинтов, реализован только 1:**

**✅ Реализовано:**

- `POST /auth/sendCode` — sendCode()

**❌ Отсутствуют:**

- `POST /auth/registration` — registration()
- `POST /auth/login` — login()
- `POST /auth/refresh` — refresh()
- `POST /user/update/{id}` — updateUser()
- `POST /user/build-plan/{id}` — buildTrainingPlan()
- `GET /user/train/{trainingId}/{index}` — getTrainInformation()
- `GET /user/train-program/{userId}` — getTrainingProgram()

**Рекомендуемая реализация:**

```typescript
// features/auth/api/authApi.ts
import { apiClient } from '@/shared/api'
import type {
	SendCodeInput,
	SendCodeResponse,
	RegistrationInput,
	LoginRequest,
	RefreshInput,
	TokenResponse,
	ApiResult,
} from '@/shared/api/types'

export const authApi = {
	// ✅ Уже есть
	async sendCode(email: string): Promise<ApiResult<SendCodeResponse>> {
		const payload: SendCodeInput = { email }
		return apiClient.post('/auth/sendCode', payload)
	},

	// ❌ Нужно добавить
	async registration(data: RegistrationInput): Promise<ApiResult<TokenResponse>> {
		return apiClient.post('/auth/registration', data)
	},

	// ❌ Нужно добавить
	async login(data: LoginRequest): Promise<ApiResult<TokenResponse>> {
		return apiClient.post('/auth/login', data)
	},

	// ❌ Нужно добавить
	async refresh(refreshToken: string): Promise<ApiResult<TokenResponse>> {
		const payload: RefreshInput = { refresh_token: refreshToken }
		return apiClient.post('/auth/refresh', payload)
	},
}

// features/user/api/userApi.ts
export const userApi = {
	async updateUser(userId: string, data: Record<string, unknown>) {
		return apiClient.post(`/user/update/${userId}`, data)
	},

	async buildTrainingPlan(userId: string) {
		return apiClient.post(`/user/build-plan/${userId}`, {})
	},

	async getTrainInformation(trainingId: string, index: number) {
		return apiClient.get(`/user/train/${trainingId}/${index}`)
	},

	async getTrainingProgram(userId: string): Promise<ApiResult<TrainingResponse[]>> {
		return apiClient.get(`/user/train-program/${userId}`)
	},
}
```

#### 10.3 Отсутствует метод GET в API client

**Проблема:** `apiClient` имеет только `post()`, но Swagger определяет GET-эндпоинты.

**Решение — добавить в `shared/api/client.ts`:**

```typescript
class ApiClient {
	// ... existing post method

	/**
	 * Perform GET request
	 */
	async get<TResponse>(endpoint: string): Promise<ApiResult<TResponse>> {
		try {
			const authHeaders = await this.getAuthHeaders()

			const response = await fetch(`${this.baseUrl}${endpoint}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					...authHeaders,
				},
			})

			const responseData = await response.json()

			if (!response.ok) {
				const errorMessage = responseData.error || 'Произошла ошибка'
				return {
					success: false,
					error: errorMessage,
				}
			}

			return {
				success: true,
				data: responseData,
			}
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Ошибка сети'

			return {
				success: false,
				error: errorMessage,
			}
		}
	}
}
```

#### 10.4 Несоответствие типа `code`

**Swagger определяет:**

```yaml
code:
  type: integer # number в TypeScript
```

**Рекомендация:** В UI код вводится как строка, но отправлять на сервер нужно как `number`:

```typescript
// В RegisterScreen или VerificationScreen
const codeNumber = parseInt(code, 10)
await authApi.registration({
	code: codeNumber, // number, не string!
	email,
	password,
})
```

---

## 🟡 ВАЖНЫЕ УЛУЧШЕНИЯ

### 11. TypeScript strict mode

**Проблема:** Текущий `tsconfig.json` наследует `expo/tsconfig.base`, который не включает полный strict mode.

**✅ Решение:**

```json
// tsconfig.json
{
	"extends": "expo/tsconfig.base",
	"compilerOptions": {
		"baseUrl": ".",
		"strict": true,
		"strictNullChecks": true,
		"noUncheckedIndexedAccess": true,
		"noImplicitReturns": true,
		"noFallthroughCasesInSwitch": true,
		"paths": {
			"@/*": ["./src/*"],
			"@/shared/*": ["./src/shared/*"],
			"@/entities/*": ["./src/entities/*"],
			"@/features/*": ["./src/features/*"],
			"@/widgets/*": ["./src/widgets/*"],
			"@/pages/*": ["./src/pages/*"],
			"@/app/*": ["./src/app/*"]
		}
	}
}
```

**Также в ESLint:**

```javascript
// eslint.config.js
{
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',  // ← Было 'warn'
    '@typescript-eslint/explicit-function-return-type': 'warn',
  }
}
```

---

### 12. Performance оптимизации

#### 12.1 Отсутствие React.memo/useCallback

**Проблема:** В компонентах функции пересоздаются при каждом рендере.

**✅ Решение:**

```tsx
// ❌ Плохо
const handleBack = () => {
	if (currentStep === 1) {
		router.back()
	} else {
		prevStep()
	}
}

// ✅ Хорошо
const handleBack = useCallback(() => {
	if (currentStep === 1) {
		router.back()
	} else {
		prevStep()
	}
}, [currentStep, router, prevStep])

// Для компонентов
const SurveyStep = React.memo(({ step, data, onChange }) => {
	// ...
})
```

#### 12.2 Оптимизация загрузки компонентов с inline require

> **⚠️ Важно:** На native (iOS/Android) весь JavaScript код уже включен в бандл — inline require откладывает только parse/eval модуля, что ускоряет старт приложения на слабых устройствах.

**Проблема:** Тяжелые компоненты загружаются синхронно при запуске приложения.

**✅ Решение:**

```tsx
// Для тяжелого компонента
let ExpensiveComponent = null

export const MyScreen = () => {
	const [showExpensive, setShowExpensive] = useState(false)

	const handleLoadExpensive = useCallback(() => {
		if (!ExpensiveComponent) {
			// Загружаем компонент только когда нужен (откладывает parse/eval)
			ExpensiveComponent = require('./ExpensiveComponent').default
		}
		setShowExpensive(true)
	}, [])

	return (
		<View>
			<TouchableOpacity onPress={handleLoadExpensive}>
				<Text>Загрузить компонент</Text>
			</TouchableOpacity>
			{showExpensive && ExpensiveComponent && <ExpensiveComponent />}
		</View>
	)
}
```

**Включить автоматическую оптимизацию в Metro:**

```javascript
// metro.config.js
module.exports = {
	transformer: {
		// Автоматически оптимизирует импорты для ускорения старта
		inlineRequires: true,
	},
}
```

#### 12.3 Metro config — Удаление console в production

**Проблема:**

```javascript
// metro.config.js (текущий код)
if (process.env.NODE_ENV === 'production') {
	config.transformer.minifierConfig = {
		compress: {
			drop_console: true, // ← Удаляет ВСЕ console, включая warn/error
		},
	}
}
```

**✅ Решение:**

```javascript
// metro.config.js
if (process.env.NODE_ENV === 'production') {
	config.transformer.minifierConfig = {
		compress: {
			// Удаляем только log, info и debug
			// Оставляем warn и error для production debugging
			pure_funcs: ['console.log', 'console.info', 'console.debug'],
		},
	}
}
```

> **⚠️ Важно:** Опция `drop_console` принимает только `true/false`. Для выборочного удаления используйте `pure_funcs` — это правильный синтаксис Terser.

---

### 13. Валидация форм — ✅ Уже хорошо реализовано

**Текущее состояние:**
Валидация в проекте работает корректно и не требует изменений:

- ✅ Валидация email через регулярные выражения
- ✅ Валидация паролей (сложность, совпадение)
- ✅ Валидация имени, роста, веса
- ✅ Условная активация кнопок (`disabled` и `canProceed`)
- ✅ Отображение ошибок пользователю

---

### 14. Accessibility (A11y)

**Проблема:** Нет accessibility атрибутов.

**✅ Решение:**

```tsx
// Для кнопок
<Button
  variant="primary"
  accessibilityLabel="Продолжить к следующему шагу опроса"
  accessibilityRole="button"
  accessibilityState={{ disabled: !isValid }}
  accessibilityHint="Нажмите, чтобы перейти к следующему вопросу"
>
  Далее
</Button>

// Для иконок
<Icon
  name="chevron-left"
  accessibilityLabel="Назад"
  accessibilityRole="imagebutton"
/>

// Для изображений
<Image
  source={landingPhoto1}
  accessibilityLabel="Фотография человека на тренировке"
  accessibilityRole="image"
/>
```

**Тестирование:**

- iOS: Включить VoiceOver (Settings → Accessibility → VoiceOver)
- Android: Включить TalkBack (Settings → Accessibility → TalkBack)

**Проверка screen reader программно:**

```tsx
import { AccessibilityInfo, useEffect, useState } from 'react-native'

export const MyComponent = () => {
	const [screenReaderEnabled, setScreenReaderEnabled] = useState(false)

	useEffect(() => {
		// Проверяем при монтировании
		AccessibilityInfo.isScreenReaderEnabled().then(setScreenReaderEnabled)

		// Подписываемся на изменения
		const subscription = AccessibilityInfo.addEventListener(
			'screenReaderChanged',
			setScreenReaderEnabled
		)

		return () => subscription?.remove()
	}, [])

	// Можем адаптировать UI для screen reader
	return screenReaderEnabled ? <AccessibleView /> : <NormalView />
}
```

---

### 15. Разбиение больших компонентов

**Проблема:** `SurveyScreen.tsx` содержит 899 строк кода.

**✅ Решение:**

```
pages/survey/ui/
├── SurveyScreen.tsx           (main container, ~100 строк)
├── components/
│   ├── ProgressBar.tsx
│   ├── NavigationButtons.tsx
│   └── steps/
│       ├── NameStep.tsx
│       ├── GenderStep.tsx
│       ├── AgeStep.tsx
│       ├── HeightWeightStep.tsx
│       ├── BMILoadingStep.tsx
│       ├── BMIResultStep.tsx
│       └── ... (остальные шаги)
└── SurveyScreen.styles.ts
```

```tsx
// pages/survey/ui/SurveyScreen.tsx
import { NameStep } from './components/steps/NameStep'
import { GenderStep } from './components/steps/GenderStep'
// ...

export const SurveyScreen = () => {
	const { currentStep } = useSurveyFlow()

	const renderStep = () => {
		switch (currentStep) {
			case 1:
				return <NameStep />
			case 2:
				return <GenderStep />
			// ...
		}
	}

	return (
		<View>
			<ProgressBar step={currentStep} />
			{renderStep()}
			<NavigationButtons />
		</View>
	)
}
```

---

### 16. Смешанные паттерны экспорта

**Проблема:**

```typescript
// ❌ entities/survey/index.ts
export * from './model'
export * from './lib'
```

Это экспортирует ВСЁ, включая внутренние детали.

**✅ Решение — явные экспорты:**

```typescript
// entities/survey/index.ts
export type {
	SurveyData,
	Gender,
	AgeGroup,
	DayOfWeek,
	Frequency,
	Goal,
	Direction,
} from './model/types'

export { validateSurveyData, calculateBMI } from './lib/calculator'

// НЕ экспортируем внутренние утилиты
```

---

### 17. React 19 — Использование современных возможностей

**Проект использует React 19.1.0** — используйте новые хуки для улучшения кода:

#### 17.1 use() hook для асинхронных данных

```tsx
import { use } from 'react'

function UserProfile({ userPromise }) {
	const user = use(userPromise) // Suspense-совместимый
	return <Text>{user.name}</Text>
}
```

#### 17.2 useOptimistic для оптимистичных обновлений

```tsx
import { useOptimistic } from 'react'

function LikeButton({ postId, initialLikes }) {
	const [optimisticLikes, addOptimisticLike] = useOptimistic(
		initialLikes,
		(state) => state + 1
	)

	const handleLike = async () => {
		addOptimisticLike() // Мгновенное обновление UI
		await api.likePost(postId)
	}

	return <Text>{optimisticLikes} likes</Text>
}
```

#### 17.3 useActionState для форм

```tsx
import { useActionState } from 'react'

function RegistrationForm() {
	const [state, formAction, isPending] = useActionState(
		async (prevState, formData) => {
			const result = await authApi.register(formData)
			return result
		},
		{ success: false }
	)

	return (
		<form action={formAction}>
			<Button disabled={isPending}>
				{isPending ? 'Регистрация...' : 'Зарегистрироваться'}
			</Button>
		</form>
	)
}
```

---

### 18. Типизированные роуты с Expo Router

**Используйте типобезопасную навигацию:**

```typescript
import { router } from 'expo-router'
import { Href } from 'expo-router'

// Типобезопасная навигация — IDE проверит существование роута
const navigateToHome = () => {
	router.push('/home')
}

// Для динамических роутов
const navigateToUser = (userId: string) => {
	router.push(`/user/${userId}` as Href)
}

// С параметрами
const navigateToSurvey = () => {
	router.push({
		pathname: '/survey',
		params: { step: '1' },
	})
}
```

**Типизация параметров роута:**

```typescript
import { useLocalSearchParams } from 'expo-router';

type SurveyParams = {
  step?: string;
  returnTo?: string;
};

export default function SurveyPage() {
  const params = useLocalSearchParams<SurveyParams>();
  const step = params.step ? parseInt(params.step, 10) : 1;

  return <SurveyScreen initialStep={step} />;
}
```

---

### 19. Оптимизация изображений с expo-image

**Используйте `expo-image` вместо `react-native` Image:**

```tsx
import { Image } from 'expo-image'
;<Image
	source={require('@/assets/images/landing-photo-1.png')}
	style={{ width: 300, height: 400 }}
	contentFit="cover"
	transition={200}
	placeholder={blurhash} // Опционально
/>
```

**Responsive изображения:**

```tsx
import { Image } from 'expo-image'
import { useWindowDimensions } from 'react-native'

export const ResponsiveImage = ({ source }) => {
	const { width } = useWindowDimensions()

	return (
		<Image
			source={source}
			style={{ width: width * 0.9, height: width * 0.9 * 1.33 }}
			contentFit="cover"
		/>
	)
}
```

**Ленивая загрузка изображений:**

```tsx
import { useState } from 'react'
import { Image } from 'expo-image'

export const LazyImage = ({ source, placeholder }) => {
	const [loaded, setLoaded] = useState(false)

	return (
		<>
			{!loaded && <Image source={placeholder} />}
			<Image
				source={source}
				onLoad={() => setLoaded(true)}
				style={{ opacity: loaded ? 1 : 0 }}
			/>
		</>
	)
}
```

---

### 20. Унифицированная обработка состояний с QueryBoundary

**Создайте компонент для единообразной обработки загрузки и ошибок:**

```tsx
// shared/ui/QueryBoundary/QueryBoundary.tsx
import { ReactNode } from 'react'
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native'

interface QueryBoundaryProps {
	isLoading: boolean
	isError: boolean
	error?: Error | null
	onRetry?: () => void
	children: ReactNode
}

export const QueryBoundary = ({
	isLoading,
	isError,
	error,
	onRetry,
	children,
}: QueryBoundaryProps) => {
	if (isLoading) {
		return (
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
				<ActivityIndicator size="large" color="#A172FF" />
				<Text style={{ marginTop: 16, color: '#FFFFFF' }}>Загрузка...</Text>
			</View>
		)
	}

	if (isError) {
		return (
			<View
				style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}
			>
				<Text style={{ fontSize: 18, color: '#FFFFFF', marginBottom: 8 }}>
					Произошла ошибка
				</Text>
				<Text
					style={{
						fontSize: 14,
						color: '#999999',
						marginBottom: 24,
						textAlign: 'center',
					}}
				>
					{error?.message || 'Неизвестная ошибка'}
				</Text>
				{onRetry && (
					<TouchableOpacity
						onPress={onRetry}
						style={{
							backgroundColor: '#A172FF',
							paddingHorizontal: 24,
							paddingVertical: 12,
							borderRadius: 8,
						}}
					>
						<Text style={{ color: '#FFFFFF', fontSize: 16 }}>Попробовать снова</Text>
					</TouchableOpacity>
				)}
			</View>
		)
	}

	return <>{children}</>
}
```

**Использование:**

```tsx
import { useQuery } from '@tanstack/react-query'
import { QueryBoundary } from '@/shared/ui'

export const UserProfile = () => {
	const { data, isLoading, isError, error, refetch } = useQuery({
		queryKey: ['user'],
		queryFn: () => userApi.getProfile(),
	})

	return (
		<QueryBoundary
			isLoading={isLoading}
			isError={isError}
			error={error}
			onRetry={refetch}
		>
			<ProfileContent user={data} />
		</QueryBoundary>
	)
}
```

---

## 📋 ЧЕКЛИСТ ПРИОРИТЕТНЫХ ДЕЙСТВИЙ

### 🔴 КРИТИЧНО (Неделя 1)

- [ ] **Убрать MOCK_MODE из production** (`__DEV__` проверка)
- [ ] **Использовать expo-secure-store для токенов** (вместо AsyncStorage)
- [ ] **Добавить авторизационные заголовки** в API client
- [ ] **Добавить Error Boundary** в `app/_layout.tsx`
- [ ] **Применить AuthGuard** на защищенные роуты (`/home`, `/survey`)

### 🟠 ВАЖНО (Неделя 2)

- [ ] **Переименовать `screens` → `pages`** для соответствия FSD
- [ ] **Создать слой `features/`**
- [ ] **Перенести UI/flow логику** из `entities/survey` → `features/survey-flow` (оставить бизнес-логику calculateBMI/getBMICategory в entities)
- [ ] **Создать `shared/types/ui.ts`** и перенести туда SelectOption
- [ ] **Исправить прямые импорты** — использовать только через Public API (@/shared/ui)
- [ ] **Включить TypeScript strict mode** в tsconfig.json
- [ ] **Реорганизовать API** — `shared/api/auth.ts` → `features/auth/api/`
- [ ] **Добавить недостающие API-типы** (TokenResponse, RegistrationInput, LoginRequest, RefreshInput, TrainingResponse)
- [ ] **Реализовать недостающие API-методы** (registration, login, refresh, user endpoints)
- [ ] **Добавить метод GET** в API client

### 🟡 УЛУЧШЕНИЯ (Неделя 3-4)

- [ ] **Добавить React.memo/useCallback** в горячих местах
- [ ] **Применить inline require** для тяжелых компонентов (откладывает parse/eval)
- [ ] **Включить inlineRequires в Metro** для автоматической оптимизации
- [ ] **Исправить metro.config** (использовать `pure_funcs: ['console.log', 'console.info', 'console.debug']`)
- [ ] **Разбить `SurveyScreen.tsx`** на мелкие компоненты
- [ ] **Добавить accessibility атрибуты** + AccessibilityInfo проверки
- [ ] **Унифицировать стиль экспортов** (явные вместо `export *`)
- [ ] **Вынести стили в отдельные файлы**
- [ ] **Добавить типизированные роуты** (Expo Router Href types)
- [ ] **Использовать expo-image** вместо react-native Image
- [ ] **Добавить QueryBoundary** для обработки состояний загрузки/ошибок
- [ ] **Использовать новые возможности React 19** (use, useOptimistic, useActionState)
- [ ] **Настроить CI/CD** (GitHub Actions)

---

## 🎯 МЕТРИКИ УСПЕХА

| Метрика               | Текущее | Цель  |
| --------------------- | ------- | ----- |
| TypeScript Errors     | 0       | 0 ✅  |
| ESLint Warnings       | ?       | 0     |
| Bundle Size (iOS)     | ?       | <15MB |
| Bundle Size (Android) | ?       | <20MB |
| Time to Interactive   | ?       | <3s   |

---

## 📊 ИТОГОВАЯ ОЦЕНКА ПО КАТЕГОРИЯМ

| Категория                | Оценка | Приоритет   |
| ------------------------ | ------ | ----------- |
| **Архитектура FSD**      | 7/10   | 🟠 Важно    |
| **Безопасность**         | 5/10   | 🟠 Важно    |
| **TypeScript**           | 6/10   | 🟠 Важно    |
| **Performance**          | 6/10   | 🟠 Важно    |
| **Error Handling**       | 5/10   | 🔴 Критично |
| **Code Quality**         | 8/10   | ✅ Хорошо   |
| **Валидация форм**       | 8/10   | ✅ Хорошо   |
| **Технологический стек** | 9/10   | ✅ Отлично  |
| **UI/UX**                | 8/10   | ✅ Хорошо   |
| **Accessibility**        | 4/10   | 🟡 Улучшить |
| **Documentation**        | 9/10   | ✅ Отлично  |

**ОБЩАЯ ОЦЕНКА: 7.5/10**

---

## 🚀 РЕКОМЕНДАЦИИ ПО ВНЕДРЕНИЮ

### Фаза 1: Критические исправления (1-2 недели)

1. Настроить авторизационные механизмы (токены, interceptors)
2. Убрать MOCK_MODE из production кода
3. Добавить Error Boundary
4. Применить AuthGuard

### Фаза 2: Архитектурный рефакторинг (2-3 недели)

1. Переименовать screens → pages
2. Создать слой features
3. Перенести бизнес-логику из entities
4. Исправить изоляцию слоев
5. Включить TypeScript strict mode

### Фаза 3: Оптимизация и улучшения (2-3 недели)

1. Performance оптимизации (memo, lazy)
2. Accessibility
3. Разбиение больших компонентов
4. CI/CD настройка

---

## 💡 ДОПОЛНИТЕЛЬНЫЕ РЕКОМЕНДАЦИИ

### Code Review Checklist

- [ ] TypeScript strict mode соблюден
- [ ] Нет прямых импортов (только через Public API)
- [ ] Accessibility атрибуты добавлены
- [ ] Performance оптимизации применены (memo/useCallback)
- [ ] Error handling реализован
- [ ] Документация обновлена

## 📚 ПОЛЕЗНЫЕ РЕСУРСЫ

- [Feature-Sliced Design](https://feature-sliced.design/)
- [React Native Best Practices](https://reactnative.dev/docs/performance)
- [TypeScript Strict Mode](https://www.typescriptlang.org/tsconfig#strict)
- [Expo Security](https://docs.expo.dev/guides/security/)
- [Web Accessibility Guidelines](https://www.w3.org/WAI/standards-guidelines/wcag/)
- [React 19 Release Notes](https://react.dev/blog/2024/04/25/react-19)

---

**Документ подготовлен:** 23 октября 2025  
**Следующее обновление:** После завершения Фазы 1

---

_Этот документ является living document и будет обновляться по мере выполнения задач._

---

## 💬 ЗАКЛЮЧЕНИЕ

Проект **Fitchoice** демонстрирует **высокий уровень** разработки с современной архитектурой и технологиями. Основные задачи связаны с **архитектурным соответствием FSD**, **авторизационными механизмами** и **производительностью**.

**Главный приоритет**: Привести архитектуру в полное соответствие FSD и реализовать полноценную авторизацию перед production релизом.

**Оценка готовности к production**: 7.5/10

**Положительные моменты:**

- ✅ Валидация форм уже хорошо реализована
- ✅ React 19 обеспечивает современные возможности
- ✅ Качественная структура компонентов

Проект имеет **отличную базу** для масштабирования и долгосрочной поддержки. После устранения указанных проблем он будет соответствовать всем современным стандартам разработки React Native приложений.
