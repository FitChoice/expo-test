/**
 * Chat API layer
 * Взаимодействует с бэкендом для чата
 */

import { apiClient } from '@/shared/api/client'
import type {
    ApiResult,
    ChatHistoryResponse,
    SendChatMessageRequest,
    SendChatMessageResponse,
    UploadFileResponse,
} from '@/shared/api/types'

/**
 * Получить историю чата
 */
export const getChatHistory = async (
    cursor?: string
): Promise<ApiResult<ChatHistoryResponse>> => {
    const endpoint = cursor ? `/chat/history?cursor=${cursor}` : '/chat/history'
    return apiClient.get<ChatHistoryResponse>(endpoint)
}

/**
 * Отправить сообщение в чат (без стриминга)
 */
export const sendChatMessage = async (
    data: SendChatMessageRequest
): Promise<ApiResult<SendChatMessageResponse>> => {
    return apiClient.post<SendChatMessageRequest, SendChatMessageResponse>(
        '/chat/message',
        data
    )
}

/**
 * Загрузить файл
 */
export const uploadFile = async (
    file: { uri: string; name: string; type: string },
    onProgress?: (progress: number) => void
): Promise<ApiResult<UploadFileResponse>> => {
    return apiClient.upload<UploadFileResponse>('/chat/upload', file, { onProgress })
}

/**
 * Создаёт SSE стрим для получения ответа AI
 * Возвращает функцию для закрытия стрима
 */
export const streamChatResponse = async (
    data: SendChatMessageRequest,
    callbacks: {
		onChunk: (text: string) => void
		onComplete: (messageId: string) => void
		onError: (error: string) => void
	}
): Promise<{ close: () => void }> => {
    const { onChunk, onComplete, onError } = callbacks

    // Get auth token
    const SecureStore = await import('expo-secure-store')
    const token = await SecureStore.getItemAsync('auth_token')

    const { env } = await import('@/shared/config')

    // Note: React Native doesn't fully support EventSource
    // Using fetch with text streaming as alternative
    const abortController = new AbortController()

    const fetchStream = async () => {
        try {
            const response = await fetch(`${env.API_URL}/chat/stream`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'text/event-stream',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(data),
                signal: abortController.signal,
            })

            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`)
            }

            if (!response.body) {
                throw new Error('ReadableStream not supported')
            }

            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            let buffer = ''
            let messageId = ''

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                buffer += decoder.decode(value, { stream: true })

                // Parse SSE events
                const lines = buffer.split('\n')
                buffer = lines.pop() ?? '' // Keep incomplete line

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const eventData = line.slice(6)

                        if (eventData === '[DONE]') {
                            onComplete(messageId)
                            return
                        }

                        try {
                            const parsed = JSON.parse(eventData) as {
								type: 'chunk' | 'complete'
								content?: string
								message_id?: string
							}

                            if (parsed.type === 'chunk' && parsed.content) {
                                onChunk(parsed.content)
                            } else if (parsed.type === 'complete' && parsed.message_id) {
                                messageId = parsed.message_id
                            }
                        } catch {
                            // Not JSON, treat as plain text chunk
                            onChunk(eventData)
                        }
                    }
                }
            }

            onComplete(messageId || `msg_${Date.now()}`)
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                return
            }
            onError(error instanceof Error ? error.message : 'Stream error')
        }
    }

    fetchStream()

    return {
        close: () => abortController.abort(),
    }
}
