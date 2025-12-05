/**
 * TanStack Query hooks для работы с чатом
 * Server state management
 */

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getChatHistory, sendChatMessage, uploadFile, streamChatResponse } from '../api'
import { mapMessagesFromDto, mapAttachmentToDto } from '@/entities/chat'
import type { Message, Attachment } from '@/entities/chat'
import type { SendChatMessageRequest, ChatAttachmentDto } from '@/shared/api/types'
import { useRef, useCallback, useState } from 'react'

// Query keys для cache management
export const chatQueryKeys = {
    all: ['chat'] as const,
    history: () => [...chatQueryKeys.all, 'history'] as const,
}

/**
 * Hook для загрузки истории чата
 * Поддерживает infinite scroll
 * При 404 (endpoint не найден или нет истории) возвращает пустой массив
 */
export const useChatHistory = () => {
    return useInfiniteQuery({
        queryKey: chatQueryKeys.history(),
        queryFn: async ({ pageParam }) => {
            const result = await getChatHistory(pageParam as string | undefined)

            // Graceful handling: если 404 или нет данных - возвращаем пустую историю
            if (!result.success) {
                // Не бросаем ошибку для 404 - просто нет истории
                if (result.error?.includes('404') || result.error?.includes('not found')) {
                    return {
                        messages: [] as Message[],
                        hasMore: false,
                        nextCursor: undefined,
                    }
                }
                throw new Error(result.error)
            }

            return {
                messages: mapMessagesFromDto(result.data.messages),
                hasMore: result.data.has_more,
                nextCursor: result.data.next_cursor,
            }
        },
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
        select: (data) => ({
            // Flatten all pages into single message array
            messages: data.pages.flatMap((page) => page.messages),
            hasMore: data.pages[data.pages.length - 1]?.hasMore ?? false,
        }),
        // Не повторять запросы при ошибке 404
        retry: (failureCount, error) => {
            if (error.message?.includes('404')) return false
            return failureCount < 3
        },
    })
}

/**
 * Hook для отправки сообщения
 * Использует optimistic update
 */
export const useSendMessage = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            content,
            attachments,
        }: {
			content: string
			attachments: Attachment[]
		}) => {
            const attachmentDtos: ChatAttachmentDto[] = attachments
                .filter((a) => a.uploadStatus === 'completed' && a.remoteUrl)
                .map(mapAttachmentToDto)

            const request: SendChatMessageRequest = {
                content,
                attachments: attachmentDtos.length > 0 ? attachmentDtos : undefined,
            }

            const result = await sendChatMessage(request)
            if (!result.success) {
                throw new Error(result.error)
            }
            return result.data
        },
        onMutate: async ({ content, attachments }) => {
            // Cancel outgoing queries
            await queryClient.cancelQueries({ queryKey: chatQueryKeys.history() })

            // Get current cache
            const previousData = queryClient.getQueryData(chatQueryKeys.history())

            // Optimistic update - add user message
            const optimisticMessage: Message = {
                id: `temp_${Date.now()}`,
                role: 'user',
                content,
                createdAt: new Date(),
                attachments,
                isStreaming: false,
            }

            // This is complex with infinite query, so we'll invalidate instead
            // For now, we return context for rollback
            return { previousData, optimisticMessage }
        },
        onError: (_, __, context) => {
            // Rollback on error
            if (context?.previousData) {
                queryClient.setQueryData(chatQueryKeys.history(), context.previousData)
            }
        },
        onSettled: () => {
            // Refetch to sync with server
            queryClient.invalidateQueries({ queryKey: chatQueryKeys.history() })
        },
    })
}

/**
 * Hook для загрузки файла
 */
export const useUploadFile = () => {
    return useMutation({
        mutationFn: async ({
            file,
            onProgress,
        }: {
			file: { uri: string; name: string; type: string }
			onProgress?: (progress: number) => void
		}) => {
            const result = await uploadFile(file, onProgress)
            if (!result.success) {
                throw new Error(result.error)
            }
            return result.data
        },
    })
}

/**
 * Hook для стриминга AI ответа
 */
export const useStreamResponse = () => {
    const [streamingContent, setStreamingContent] = useState('')
    const [isStreaming, setIsStreaming] = useState(false)
    const streamRef = useRef<{ close: () => void } | null>(null)
    const queryClient = useQueryClient()

    const startStream = useCallback(
        async (content: string, attachments: Attachment[]) => {
            setIsStreaming(true)
            setStreamingContent('')

            const attachmentDtos: ChatAttachmentDto[] = attachments
                .filter((a) => a.uploadStatus === 'completed' && a.remoteUrl)
                .map(mapAttachmentToDto)

            const request: SendChatMessageRequest = {
                content,
                attachments: attachmentDtos.length > 0 ? attachmentDtos : undefined,
            }

            try {
                streamRef.current = await streamChatResponse(request, {
                    onChunk: (text) => {
                        setStreamingContent((prev) => prev + text)
                    },
                    onComplete: () => {
                        setIsStreaming(false)
                        // Invalidate to get final message from server
                        queryClient.invalidateQueries({ queryKey: chatQueryKeys.history() })
                    },
                    onError: (error) => {
                        // Graceful handling: при 404 показываем заглушку
                        if (error.includes('404')) {
                            setStreamingContent(
                                'API чата в разработке. Скоро AI-ассистент будет доступен! 🚀'
                            )
                            setTimeout(() => {
                                setIsStreaming(false)
                                setStreamingContent('')
                            }, 2000)
                        } else {
                            console.error('Stream error:', error)
                            setIsStreaming(false)
                        }
                    },
                })
            } catch {
                // Network error или другая ошибка инициализации
                setStreamingContent('Не удалось подключиться к серверу. Попробуйте позже.')
                setTimeout(() => {
                    setIsStreaming(false)
                    setStreamingContent('')
                }, 2000)
            }
        },
        [queryClient]
    )

    const stopStream = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.close()
            streamRef.current = null
        }
        setIsStreaming(false)
    }, [])

    return {
        streamingContent,
        isStreaming,
        startStream,
        stopStream,
    }
}
