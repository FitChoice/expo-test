# План реализации модуля чата с AI-ассистентом

## Общие принципы

### ✅ Что делаем:

- Сразу целевая архитектура без fallback/graceful degradation
- Только актуальные API (FlashList v2, expo-av, expo-audio)
- Удаление legacy кода при рефакторинге
- Следование существующим паттернам проекта
- **Строгое соблюдение FSD и SOLID**

### ❌ Что НЕ делаем:

- Обратная совместимость
- Fallback на устаревшие методы
- Mock-данные в production коде

---

## Архитектура модуля (FSD-compliant)

### Структура слоёв

```
entities/chat/          → Типы данных (Message, Attachment)
features/chat/          → Бизнес-логика (API, mutations, store)
widgets/chat/           → UI композиция (ТОЛЬКО компоненты, БЕЗ логики)
pages/(chat)/           → Страница чата (роутинг)
```

### Правила зависимостей

```
widgets/chat → features/chat → entities/chat → shared
     ↓              ↓               ↓            ↓
   UI only     API + Store      Types only   Utils/UI
```

### Ключевые отличия от первой версии плана:

1. **Store перемещён из widgets в features** — соблюдение FSD
2. **TanStack Query для server state** — консистентность с проектом
3. **Zustand только для client state** — правильное разделение
4. **DRY: общие утилиты в shared/lib** — форматирование, helpers
5. **Типы API в shared/api/types.ts** — единое место

---

## Фаза 0: Подготовка (1 день)

### 0.1 Установка зависимостей

```bash
npx expo install @shopify/flash-list expo-document-picker expo-image-picker
```

### 0.2 Обновление app.json

```json
{
	"expo": {
		"plugins": [
			[
				"expo-av",
				{
					"microphonePermission": "Разрешить Fitchoice использовать микрофон для голосовых сообщений"
				}
			],
			[
				"expo-image-picker",
				{
					"photosPermission": "Разрешить Fitchoice доступ к фотографиям для отправки в чат"
				}
			],
			[
				"expo-document-picker",
				{
					"iCloudContainerEnvironment": "Production"
				}
			]
		]
	}
}
```

### 0.3 Создание структуры директорий

```
src/
├── entities/
│   └── chat/                        # Domain types
│       ├── model/
│       │   ├── types.ts             # Message, Attachment types
│       │   └── index.ts
│       ├── lib/
│       │   └── mappers.ts           # API ↔ Domain mappers
│       └── index.ts
│
├── features/
│   └── chat/                        # Business logic
│       ├── api/
│       │   ├── chatApi.ts           # API methods
│       │   ├── useChatHistory.ts    # TanStack Query hook
│       │   ├── useSendMessage.ts    # TanStack Mutation hook
│       │   └── index.ts
│       ├── model/
│       │   └── useChatStore.ts      # Zustand (client state ONLY)
│       ├── lib/
│       │   ├── useAudioRecorder.ts  # Recording hook (standalone)
│       │   ├── useAudioPlayer.ts    # Playback hook (standalone)
│       │   ├── useFileUpload.ts     # Upload hook (uses mutations)
│       │   └── index.ts
│       └── index.ts
│
├── widgets/
│   └── chat/                        # UI composition ONLY
│       └── ui/
│           ├── ChatScreen.tsx
│           ├── MessageList.tsx
│           ├── MessageBubble.tsx
│           ├── MessageInput.tsx
│           ├── VoiceRecorder.tsx
│           ├── AudioMessage.tsx
│           ├── ImageAttachment.tsx
│           ├── FileAttachment.tsx
│           ├── TypingIndicator.tsx
│           ├── AttachmentPicker.tsx
│           ├── AttachmentPreview.tsx
│           ├── ChatHeader.tsx
│           └── index.ts
│
├── app/
│   └── (chat)/
│       ├── _layout.tsx
│       └── index.tsx
│
└── shared/
    ├── api/
    │   └── types.ts                 # + Chat API types
    ├── lib/
    │   └── formatters.ts            # + formatDuration, formatFileSize
    └── ui/
        └── Icon/assets/             # + new icons
```

---

## Фаза 1: Типы и API (2 дня)

### 1.1 Domain Types

**Файл:** `src/entities/chat/model/types.ts`

```typescript
/**
 * Chat domain types
 * Используются во всём приложении для работы с чатом
 */

export type MessageRole = 'user' | 'assistant'
export type AttachmentType = 'image' | 'video' | 'audio' | 'file'
export type UploadStatus = 'pending' | 'uploading' | 'completed' | 'error'

export interface Attachment {
	id: string
	type: AttachmentType
	localUri: string
	remoteUrl?: string
	name: string
	size: number
	mimeType: string
	duration?: number // audio/video (ms)
	width?: number // image/video
	height?: number // image/video
	uploadProgress: number
	uploadStatus: UploadStatus
}

export interface Message {
	id: string
	role: MessageRole
	content: string
	createdAt: Date
	attachments: Attachment[]
	isStreaming: boolean
}

// Initial welcome message (константа)
export const WELCOME_MESSAGE: Message = {
	id: 'welcome',
	role: 'assistant',
	content:
		'Привет! 👋\n\nЯ твой ИИ-тренер. Помогу улучшить технику, подобрать подходящие упражнения и держать мотивацию на уровне.\n\nС чего начнём сегодня? 💪',
	createdAt: new Date(),
	attachments: [],
	isStreaming: false,
}
```

### 1.2 API Types (добавить в shared)

**Файл:** `src/shared/api/types.ts` (добавить к существующим)

```typescript
// === CHAT API TYPES ===

export interface ChatMessageDto {
	id: string
	role: 'user' | 'assistant'
	content: string
	created_at: string // ISO 8601
	attachments?: ChatAttachmentDto[]
}

export interface ChatAttachmentDto {
	type: 'image' | 'video' | 'audio' | 'file'
	url: string
	name?: string
	size?: number
	duration?: number
}

export interface SendMessageRequest {
	content: string
	attachments?: Omit<ChatAttachmentDto, 'url'> & { url: string }[]
}

export interface SendMessageResponse {
	id: string
	content: string
	created_at: string
}

export interface ChatHistoryResponse {
	messages: ChatMessageDto[]
	has_more: boolean
	next_cursor?: string
}

export interface UploadFileResponse {
	url: string
	name: string
	size: number
}
```

### 1.3 Domain Mappers

**Файл:** `src/entities/chat/lib/mappers.ts`

```typescript
/**
 * Mappers: API DTO ↔ Domain entities
 * Изолируют domain от API структуры
 */

import type { ChatMessageDto, ChatAttachmentDto } from '@/shared/api/types'
import type { Message, Attachment } from '../model/types'

export const mapAttachmentFromDto = (dto: ChatAttachmentDto): Attachment => ({
	id: `att_${Date.now()}_${Math.random().toString(36).slice(2)}`,
	type: dto.type,
	localUri: dto.url,
	remoteUrl: dto.url,
	name: dto.name ?? 'file',
	size: dto.size ?? 0,
	mimeType: getMimeType(dto.type),
	duration: dto.duration,
	uploadProgress: 100,
	uploadStatus: 'completed',
})

export const mapMessageFromDto = (dto: ChatMessageDto): Message => ({
	id: dto.id,
	role: dto.role,
	content: dto.content,
	createdAt: new Date(dto.created_at),
	attachments: dto.attachments?.map(mapAttachmentFromDto) ?? [],
	isStreaming: false,
})

export const mapAttachmentToDto = (attachment: Attachment): ChatAttachmentDto => ({
	type: attachment.type,
	url: attachment.remoteUrl ?? attachment.localUri,
	name: attachment.name,
	size: attachment.size,
	duration: attachment.duration,
})

const getMimeType = (type: Attachment['type']): string => {
	switch (type) {
		case 'image':
			return 'image/jpeg'
		case 'video':
			return 'video/mp4'
		case 'audio':
			return 'audio/m4a'
		case 'file':
			return 'application/octet-stream'
	}
}
```

### 1.4 Shared Formatters (DRY)

**Файл:** `src/shared/lib/formatters.ts`

```typescript
/**
 * Общие функции форматирования
 * Переиспользуются во всём приложении
 */

/**
 * Форматирует длительность в мс в формат "M:SS"
 */
export const formatDuration = (ms: number): string => {
	const totalSeconds = Math.floor(ms / 1000)
	const minutes = Math.floor(totalSeconds / 60)
	const seconds = totalSeconds % 60
	return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

/**
 * Форматирует размер файла в человекочитаемый формат
 */
export const formatFileSize = (bytes: number): string => {
	if (bytes === 0) return '0 B'
	const k = 1024
	const sizes = ['B', 'KB', 'MB', 'GB']
	const i = Math.floor(Math.log(bytes) / Math.log(k))
	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}
```

**Обновить:** `src/shared/lib/index.ts`

```typescript
export { formatDuration, formatFileSize } from './formatters'
// ... existing exports
```

### 1.5 API Client

**Файл:** `src/features/chat/api/chatApi.ts`

```typescript
/**
 * Chat API methods
 * Использует существующий apiClient для консистентности
 */

import { apiClient } from '@/shared/api'
import type {
	ApiResult,
	SendMessageRequest,
	SendMessageResponse,
	ChatHistoryResponse,
	UploadFileResponse,
} from '@/shared/api/types'

export const chatApi = {
	/**
	 * Получить историю сообщений
	 */
	getHistory: async (params: {
		limit?: number
		cursor?: string
	}): Promise<ApiResult<ChatHistoryResponse>> => {
		const query = new URLSearchParams()
		if (params.limit) query.append('limit', String(params.limit))
		if (params.cursor) query.append('cursor', params.cursor)

		return apiClient.get(`/chat/messages?${query.toString()}`)
	},

	/**
	 * Отправить сообщение (без streaming)
	 */
	sendMessage: async (
		request: SendMessageRequest
	): Promise<ApiResult<SendMessageResponse>> => {
		return apiClient.post('/chat/messages', request)
	},

	/**
	 * Загрузить файл
	 * Использует apiClient.uploadFile (нужно добавить метод)
	 */
	uploadFile: async (
		file: { uri: string; name: string; type: string },
		onProgress?: (progress: number) => void
	): Promise<ApiResult<UploadFileResponse>> => {
		// Используем расширенный apiClient
		return apiClient.upload('/chat/upload', file, onProgress)
	},
}
```

### 1.6 Расширить apiClient для upload

**Файл:** `src/shared/api/client.ts` (добавить метод)

```typescript
/**
 * Perform file upload with progress
 */
async upload<TResponse>(
  endpoint: string,
  file: { uri: string; name: string; type: string },
  onProgress?: (progress: number) => void
): Promise<ApiResult<TResponse>> {
  const authHeaders = await this.getAuthHeaders()

  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest()
    const formData = new FormData()

    formData.append('file', {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as unknown as Blob)

    if (onProgress) {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          onProgress(Math.round((event.loaded / event.total) * 100))
        }
      })
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve({ success: true, data: JSON.parse(xhr.responseText) })
        } catch {
          resolve({ success: false, error: 'Invalid response' })
        }
      } else if (xhr.status === 401) {
        this.handleUnauthorized()
        resolve({ success: false, error: 'Unauthorized' })
      } else {
        resolve({ success: false, error: `Upload failed: ${xhr.status}` })
      }
    }

    xhr.onerror = () => {
      resolve({ success: false, error: 'Network error' })
    }

    xhr.open('POST', `${this.baseUrl}${endpoint}`)
    Object.entries(authHeaders).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value)
    })
    xhr.send(formData)
  })
}
```

---

## Фаза 2: TanStack Query Hooks (1.5 дня)

### 2.1 Chat History Query

**Файл:** `src/features/chat/api/useChatHistory.ts`

```typescript
/**
 * TanStack Query hook для истории чата
 * Следует паттерну проекта (см. trainingApi + useQuery в HomeScreen)
 */

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { chatApi } from './chatApi'
import { mapMessageFromDto } from '@/entities/chat/lib/mappers'
import { WELCOME_MESSAGE, type Message } from '@/entities/chat'

const CHAT_HISTORY_KEY = ['chat', 'history'] as const

export const useChatHistory = () => {
	const queryClient = useQueryClient()

	const query = useQuery({
		queryKey: CHAT_HISTORY_KEY,
		queryFn: async () => {
			const result = await chatApi.getHistory({ limit: 50 })
			if (!result.success) {
				throw new Error(result.error)
			}
			return result.data.messages.map(mapMessageFromDto)
		},
		// Показываем welcome message пока грузится
		placeholderData: [WELCOME_MESSAGE],
		staleTime: 1000 * 60 * 5, // 5 минут
	})

	// Добавить сообщение в кэш (optimistic update)
	const addMessageToCache = (message: Message) => {
		queryClient.setQueryData<Message[]>(CHAT_HISTORY_KEY, (old) =>
			old ? [...old, message] : [message]
		)
	}

	// Обновить сообщение в кэше
	const updateMessageInCache = (id: string, updates: Partial<Message>) => {
		queryClient.setQueryData<Message[]>(CHAT_HISTORY_KEY, (old) =>
			old?.map((msg) => (msg.id === id ? { ...msg, ...updates } : msg))
		)
	}

	// Инвалидировать кэш
	const invalidate = () => {
		queryClient.invalidateQueries({ queryKey: CHAT_HISTORY_KEY })
	}

	return {
		messages: query.data ?? [WELCOME_MESSAGE],
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
		addMessageToCache,
		updateMessageInCache,
		invalidate,
	}
}
```

### 2.2 Send Message Mutation

**Файл:** `src/features/chat/api/useSendMessage.ts`

```typescript
/**
 * TanStack Mutation для отправки сообщений
 * Поддерживает streaming через callbacks
 */

import { useMutation } from '@tanstack/react-query'
import { chatApi } from './chatApi'
import { useChatHistory } from './useChatHistory'
import type { Message, Attachment } from '@/entities/chat'
import type { SendMessageRequest } from '@/shared/api/types'
import { mapAttachmentToDto } from '@/entities/chat/lib/mappers'

interface SendMessageParams {
	content: string
	attachments: Attachment[]
}

export const useSendMessage = () => {
	const { addMessageToCache, updateMessageInCache } = useChatHistory()

	const mutation = useMutation({
		mutationFn: async (params: SendMessageParams) => {
			const request: SendMessageRequest = {
				content: params.content,
				attachments: params.attachments
					.filter((a) => a.uploadStatus === 'completed' && a.remoteUrl)
					.map(mapAttachmentToDto),
			}

			const result = await chatApi.sendMessage(request)
			if (!result.success) {
				throw new Error(result.error)
			}
			return result.data
		},
		onMutate: async (params) => {
			// Optimistic: добавляем user message
			const userMessage: Message = {
				id: `msg_${Date.now()}_user`,
				role: 'user',
				content: params.content,
				createdAt: new Date(),
				attachments: params.attachments.filter((a) => a.uploadStatus === 'completed'),
				isStreaming: false,
			}
			addMessageToCache(userMessage)

			// Optimistic: добавляем placeholder для AI ответа
			const aiMessageId = `msg_${Date.now()}_ai`
			const aiMessage: Message = {
				id: aiMessageId,
				role: 'assistant',
				content: '',
				createdAt: new Date(),
				attachments: [],
				isStreaming: true,
			}
			addMessageToCache(aiMessage)

			return { userMessage, aiMessageId }
		},
		onSuccess: (data, _variables, context) => {
			// Обновляем AI message с реальным ответом
			if (context?.aiMessageId) {
				updateMessageInCache(context.aiMessageId, {
					id: data.id,
					content: data.content,
					isStreaming: false,
				})
			}
		},
		onError: (_error, _variables, context) => {
			// При ошибке обновляем AI message
			if (context?.aiMessageId) {
				updateMessageInCache(context.aiMessageId, {
					content: 'Произошла ошибка. Попробуйте ещё раз.',
					isStreaming: false,
				})
			}
		},
	})

	return {
		sendMessage: mutation.mutate,
		sendMessageAsync: mutation.mutateAsync,
		isPending: mutation.isPending,
		isError: mutation.isError,
		error: mutation.error,
	}
}
```

### 2.3 Upload Mutation

**Файл:** `src/features/chat/api/useUploadFile.ts`

```typescript
/**
 * TanStack Mutation для загрузки файлов
 */

import { useMutation } from '@tanstack/react-query'
import { chatApi } from './chatApi'
import type { Attachment } from '@/entities/chat'

interface UploadParams {
	attachment: Attachment
	onProgress: (id: string, progress: number) => void
}

export const useUploadFile = () => {
	return useMutation({
		mutationFn: async ({ attachment, onProgress }: UploadParams) => {
			const result = await chatApi.uploadFile(
				{
					uri: attachment.localUri,
					name: attachment.name,
					type: attachment.mimeType,
				},
				(progress) => onProgress(attachment.id, progress)
			)

			if (!result.success) {
				throw new Error(result.error)
			}

			return { id: attachment.id, url: result.data.url }
		},
	})
}
```

### 2.4 API Exports

**Файл:** `src/features/chat/api/index.ts`

```typescript
export { chatApi } from './chatApi'
export { useChatHistory } from './useChatHistory'
export { useSendMessage } from './useSendMessage'
export { useUploadFile } from './useUploadFile'
```

---

## Фаза 3: Zustand Store — только Client State (0.5 дня)

### 3.1 Chat UI Store

**Файл:** `src/features/chat/model/useChatStore.ts`

```typescript
/**
 * Zustand store для CLIENT STATE чата
 *
 * ⚠️ ВАЖНО: Здесь НЕ хранятся messages — они в TanStack Query!
 * Только UI-состояние, которое не нужно синхронизировать с сервером.
 */

import { create } from 'zustand'
import type { Attachment } from '@/entities/chat'

interface ChatUIState {
	// Pending attachments (до отправки)
	pendingAttachments: Attachment[]

	// Recording state
	isRecording: boolean
}

interface ChatUIActions {
	// Attachments
	addPendingAttachment: (attachment: Attachment) => void
	removePendingAttachment: (id: string) => void
	updateAttachment: (id: string, updates: Partial<Attachment>) => void
	clearPendingAttachments: () => void

	// Recording
	setRecording: (isRecording: boolean) => void

	// Reset
	reset: () => void
}

type ChatUIStore = ChatUIState & ChatUIActions

const initialState: ChatUIState = {
	pendingAttachments: [],
	isRecording: false,
}

export const useChatStore = create<ChatUIStore>((set) => ({
	...initialState,

	// Attachments
	addPendingAttachment: (attachment) =>
		set((state) => ({
			pendingAttachments: [...state.pendingAttachments, attachment],
		})),

	removePendingAttachment: (id) =>
		set((state) => ({
			pendingAttachments: state.pendingAttachments.filter((a) => a.id !== id),
		})),

	updateAttachment: (id, updates) =>
		set((state) => ({
			pendingAttachments: state.pendingAttachments.map((a) =>
				a.id === id ? { ...a, ...updates } : a
			),
		})),

	clearPendingAttachments: () => set({ pendingAttachments: [] }),

	// Recording
	setRecording: (isRecording) => set({ isRecording }),

	// Reset
	reset: () => set(initialState),
}))
```

---

## Фаза 4: Media Hooks — Standalone (1.5 дня)

### 4.1 Audio Recorder Hook (без зависимости от store)

**Файл:** `src/features/chat/lib/useAudioRecorder.ts`

```typescript
/**
 * Hook для записи аудио
 * Standalone — не зависит от store, возвращает чистый state
 */

import { useState, useRef, useCallback } from 'react'
import { Audio } from 'expo-av'

interface UseAudioRecorderResult {
	isRecording: boolean
	duration: number // ms
	startRecording: () => Promise<void>
	stopRecording: () => Promise<string | null> // returns URI
	cancelRecording: () => Promise<void>
}

export const useAudioRecorder = (): UseAudioRecorderResult => {
	const [isRecording, setIsRecording] = useState(false)
	const [duration, setDuration] = useState(0)

	const recordingRef = useRef<Audio.Recording | null>(null)
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

	const startRecording = useCallback(async () => {
		const { status } = await Audio.requestPermissionsAsync()
		if (status !== 'granted') {
			throw new Error('Microphone permission not granted')
		}

		await Audio.setAudioModeAsync({
			allowsRecordingIOS: true,
			playsInSilentModeIOS: true,
		})

		const { recording } = await Audio.Recording.createAsync(
			Audio.RecordingOptionsPresets.HIGH_QUALITY
		)

		recordingRef.current = recording
		setIsRecording(true)
		setDuration(0)

		intervalRef.current = setInterval(() => {
			setDuration((prev) => prev + 100)
		}, 100)
	}, [])

	const stopRecording = useCallback(async (): Promise<string | null> => {
		if (!recordingRef.current) return null

		if (intervalRef.current) {
			clearInterval(intervalRef.current)
			intervalRef.current = null
		}

		await recordingRef.current.stopAndUnloadAsync()
		await Audio.setAudioModeAsync({ allowsRecordingIOS: false })

		const uri = recordingRef.current.getURI()
		recordingRef.current = null

		setIsRecording(false)
		setDuration(0)

		return uri
	}, [])

	const cancelRecording = useCallback(async () => {
		if (!recordingRef.current) return

		if (intervalRef.current) {
			clearInterval(intervalRef.current)
			intervalRef.current = null
		}

		await recordingRef.current.stopAndUnloadAsync()
		await Audio.setAudioModeAsync({ allowsRecordingIOS: false })

		recordingRef.current = null
		setIsRecording(false)
		setDuration(0)
	}, [])

	return {
		isRecording,
		duration,
		startRecording,
		stopRecording,
		cancelRecording,
	}
}
```

### 4.2 Audio Player Hook (standalone)

**Файл:** `src/features/chat/lib/useAudioPlayer.ts`

```typescript
/**
 * Hook для воспроизведения аудио
 * Standalone — управляет одним аудиофайлом
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import { Audio, type AVPlaybackStatus } from 'expo-av'

interface UseAudioPlayerResult {
	isPlaying: boolean
	duration: number
	position: number
	progress: number // 0-1
	play: (uri: string) => Promise<void>
	pause: () => Promise<void>
	stop: () => Promise<void>
	seekTo: (position: number) => Promise<void>
}

export const useAudioPlayer = (): UseAudioPlayerResult => {
	const [isPlaying, setIsPlaying] = useState(false)
	const [duration, setDuration] = useState(0)
	const [position, setPosition] = useState(0)

	const soundRef = useRef<Audio.Sound | null>(null)
	const currentUriRef = useRef<string | null>(null)

	const handleStatusUpdate = useCallback((status: AVPlaybackStatus) => {
		if (!status.isLoaded) return

		setIsPlaying(status.isPlaying)
		setPosition(status.positionMillis)
		setDuration(status.durationMillis ?? 0)

		if (status.didJustFinish) {
			setIsPlaying(false)
			setPosition(0)
		}
	}, [])

	const play = useCallback(
		async (uri: string) => {
			// Если другой файл — выгружаем текущий
			if (currentUriRef.current !== uri && soundRef.current) {
				await soundRef.current.unloadAsync()
				soundRef.current = null
			}

			if (!soundRef.current) {
				const { sound } = await Audio.Sound.createAsync(
					{ uri },
					{ shouldPlay: true },
					handleStatusUpdate
				)
				soundRef.current = sound
				currentUriRef.current = uri
			} else {
				await soundRef.current.playAsync()
			}
		},
		[handleStatusUpdate]
	)

	const pause = useCallback(async () => {
		await soundRef.current?.pauseAsync()
	}, [])

	const stop = useCallback(async () => {
		if (soundRef.current) {
			await soundRef.current.stopAsync()
			await soundRef.current.setPositionAsync(0)
		}
	}, [])

	const seekTo = useCallback(async (positionMs: number) => {
		await soundRef.current?.setPositionAsync(positionMs)
	}, [])

	// Cleanup
	useEffect(() => {
		return () => {
			soundRef.current?.unloadAsync()
		}
	}, [])

	return {
		isPlaying,
		duration,
		position,
		progress: duration > 0 ? position / duration : 0,
		play,
		pause,
		stop,
		seekTo,
	}
}
```

### 4.3 File Picker Hook

**Файл:** `src/features/chat/lib/useFilePicker.ts`

```typescript
/**
 * Hook для выбора файлов
 * Возвращает Attachment объекты, но НЕ загружает их
 */

import { useCallback } from 'react'
import * as ImagePicker from 'expo-image-picker'
import * as DocumentPicker from 'expo-document-picker'
import type { Attachment, AttachmentType } from '@/entities/chat'

const generateId = () => `att_${Date.now()}_${Math.random().toString(36).slice(2)}`

export const useFilePicker = () => {
	const pickImages = useCallback(async (): Promise<Attachment[]> => {
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ['images', 'videos'],
			allowsMultipleSelection: true,
			quality: 0.8,
		})

		if (result.canceled) return []

		return result.assets.map(
			(asset): Attachment => ({
				id: generateId(),
				type: asset.type === 'video' ? 'video' : 'image',
				localUri: asset.uri,
				name: asset.fileName ?? `media_${Date.now()}`,
				size: asset.fileSize ?? 0,
				mimeType: asset.mimeType ?? 'image/jpeg',
				width: asset.width,
				height: asset.height,
				duration: asset.duration ? asset.duration * 1000 : undefined,
				uploadProgress: 0,
				uploadStatus: 'pending',
			})
		)
	}, [])

	const pickDocuments = useCallback(async (): Promise<Attachment[]> => {
		const result = await DocumentPicker.getDocumentAsync({
			multiple: true,
			copyToCacheDirectory: true,
		})

		if (result.canceled) return []

		return result.assets.map(
			(asset): Attachment => ({
				id: generateId(),
				type: 'file',
				localUri: asset.uri,
				name: asset.name,
				size: asset.size ?? 0,
				mimeType: asset.mimeType ?? 'application/octet-stream',
				uploadProgress: 0,
				uploadStatus: 'pending',
			})
		)
	}, [])

	return { pickImages, pickDocuments }
}
```

### 4.4 Lib Exports

**Файл:** `src/features/chat/lib/index.ts`

```typescript
export { useAudioRecorder } from './useAudioRecorder'
export { useAudioPlayer } from './useAudioPlayer'
export { useFilePicker } from './useFilePicker'
```

---

## Фаза 5: UI Компоненты (3 дня)

### 5.1 Tailwind Config Update

**Добавить в:** `tailwind.config.cjs` → `theme.extend.colors`

```javascript
// Chat-specific colors (используем существующие где возможно)
'chat': {
  'bg': '#0D0D0D',
  'accent': '#CDFF00',     // Кнопка отправки
  'recording': '#FF4444',  // Индикатор записи
},
```

### 5.2 MessageList (FlashList)

**Файл:** `src/widgets/chat/ui/MessageList.tsx`

```tsx
import { useCallback, useRef } from 'react'
import { View, StyleSheet } from 'react-native'
import { FlashList, type FlashListRef } from '@shopify/flash-list'
import { useChatHistory } from '@/features/chat'
import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './TypingIndicator'
import type { Message } from '@/entities/chat'

export const MessageList = () => {
	const listRef = useRef<FlashListRef<Message>>(null)
	const { messages, isLoading } = useChatHistory()

	// Есть ли streaming сообщение
	const hasStreamingMessage = messages.some((m) => m.isStreaming)

	const renderItem = useCallback(
		({ item }: { item: Message }) => <MessageBubble message={item} />,
		[]
	)

	const keyExtractor = useCallback((item: Message) => item.id, [])

	// Разные recycling pools для user/assistant
	const getItemType = useCallback((item: Message) => item.role, [])

	return (
		<View style={styles.container}>
			<FlashList
				ref={listRef}
				data={messages}
				renderItem={renderItem}
				keyExtractor={keyExtractor}
				estimatedItemSize={80}
				getItemType={getItemType}
				maintainVisibleContentPosition={{
					autoscrollToBottomThreshold: 0.1,
					startRenderingFromBottom: true,
					animateAutoScrollToBottom: true,
				}}
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
				ListFooterComponent={
					isLoading && !hasStreamingMessage ? <TypingIndicator /> : null
				}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		paddingHorizontal: 16,
		paddingVertical: 8,
	},
})
```

### 5.3 MessageBubble (использует shared formatters)

**Файл:** `src/widgets/chat/ui/MessageBubble.tsx`

```tsx
import { memo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { AudioMessage } from './AudioMessage'
import { ImageAttachment } from './ImageAttachment'
import { FileAttachment } from './FileAttachment'
import type { Message } from '@/entities/chat'

interface Props {
	message: Message
}

export const MessageBubble = memo(({ message }: Props) => {
	const isUser = message.role === 'user'

	return (
		<View style={[styles.container, isUser && styles.userContainer]}>
			{/* Text content */}
			{message.content.length > 0 && (
				<View
					style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}
				>
					<Text style={styles.text}>
						{message.content}
						{message.isStreaming && <Text style={styles.cursor}>▌</Text>}
					</Text>
				</View>
			)}

			{/* Attachments */}
			{message.attachments.map((attachment) => {
				switch (attachment.type) {
					case 'audio':
						return (
							<AudioMessage key={attachment.id} attachment={attachment} isUser={isUser} />
						)
					case 'image':
					case 'video':
						return <ImageAttachment key={attachment.id} attachment={attachment} />
					case 'file':
						return <FileAttachment key={attachment.id} attachment={attachment} />
				}
			})}
		</View>
	)
})

MessageBubble.displayName = 'MessageBubble'

const styles = StyleSheet.create({
	container: {
		marginVertical: 4,
		maxWidth: '85%',
		alignSelf: 'flex-start',
	},
	userContainer: {
		alignSelf: 'flex-end',
	},
	bubble: {
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderRadius: 20,
	},
	userBubble: {
		backgroundColor: '#3F3F3F', // fill-700
		borderBottomRightRadius: 4,
	},
	assistantBubble: {
		backgroundColor: 'transparent',
	},
	text: {
		color: '#FFFFFF',
		fontSize: 16,
		lineHeight: 22,
	},
	cursor: {
		color: '#CDFF00',
	},
})
```

### 5.4 AudioMessage (использует shared formatters)

**Файл:** `src/widgets/chat/ui/AudioMessage.tsx`

```tsx
import { memo } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Icon } from '@/shared/ui'
import { formatDuration } from '@/shared/lib' // DRY!
import { useAudioPlayer } from '@/features/chat'
import type { Attachment } from '@/entities/chat'

interface Props {
	attachment: Attachment
	isUser: boolean
}

export const AudioMessage = memo(({ attachment, isUser }: Props) => {
	const { isPlaying, position, progress, play, pause } = useAudioPlayer()

	const handlePress = () => {
		if (isPlaying) {
			pause()
		} else {
			play(attachment.remoteUrl ?? attachment.localUri)
		}
	}

	const displayDuration = isPlaying ? position : (attachment.duration ?? 0)

	return (
		<View style={[styles.container, isUser ? styles.userBg : styles.assistantBg]}>
			<TouchableOpacity style={styles.playButton} onPress={handlePress}>
				<Icon name={isPlaying ? 'pause' : 'play'} size={24} color="#FFFFFF" />
			</TouchableOpacity>

			<View style={styles.waveform}>
				<View style={styles.progressTrack}>
					<View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
				</View>
				<Text style={styles.duration}>{formatDuration(displayDuration)}</Text>
			</View>
		</View>
	)
})

AudioMessage.displayName = 'AudioMessage'

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 12,
		borderRadius: 20,
		gap: 12,
		minWidth: 200,
	},
	userBg: { backgroundColor: '#3F3F3F' },
	assistantBg: { backgroundColor: '#1E1E1E' },
	playButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: 'rgba(255, 255, 255, 0.2)',
		alignItems: 'center',
		justifyContent: 'center',
	},
	waveform: {
		flex: 1,
		gap: 4,
	},
	progressTrack: {
		height: 4,
		backgroundColor: 'rgba(255, 255, 255, 0.2)',
		borderRadius: 2,
		overflow: 'hidden',
	},
	progressFill: {
		height: '100%',
		backgroundColor: '#CDFF00',
		borderRadius: 2,
	},
	duration: {
		color: '#949494',
		fontSize: 12,
	},
})
```

### 5.5 VoiceRecorder (использует shared formatters)

**Файл:** `src/widgets/chat/ui/VoiceRecorder.tsx`

```tsx
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { GestureDetector, Gesture } from 'react-native-gesture-handler'
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	runOnJS,
} from 'react-native-reanimated'
import { Icon } from '@/shared/ui'
import { formatDuration } from '@/shared/lib' // DRY!

interface Props {
	duration: number
	onCancel: () => void
	onSend: () => void
}

export const VoiceRecorder = ({ duration, onCancel, onSend }: Props) => {
	const translateX = useSharedValue(0)
	const cancelled = useSharedValue(false)

	const panGesture = Gesture.Pan()
		.onUpdate((event) => {
			translateX.value = Math.min(0, event.translationX)
			if (translateX.value < -100 && !cancelled.value) {
				cancelled.value = true
				runOnJS(onCancel)()
			}
		})
		.onEnd(() => {
			translateX.value = withSpring(0)
			cancelled.value = false
		})

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: translateX.value }],
	}))

	return (
		<View style={styles.container}>
			<View style={styles.recordingDot} />
			<Text style={styles.duration}>{formatDuration(duration)}</Text>

			<GestureDetector gesture={panGesture}>
				<Animated.View style={[styles.swipeArea, animatedStyle]}>
					<Icon name="chevron-left" size={16} color="#949494" />
					<Text style={styles.swipeText}>Влево - отмена</Text>
				</Animated.View>
			</GestureDetector>

			<TouchableOpacity style={styles.sendButton} onPress={onSend}>
				<Icon name="arrow-forward" size={20} color="#000000" />
			</TouchableOpacity>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#1E1E1E',
		borderRadius: 20,
		paddingHorizontal: 16,
		paddingVertical: 10,
		gap: 12,
	},
	recordingDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: '#FF4444',
	},
	duration: {
		color: '#FFFFFF',
		fontSize: 14,
		fontVariant: ['tabular-nums'],
		minWidth: 40,
	},
	swipeArea: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
	},
	swipeText: {
		color: '#949494',
		fontSize: 14,
	},
	sendButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: '#CDFF00',
		alignItems: 'center',
		justifyContent: 'center',
	},
})
```

### 5.6 MessageInput

**Файл:** `src/widgets/chat/ui/MessageInput.tsx`

```tsx
import { useState, useCallback } from 'react'
import { View, TextInput, TouchableOpacity, StyleSheet, Keyboard } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Icon } from '@/shared/ui'
import {
	useChatStore,
	useAudioRecorder,
	useFilePicker,
	useUploadFile,
} from '@/features/chat'
import { VoiceRecorder } from './VoiceRecorder'
import { AttachmentPicker } from './AttachmentPicker'
import { AttachmentPreview } from './AttachmentPreview'

interface Props {
	onSend: (content: string) => void
}

export const MessageInput = ({ onSend }: Props) => {
	const insets = useSafeAreaInsets()
	const [inputText, setInputText] = useState('')
	const [showPicker, setShowPicker] = useState(false)

	const {
		pendingAttachments,
		addPendingAttachment,
		updateAttachment,
		isRecording,
		setRecording,
	} = useChatStore()
	const { duration, startRecording, stopRecording, cancelRecording } = useAudioRecorder()
	const { pickImages, pickDocuments } = useFilePicker()
	const uploadMutation = useUploadFile()

	const hasContent = inputText.trim() || pendingAttachments.length > 0

	const handlePickImages = useCallback(async () => {
		setShowPicker(false)
		const attachments = await pickImages()

		for (const attachment of attachments) {
			addPendingAttachment(attachment)
			// Запускаем загрузку
			uploadMutation.mutate(
				{
					attachment,
					onProgress: (id, progress) =>
						updateAttachment(id, { uploadProgress: progress }),
				},
				{
					onSuccess: ({ id, url }) => {
						updateAttachment(id, { uploadStatus: 'completed', remoteUrl: url })
					},
					onError: () => {
						updateAttachment(attachment.id, { uploadStatus: 'error' })
					},
				}
			)
		}
	}, [pickImages, addPendingAttachment, updateAttachment, uploadMutation])

	const handlePickDocuments = useCallback(async () => {
		setShowPicker(false)
		const attachments = await pickDocuments()

		for (const attachment of attachments) {
			addPendingAttachment(attachment)
			uploadMutation.mutate(
				{
					attachment,
					onProgress: (id, progress) =>
						updateAttachment(id, { uploadProgress: progress }),
				},
				{
					onSuccess: ({ id, url }) => {
						updateAttachment(id, { uploadStatus: 'completed', remoteUrl: url })
					},
					onError: () => {
						updateAttachment(attachment.id, { uploadStatus: 'error' })
					},
				}
			)
		}
	}, [pickDocuments, addPendingAttachment, updateAttachment, uploadMutation])

	const handleSend = useCallback(() => {
		if (!hasContent) return
		onSend(inputText.trim())
		setInputText('')
		Keyboard.dismiss()
	}, [hasContent, inputText, onSend])

	const handleStartRecording = useCallback(async () => {
		setRecording(true)
		await startRecording()
	}, [setRecording, startRecording])

	const handleStopRecording = useCallback(async () => {
		const uri = await stopRecording()
		setRecording(false)
		if (uri) {
			// TODO: создать attachment и загрузить
		}
	}, [stopRecording, setRecording])

	const handleCancelRecording = useCallback(async () => {
		await cancelRecording()
		setRecording(false)
	}, [cancelRecording, setRecording])

	return (
		<View style={[styles.container, { paddingBottom: insets.bottom + 8 }]}>
			<AttachmentPicker
				visible={showPicker}
				onClose={() => setShowPicker(false)}
				onPickImages={handlePickImages}
				onPickDocuments={handlePickDocuments}
			/>

			{pendingAttachments.length > 0 && (
				<AttachmentPreview attachments={pendingAttachments} />
			)}

			<View style={styles.inputRow}>
				{!isRecording && (
					<TouchableOpacity style={styles.iconButton} onPress={() => setShowPicker(true)}>
						<Icon name="attachment" size={24} color="#949494" />
					</TouchableOpacity>
				)}

				{isRecording ? (
					<VoiceRecorder
						duration={duration}
						onCancel={handleCancelRecording}
						onSend={handleStopRecording}
					/>
				) : (
					<View style={styles.inputContainer}>
						<TextInput
							value={inputText}
							onChangeText={setInputText}
							placeholder="Сообщение"
							placeholderTextColor="#949494"
							multiline
							style={styles.input}
						/>
					</View>
				)}

				{hasContent ? (
					<TouchableOpacity style={styles.sendButton} onPress={handleSend}>
						<Icon name="arrow-forward" size={20} color="#000000" />
					</TouchableOpacity>
				) : (
					<TouchableOpacity
						style={styles.iconButton}
						onPress={isRecording ? handleStopRecording : handleStartRecording}
					>
						<Icon
							name="microphone"
							size={24}
							color={isRecording ? '#CDFF00' : '#949494'}
						/>
					</TouchableOpacity>
				)}
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		paddingHorizontal: 16,
		paddingTop: 8,
		backgroundColor: '#0D0D0D',
		borderTopWidth: 1,
		borderTopColor: '#1E1E1E',
	},
	inputRow: {
		flexDirection: 'row',
		alignItems: 'flex-end',
		gap: 8,
	},
	iconButton: {
		width: 40,
		height: 40,
		alignItems: 'center',
		justifyContent: 'center',
	},
	inputContainer: {
		flex: 1,
		backgroundColor: '#1E1E1E',
		borderRadius: 20,
		paddingHorizontal: 16,
		paddingVertical: 10,
		maxHeight: 120,
	},
	input: {
		color: '#FFFFFF',
		fontSize: 16,
		lineHeight: 22,
		maxHeight: 100,
	},
	sendButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: '#CDFF00',
		alignItems: 'center',
		justifyContent: 'center',
	},
})
```

### 5.7 ChatScreen (композиция)

**Файл:** `src/widgets/chat/ui/ChatScreen.tsx`

```tsx
/**
 * Chat Screen — композиция UI
 * Вся логика в hooks из features/chat
 */

import { useCallback } from 'react'
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useChatStore, useSendMessage } from '@/features/chat'
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'
import { ChatHeader } from './ChatHeader'

export const ChatScreen = () => {
	const router = useRouter()
	const insets = useSafeAreaInsets()

	const { pendingAttachments, clearPendingAttachments } = useChatStore()
	const { sendMessage, isPending } = useSendMessage()

	const handleSend = useCallback(
		(content: string) => {
			sendMessage({
				content,
				attachments: pendingAttachments,
			})
			clearPendingAttachments()
		},
		[pendingAttachments, sendMessage, clearPendingAttachments]
	)

	return (
		<View style={[styles.container, { paddingTop: insets.top }]}>
			<ChatHeader onBack={() => router.back()} />

			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : undefined}
				style={styles.content}
				keyboardVerticalOffset={insets.top}
			>
				<MessageList />
				<MessageInput onSend={handleSend} />
			</KeyboardAvoidingView>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#0D0D0D',
	},
	content: {
		flex: 1,
	},
})
```

### 5.8 ChatHeader

**Файл:** `src/widgets/chat/ui/ChatHeader.tsx`

```tsx
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Icon, BackButton } from '@/shared/ui'

interface Props {
	onBack: () => void
}

export const ChatHeader = ({ onBack }: Props) => {
	return (
		<View style={styles.container}>
			<BackButton onPress={onBack} position="relative" />

			<Text style={styles.title}>ИИ-ассистент</Text>

			<TouchableOpacity style={styles.menuButton}>
				<Icon name="dots-three-vertical" size={24} color="#FFFFFF" />
			</TouchableOpacity>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 8,
		paddingVertical: 8,
		borderBottomWidth: 1,
		borderBottomColor: '#1E1E1E',
	},
	title: {
		color: '#FFFFFF',
		fontSize: 18,
		fontWeight: '600',
	},
	menuButton: {
		width: 48,
		height: 48,
		alignItems: 'center',
		justifyContent: 'center',
	},
})
```

### 5.9 Остальные компоненты

Компоненты `ImageAttachment`, `FileAttachment`, `AttachmentPicker`, `AttachmentPreview`, `TypingIndicator` реализуются по аналогичному паттерну.

### 5.10 Exports

**Файл:** `src/widgets/chat/ui/index.ts`

```typescript
export { ChatScreen } from './ChatScreen'
export { ChatHeader } from './ChatHeader'
export { MessageList } from './MessageList'
export { MessageBubble } from './MessageBubble'
export { MessageInput } from './MessageInput'
export { VoiceRecorder } from './VoiceRecorder'
export { AudioMessage } from './AudioMessage'
// ... остальные
```

**Файл:** `src/widgets/chat/index.ts`

```typescript
export { ChatScreen } from './ui'
```

---

## Фаза 6: Роутинг (0.5 дня)

### 6.1 Chat Route Group

**Файл:** `src/app/(chat)/_layout.tsx`

```tsx
import { Stack } from 'expo-router'

export default function ChatLayout() {
	return (
		<Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
			<Stack.Screen name="index" />
		</Stack>
	)
}
```

### 6.2 Chat Page

**Файл:** `src/app/(chat)/index.tsx`

```tsx
import { ChatScreen } from '@/widgets/chat'

export default function ChatPage() {
	return <ChatScreen />
}
```

---

## Фаза 7: Интеграция (1 день)

### 7.1 Навигация в чат

Добавить в `NavigationBar` или `HomeScreen`:

```tsx
<TouchableOpacity onPress={() => router.push('/(chat)')}>
	<Icon name="chat" size={24} color="#FFFFFF" />
</TouchableOpacity>
```

### 7.2 Feature exports

**Файл:** `src/features/chat/index.ts`

```typescript
// API & Queries
export { chatApi, useChatHistory, useSendMessage, useUploadFile } from './api'

// Model (store)
export { useChatStore } from './model/useChatStore'

// Lib (hooks)
export { useAudioRecorder, useAudioPlayer, useFilePicker } from './lib'
```

---

## Timeline (обновлённый)

| Фаза | Название             | Дни | Кумулятивно |
| ---- | -------------------- | --- | ----------- |
| 0    | Подготовка           | 1   | 1           |
| 1    | Типы и API           | 2   | 3           |
| 2    | TanStack Query Hooks | 1.5 | 4.5         |
| 3    | Zustand Store        | 0.5 | 5           |
| 4    | Media Hooks          | 1.5 | 6.5         |
| 5    | UI компоненты        | 3   | 9.5         |
| 6    | Роутинг              | 0.5 | 10          |
| 7    | Интеграция           | 1   | 11          |

**Итого: ~11 рабочих дней (2.2 недели)**

---

## Ключевые архитектурные решения

### FSD Compliance ✅

- **entities/chat** — только типы и mappers
- **features/chat** — вся бизнес-логика (API, store, hooks)
- **widgets/chat** — только UI композиция

### TanStack Query ✅

- `useChatHistory` — server state для сообщений
- `useSendMessage` — mutation с optimistic updates
- `useUploadFile` — mutation для загрузки файлов

### Zustand ✅

- Только client state: `pendingAttachments`, `isRecording`
- НЕ хранит messages — они в React Query

### DRY ✅

- `formatDuration` в `shared/lib/formatters.ts`
- API types в `shared/api/types.ts`
- Mappers изолируют domain от API

### SOLID ✅

- **SRP**: Каждый hook делает одну вещь
- **OCP**: Hooks расширяемы через callbacks
- **DIP**: UI зависит от abstractions (hooks), не от implementations

---

## Чек-лист готовности

### Для каждого компонента:

- [ ] TypeScript без ошибок
- [ ] ESLint без warnings
- [ ] Следует FSD архитектуре
- [ ] Использует shared компоненты
- [ ] Safe Area корректно
- [ ] iOS + Android работает

### Для модуля:

- [ ] Все функции из PRD реализованы
- [ ] 60 FPS при скролле
- [ ] Нет утечек памяти
- [ ] TanStack Query правильно используется
- [ ] Zustand только для client state

---

_План версия: 2.0_
_Дата обновления: 4 декабря 2025_
_Изменения: FSD compliance, TanStack Query интеграция, DRY/SOLID_
