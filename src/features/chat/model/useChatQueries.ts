/**
 * TanStack Query hooks для работы с чатом
 * Server state management
 */

import { useInfiniteQuery, useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query'
import { getChatHistory, sendChatMessage, uploadFile } from '../api'
import { mapMessagesFromDto, mapAttachmentToDto } from '@/entities/chat'
import type { Message, Attachment } from '@/entities/chat'
import type { SendChatMessageRequest, ChatAttachmentDto } from '@/shared/api/types'
import { generateId } from '@/shared/lib/utils'

// Query keys для cache management
export const chatQueryKeys = {
    all: ['chat'] as const,
    history: (userId: number, limit?: number) =>
        [...chatQueryKeys.all, 'history', userId, limit ?? 'default'] as const,
}

type ChatPage = {
    messages: Message[]
    limit: number
    offset: number
}

export const CHAT_PAGE_SIZE = 20

/**
 * Hook для загрузки истории чата
 * Поддерживает infinite scroll по offset/limit
 */
export const useChatHistory = ({
    userId,
    limit = CHAT_PAGE_SIZE,
    enabled = true,
}: {
	userId?: number | null
	limit?: number
	enabled?: boolean
}) => {
    return useInfiniteQuery({
        queryKey: chatQueryKeys.history(userId ?? 0, limit),
        queryFn: async ({ pageParam }) => {
            if (!userId) {
                return { messages: [] as Message[], limit, offset: 0 }
            }
            const currentOffset = typeof pageParam === 'number' ? pageParam : 0
            const result = await getChatHistory({ userId, limit, offset: currentOffset })
            if (!result.success) {
                throw new Error(result.error)
            }
            return {
                messages: mapMessagesFromDto(result.data.messages),
                limit: result.data.limit,
                offset: result.data.offset,
            }
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage) =>
            lastPage.messages.length < lastPage.limit
                ? undefined
                : lastPage.offset + lastPage.limit,
        enabled: Boolean(userId) && enabled,
    })
}

/**
 * Hook для отправки сообщения и получения AI-ответа (без стриминга)
 */
export const useSendMessage = (limit: number = CHAT_PAGE_SIZE) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            content,
            attachments,
            userId,
        }: {
			content: string
			attachments: Attachment[]
			userId: number
		}) => {
            const attachmentDtos: ChatAttachmentDto[] = attachments
                .filter((a) => a.uploadStatus === 'completed' && a.remoteUrl)
                .map(mapAttachmentToDto)

            const request: SendChatMessageRequest = {
                content,
                files: attachmentDtos.length > 0 ? attachmentDtos : undefined,
                role: 'user',
                user_id: userId,
            }

            const result = await sendChatMessage(request)

            if (!result.success) {
                throw new Error(result.error)
            }

            return result.data
        },
        onMutate: async ({ content, attachments, userId }) => {
            const queryKey = chatQueryKeys.history(userId, limit)
            await queryClient.cancelQueries({ queryKey })

            const previousData = queryClient.getQueryData<InfiniteData<ChatPage>>(queryKey)

            const optimisticUserMessage: Message = {
                id: generateId('msg'),
                role: 'user',
                content,
                createdAt: new Date(),
                attachments,
                isStreaming: false,
            }

            queryClient.setQueryData(queryKey, (oldData?: InfiniteData<ChatPage>) => {
                if (!oldData || !oldData.pages || oldData.pages.length === 0) {
                    return {
                        pages: [{ messages: [optimisticUserMessage], limit, offset: 0 }],
                        pageParams: [0],
                    }
                }
                const [firstPage, ...rest] = oldData.pages
                if (!firstPage) return oldData
                const updatedFirst = {
                    ...firstPage,
                    messages: [...firstPage.messages, optimisticUserMessage],
                }
                return { ...oldData, pages: [updatedFirst, ...rest] }
            })

            return { previousData, userId, optimisticUserMessage }
        },
        onError: (_error, variables, context) => {
            if (!context) return
            const queryKey = chatQueryKeys.history(context.userId, limit)
            if (context.previousData) {
                queryClient.setQueryData(queryKey, context.previousData)
            }
        },
        onSuccess: (data, variables, context) => {
            if (!context) return
            const queryKey = chatQueryKeys.history(context.userId, limit)
            queryClient.setQueryData(queryKey, (oldData?: InfiniteData<ChatPage>) => {
                if (!oldData || !oldData.pages || oldData.pages.length === 0) return oldData
                const [firstPage, ...rest] = oldData.pages
                if (!firstPage) return oldData

                const assistantMessage: Message = {
                    id: generateId('msg'),
                    role: 'assistant',
                    content: data.message,
                    createdAt: new Date(),
                    attachments: [],
                    isStreaming: false,
                }

                const updatedFirst = {
                    ...firstPage,
                    messages: [...firstPage.messages, assistantMessage],
                }

                return { ...oldData, pages: [updatedFirst, ...rest] }
            })
        },
        onSettled: (_data, _error, variables) => {
            if (variables?.userId) {
                queryClient.invalidateQueries({
                    queryKey: chatQueryKeys.history(variables.userId, limit),
                })
            }
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
