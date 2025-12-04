# PRD: Модуль чата с AI-ассистентом

## 1. Обзор

### 1.1 Описание продукта

Модуль чата с AI-тренером (ИИ-ассистент) для фитнес-приложения Fitchoice. Чат позволяет пользователям общаться с AI-тренером для получения рекомендаций по тренировкам, технике выполнения упражнений и мотивации.

### 1.2 Ключевые функции (на основе дизайна)

1. **Текстовые сообщения** - ввод и отправка текста с эмодзи
2. **Голосовые сообщения** - запись, отправка, воспроизведение с визуализацией
3. **Отправка изображений/видео** - выбор из галереи с превью
4. **Отправка файлов** - документы с индикатором загрузки и статусами
5. **Typing indicator** - анимация при ожидании ответа AI
6. **Streaming ответы** - потоковый вывод ответа от AI

### 1.3 Технический контекст

- **Framework**: React Native 0.81.5 + Expo SDK 54
- **State Management**: Zustand + TanStack Query
- **Styling**: NativeWind (TailwindCSS)
- **Animations**: React Native Reanimated
- **Существующие пакеты**: expo-av, expo-camera, expo-file-system

---

## 2. Сравнительный анализ подходов

### Подход 1: React Native Gifted Chat

#### Описание

Использование готовой библиотеки `react-native-gifted-chat` — самого популярного решения для чатов в RN с 13k+ GitHub звёзд.

#### Преимущества

- ✅ Быстрый старт — готовый UI из коробки
- ✅ Богатая документация и комьюнити
- ✅ Встроенная поддержка: изображения, видео, аудио, quick replies
- ✅ Готовая обработка клавиатуры (KeyboardAvoidingView)
- ✅ Типизация TypeScript

#### Недостатки

- ❌ Ограниченная кастомизация — сложно адаптировать под уникальный дизайн
- ❌ FlatList под капотом — хуже производительность на больших списках
- ❌ Избыточный функционал — много неиспользуемого кода
- ❌ Стиль "Material/iOS" — не соответствует дизайну Fitchoice
- ❌ Зависимость от сторонней библиотеки

#### Пример интеграции

```tsx
import { GiftedChat, IMessage } from 'react-native-gifted-chat'

const ChatScreen = () => {
	const [messages, setMessages] = useState<IMessage[]>([])

	const onSend = useCallback((newMessages: IMessage[] = []) => {
		setMessages((prev) => GiftedChat.append(prev, newMessages))
		// Отправка на AI backend
	}, [])

	return (
		<GiftedChat
			messages={messages}
			onSend={onSend}
			user={{ _id: 1 }}
			renderBubble={CustomBubble}
			renderInputToolbar={CustomInput}
			// ... много кастомных пропсов
		/>
	)
}
```

#### Оценка

- **Скорость разработки**: ⭐⭐⭐⭐⭐ (5/5)
- **Производительность**: ⭐⭐⭐ (3/5)
- **Кастомизация**: ⭐⭐ (2/5)
- **Соответствие дизайну**: ⭐⭐ (2/5)

---

### Подход 2: Stream Chat React Native SDK

#### Описание

Enterprise-решение от Stream с полноценным backend-as-a-service для чатов.

#### Преимущества

- ✅ Production-ready решение
- ✅ Real-time через WebSocket из коробки
- ✅ Офлайн-режим и синхронизация
- ✅ Модерация, реакции, треды
- ✅ Высокая кастомизация через context и hooks

#### Недостатки

- ❌ **Платный сервис** — от $99/месяц для production
- ❌ Зависимость от внешнего API
- ❌ Overhead — много функций для простого AI-чата
- ❌ Конфликт с существующим API-клиентом проекта
- ❌ Не подходит для AI-чата (предназначен для P2P/групповых чатов)

#### Пример интеграции

```tsx
import { StreamChat } from 'stream-chat'
import { Chat, Channel, MessageList, MessageInput } from 'stream-chat-react-native'

const client = StreamChat.getInstance('API_KEY')

const ChatScreen = () => (
	<Chat client={client}>
		<Channel channel={channel}>
			<MessageList />
			<MessageInput />
		</Channel>
	</Chat>
)
```

#### Оценка

- **Скорость разработки**: ⭐⭐⭐⭐ (4/5)
- **Производительность**: ⭐⭐⭐⭐⭐ (5/5)
- **Кастомизация**: ⭐⭐⭐⭐ (4/5)
- **Соответствие задаче**: ⭐ (1/5) — избыточно для AI-чата

---

### Подход 3: Кастомное решение (FlashList + Expo SDK) ✅ РЕКОМЕНДУЕМЫЙ

#### Описание

Разработка собственного модуля чата с использованием:

- `@shopify/flash-list` — высокопроизводительный список
- `expo-av` — запись/воспроизведение аудио
- `expo-image-picker` — выбор изображений
- `expo-document-picker` — выбор файлов
- `expo-file-system` — работа с файлами
- `zustand` — управление состоянием чата

#### Преимущества

- ✅ **Полный контроль над UI** — точное соответствие дизайну Fitchoice
- ✅ **Высокая производительность** — FlashList с recycling (10x быстрее FlatList)
- ✅ **Интеграция с архитектурой** — использование существующих паттернов (Zustand, TanStack Query)
- ✅ **Нет внешних зависимостей** — все пакеты уже в проекте или от Expo
- ✅ **Оптимизация для AI** — streaming ответов, typing indicator
- ✅ **Переиспользование UI** — использование существующих компонентов (Input, Button, Icon)

#### Недостатки

- ❌ Больше времени на разработку (2-3 недели vs 1 неделя)
- ❌ Необходимость реализации базовой логики вручную
- ❌ Тестирование edge-cases

#### Архитектура

```
src/
├── entities/
│   └── chat/
│       ├── model/
│       │   ├── types.ts           # Message, ChatState, AttachmentType
│       │   └── useChatStore.ts    # Zustand store
│       └── index.ts
│
├── features/
│   └── chat/
│       ├── api/
│       │   ├── chatApi.ts         # API endpoints
│       │   └── index.ts
│       ├── lib/
│       │   ├── useAudioRecorder.ts    # Hook для записи голосовых
│       │   ├── useAudioPlayer.ts      # Hook для воспроизведения
│       │   ├── useFileUpload.ts       # Hook для загрузки файлов
│       │   └── useMessageStream.ts    # Hook для streaming AI ответов
│       └── index.ts
│
├── widgets/
│   └── chat/
│       ├── ui/
│       │   ├── ChatScreen.tsx         # Главный экран
│       │   ├── MessageList.tsx        # FlashList с сообщениями
│       │   ├── MessageBubble.tsx      # Пузырь сообщения
│       │   ├── MessageInput.tsx       # Поле ввода + actions
│       │   ├── VoiceRecorder.tsx      # Запись голосового
│       │   ├── AudioMessage.tsx       # Голосовое сообщение
│       │   ├── ImageAttachment.tsx    # Превью изображений
│       │   ├── FileAttachment.tsx     # Файл с прогрессом
│       │   ├── TypingIndicator.tsx    # Анимация набора
│       │   └── AttachmentPicker.tsx   # Меню выбора (фото/файл)
│       └── index.ts
│
└── app/
    └── chat.tsx                       # Route для чата
```

#### Оценка

- **Скорость разработки**: ⭐⭐⭐ (3/5)
- **Производительность**: ⭐⭐⭐⭐⭐ (5/5)
- **Кастомизация**: ⭐⭐⭐⭐⭐ (5/5)
- **Соответствие дизайну**: ⭐⭐⭐⭐⭐ (5/5)

---

## 3. Выбранный подход: Кастомное решение

### 3.1 Обоснование выбора

| Критерий              | Gifted Chat          | Stream             | Кастомное     |
| --------------------- | -------------------- | ------------------ | ------------- |
| Соответствие дизайну  | 🔴 Низкое            | 🟡 Среднее         | 🟢 Полное     |
| Производительность    | 🟡 FlatList          | 🟢 Оптимизирован   | 🟢 FlashList  |
| Стоимость             | 🟢 Бесплатно         | 🔴 $99+/мес        | 🟢 Бесплатно  |
| Интеграция с проектом | 🟡 Требует адаптации | 🔴 Конфликт API    | 🟢 Нативная   |
| AI-чат специфика      | 🟡 Адаптируемо       | 🔴 Не предназначен | 🟢 Оптимально |
| Поддержка             | 🟢 Комьюнити         | 🟢 Enterprise      | 🟡 Своя       |

**Вывод**: Кастомное решение — оптимальный выбор для данного проекта, так как:

1. Дизайн уникален и требует полного контроля над UI
2. Это AI-чат, а не P2P — не нужны сложные функции групповых чатов
3. Все необходимые пакеты уже есть в проекте
4. Паттерны архитектуры (FSD, Zustand, TanStack Query) уже определены

---

## 4. Техническая спецификация

### 4.1 Типы данных

```typescript
// entities/chat/model/types.ts

export type MessageRole = 'user' | 'assistant' | 'system'

export type AttachmentType = 'image' | 'video' | 'audio' | 'file'

export type UploadStatus = 'pending' | 'uploading' | 'completed' | 'error'

export interface Attachment {
	id: string
	type: AttachmentType
	uri: string
	name?: string
	size?: number
	mimeType?: string
	duration?: number // для аудио/видео
	thumbnail?: string // для видео
	uploadProgress?: number // 0-100
	uploadStatus: UploadStatus
	remoteUrl?: string // URL после загрузки
}

export interface Message {
	id: string
	role: MessageRole
	content: string
	createdAt: Date
	attachments?: Attachment[]
	isStreaming?: boolean // для streaming ответов AI
}

export interface ChatState {
	messages: Message[]
	isLoading: boolean
	isRecording: boolean
	attachments: Attachment[] // pending attachments в input
	error: string | null

	// Actions
	addMessage: (message: Message) => void
	updateMessage: (id: string, updates: Partial<Message>) => void
	setLoading: (loading: boolean) => void
	setRecording: (recording: boolean) => void
	addAttachment: (attachment: Attachment) => void
	removeAttachment: (id: string) => void
	updateAttachmentProgress: (id: string, progress: number, status: UploadStatus) => void
	clearAttachments: () => void
	reset: () => void
}
```

### 4.2 API интеграция

```typescript
// features/chat/api/chatApi.ts

export interface SendMessageRequest {
	content: string
	attachments?: {
		type: AttachmentType
		url: string
		name?: string
	}[]
}

export interface ChatResponse {
	id: string
	content: string
	createdAt: string
}

export const chatApi = {
	// Отправка сообщения (обычный режим)
	sendMessage: async (request: SendMessageRequest): Promise<ApiResult<ChatResponse>> => {
		return apiClient.post('/chat/messages', request)
	},

	// Streaming ответ от AI
	streamMessage: async (
		request: SendMessageRequest,
		onChunk: (chunk: string) => void,
		onComplete: (response: ChatResponse) => void,
		onError: (error: Error) => void
	): Promise<void> => {
		// SSE или WebSocket implementation
	},

	// Загрузка файла
	uploadAttachment: async (
		file: { uri: string; name: string; type: string },
		onProgress: (progress: number) => void
	): Promise<ApiResult<{ url: string }>> => {
		// FormData upload with progress
	},

	// История чата
	getHistory: async (
		limit: number = 50,
		before?: string
	): Promise<ApiResult<Message[]>> => {
		return apiClient.get(
			`/chat/messages?limit=${limit}${before ? `&before=${before}` : ''}`
		)
	},
}
```

### 4.3 Ключевые компоненты

#### MessageList с FlashList

```typescript
// widgets/chat/ui/MessageList.tsx

import { FlashList } from '@shopify/flash-list'

export const MessageList = () => {
  const messages = useChatStore(state => state.messages)
  const isLoading = useChatStore(state => state.isLoading)

  return (
    <FlashList
      data={messages}
      renderItem={({ item }) => <MessageBubble message={item} />}
      keyExtractor={(item) => item.id}
      estimatedItemSize={80}
      maintainVisibleContentPosition={{
        autoscrollToBottomThreshold: 0.1,
        startRenderingFromBottom: true,
        animateAutoScrollToBottom: true,
      }}
      onStartReached={loadOlderMessages}
      onStartReachedThreshold={0.2}
      getItemType={(item) => item.role} // Разные пулы для user/assistant
      ListFooterComponent={isLoading ? <TypingIndicator /> : null}
    />
  )
}
```

#### VoiceRecorder с expo-av

```typescript
// features/chat/lib/useAudioRecorder.ts

import { Audio } from 'expo-av'

export const useAudioRecorder = () => {
	const [recording, setRecording] = useState<Audio.Recording | null>(null)
	const [duration, setDuration] = useState(0)

	const startRecording = async () => {
		const { status } = await Audio.requestPermissionsAsync()
		if (status !== 'granted') return

		await Audio.setAudioModeAsync({
			allowsRecordingIOS: true,
			playsInSilentModeIOS: true,
		})

		const { recording } = await Audio.Recording.createAsync(
			Audio.RecordingOptionsPresets.HIGH_QUALITY
		)
		setRecording(recording)

		// Update duration every 100ms
		recording.setOnRecordingStatusUpdate((status) => {
			if (status.isRecording) {
				setDuration(status.durationMillis)
			}
		})
	}

	const stopRecording = async () => {
		if (!recording) return null

		await recording.stopAndUnloadAsync()
		await Audio.setAudioModeAsync({ allowsRecordingIOS: false })

		const uri = recording.getURI()
		setRecording(null)
		setDuration(0)

		return uri
	}

	const cancelRecording = async () => {
		if (recording) {
			await recording.stopAndUnloadAsync()
			setRecording(null)
			setDuration(0)
		}
	}

	return {
		isRecording: !!recording,
		duration,
		startRecording,
		stopRecording,
		cancelRecording,
	}
}
```

### 4.4 UI компоненты (соответствие дизайну)

#### Цветовая схема

```typescript
const ChatColors = {
	background: '#0D0D0D', // Фон чата
	userBubble: '#3F3F3F', // Пузырь пользователя
	assistantBubble: 'transparent', // AI сообщения без фона
	accent: '#CDFF00', // Акцентный цвет (кнопка отправки)
	inputBg: '#1E1E1E', // Фон поля ввода
	text: '#FFFFFF', // Основной текст
	textSecondary: '#949494', // Вторичный текст
	error: '#FF6B6B', // Ошибка загрузки
	success: '#4CAF50', // Успешная загрузка
}
```

#### MessageInput (по дизайну)

```typescript
// widgets/chat/ui/MessageInput.tsx

export const MessageInput = () => {
  const [text, setText] = useState('')
  const { isRecording, duration, startRecording, stopRecording, cancelRecording } = useAudioRecorder()
  const attachments = useChatStore(state => state.attachments)

  return (
    <View className="flex-row items-end gap-2 px-4 py-2">
      {/* Attachment Button */}
      <TouchableOpacity onPress={openAttachmentPicker}>
        <Icon name="attachment" size={24} color="#949494" />
      </TouchableOpacity>

      {/* Input Container */}
      <View className="flex-1 rounded-2xl bg-[#1E1E1E] px-4 py-3">
        {/* Attachment Previews */}
        {attachments.length > 0 && <AttachmentPreview attachments={attachments} />}

        {isRecording ? (
          <VoiceRecordingUI duration={duration} onCancel={cancelRecording} />
        ) : (
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Сообщение"
            placeholderTextColor="#949494"
            multiline
            className="text-white"
          />
        )}
      </View>

      {/* Send / Voice Button */}
      {text || attachments.length > 0 ? (
        <TouchableOpacity
          onPress={handleSend}
          className="h-10 w-10 items-center justify-center rounded-full bg-[#CDFF00]"
        >
          <Icon name="arrow-up" size={20} color="#000000" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={isRecording ? stopRecording : startRecording}
          onLongPress={startRecording}
          className="h-10 w-10 items-center justify-center"
        >
          <Icon name="microphone" size={24} color={isRecording ? '#CDFF00' : '#949494'} />
        </TouchableOpacity>
      )}
    </View>
  )
}
```

---

## 5. Зависимости

### 5.1 Существующие (уже в проекте)

- `expo-av` — аудио запись/воспроизведение
- `expo-file-system` — работа с файлами
- `react-native-reanimated` — анимации
- `zustand` — state management
- `@tanstack/react-query` — server state

### 5.2 Требуется добавить

```bash
# FlashList для производительного списка
npx expo install @shopify/flash-list

# Document picker для файлов
npx expo install expo-document-picker

# Image picker (возможно уже есть)
npx expo install expo-image-picker
```

### 5.3 Конфигурация app.json

```json
{
	"expo": {
		"plugins": [
			[
				"expo-av",
				{
					"microphonePermission": "Разрешить $(PRODUCT_NAME) использовать микрофон для голосовых сообщений"
				}
			],
			[
				"expo-image-picker",
				{ "photosPermission": "Разрешить $(PRODUCT_NAME) доступ к фотографиям" }
			],
			["expo-document-picker", { "iCloudContainerEnvironment": "Production" }]
		]
	}
}
```

---

## 6. План разработки

### Фаза 1: Базовый чат (5 дней)

1. Настройка структуры модуля (entities, features, widgets)
2. Zustand store для состояния чата
3. MessageList с FlashList
4. MessageBubble компонент
5. Базовый MessageInput
6. API интеграция (без streaming)
7. Роутинг и навигация

### Фаза 2: Голосовые сообщения (3 дня)

1. useAudioRecorder hook
2. useAudioPlayer hook
3. VoiceRecorder UI с swipe-to-cancel
4. AudioMessage компонент с визуализацией
5. Загрузка аудио на сервер

### Фаза 3: Медиа-вложения (4 дня)

1. AttachmentPicker (меню выбора)
2. ImagePicker интеграция
3. DocumentPicker интеграция
4. Превью вложений в input
5. Upload с прогрессом
6. ImageAttachment / FileAttachment компоненты
7. Состояния загрузки (uploading/completed/error)

### Фаза 4: AI-интеграция (3 дня)

1. Streaming ответы (SSE/WebSocket)
2. TypingIndicator анимация
3. Обработка ошибок
4. Retry logic

### Фаза 5: Полировка (2 дня)

1. Анимации (send, receive, recording)
2. Haptic feedback
3. Accessibility
4. Edge cases и error handling
5. Performance оптимизация

**Общая оценка: 17 рабочих дней (≈3.5 недели)**

---

## 7. Риски и митигация

| Риск                     | Вероятность | Влияние | Митигация                            |
| ------------------------ | ----------- | ------- | ------------------------------------ |
| Сложность streaming      | Средняя     | Высокое | Fallback на обычные запросы          |
| Производительность аудио | Низкая      | Среднее | Использование expo-av best practices |
| Большие файлы            | Средняя     | Среднее | Сжатие, лимиты, chunked upload       |
| Офлайн режим             | Низкая      | Низкое  | MVP без офлайна, добавить позже      |

---

## 8. Метрики успеха

1. **Производительность**: 60 FPS при скролле 1000+ сообщений
2. **Время отклика**: < 200ms на ввод текста
3. **Размер бандла**: < 50KB дополнительно к текущему
4. **Crash rate**: < 0.1% для функций чата
5. **UX**: Время от нажатия "отправить" до появления ответа AI < 3s

---

## Приложение A: Референсы дизайна

На основе скриншотов из папки `Чат/`:

- `1.png` — Начальный экран с приветствием AI
- `2-3.png` — Ввод текста с клавиатурой
- `4-5.png` — Typing indicator и ответ AI
- `6-7.png` — Запись голосового сообщения (hold + swipe)
- `8.png` — Голосовые сообщения в чате (player UI)
- `9.png` — Меню вложений (Фото и видео / Файл)
- `10-11.png` — Превью изображений перед отправкой + в чате
- `12-15.png` — Загрузка файла (прогресс / успех / ошибка)
- `16.png` — Файлы в чате

---

_Версия документа: 1.0_
_Дата создания: 4 декабря 2025_
