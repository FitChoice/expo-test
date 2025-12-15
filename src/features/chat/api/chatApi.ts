/**
 * Chat API layer
 * Работает с реальным backend (без mock/SSE)
 */

import { apiClient } from '@/shared/api/client'
import type {
    ApiResult,
    ChatHistoryResponse,
    SendChatMessageRequest,
    SendChatMessageResponse,
    UploadFileResponse,
    ChatMessageDto,
} from '@/shared/api/types'

interface HistoryParams {
    userId: number
    limit?: number
    offset?: number
}

export const getChatHistory = async ({
    userId,
    limit = 20,
    offset = 0,
}: HistoryParams): Promise<ApiResult<ChatHistoryResponse>> => {
    const endpoint = `/chat?user_id=${userId}&limit=${limit}&offset=${offset}`
    return apiClient.get<ChatHistoryResponse>(endpoint)
}

export const getChatLatest = async ({
    userId,
    afterId,
}: {
	userId: number
	afterId: number
}): Promise<ApiResult<ChatMessageDto[]>> => {
    const endpoint = `/chat/latest?user_id=${userId}&after_id=${afterId}`
    return apiClient.get<ChatMessageDto[]>(endpoint)
}

export const sendChatMessage = async (
    data: SendChatMessageRequest
): Promise<ApiResult<SendChatMessageResponse>> => {
    return apiClient.post<SendChatMessageRequest, SendChatMessageResponse>(
        '/chat/message',
        data
    )
}

export const uploadFile = async (
    file: { uri: string; name: string; type: string },
    onProgress?: (progress: number) => void
): Promise<ApiResult<UploadFileResponse>> => {
    return apiClient.upload<UploadFileResponse>('/chat/upload', file, { onProgress })
}
