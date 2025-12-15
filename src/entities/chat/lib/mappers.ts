/**
 * Mappers: API DTO ↔ Domain entities
 * Изолируют domain от API структуры
 */

import type { ChatMessageDto, ChatAttachmentDto } from '@/shared/api/types'
import type { Message, Attachment, AttachmentType } from '../model/types'
import { generateId } from '@/shared/lib/utils'

/**
 * Нормализация type из API в доменный AttachmentType
 */
const normalizeAttachmentType = (type: string): AttachmentType => {
    if (type === 'image' || type === 'video' || type === 'audio' || type === 'file') return type
    return 'file'
}

/**
 * Определяет MIME-тип по типу attachment
 */
const getMimeTypeByAttachmentType = (type: AttachmentType): string => {
    switch (type) {
    case 'image':
        return 'image/jpeg'
    case 'video':
        return 'video/mp4'
    case 'audio':
        return 'audio/m4a'
    case 'file':
    default:
        return 'application/octet-stream'
    }
}

/**
 * Преобразует DTO вложения в domain entity
 */
export const mapAttachmentFromDto = (dto: ChatAttachmentDto): Attachment => {
    const type = normalizeAttachmentType(dto.type)
    return {
        id: generateId('att'),
        type,
        localUri: dto.url,
        remoteUrl: dto.url,
        name: dto.name ?? 'file',
        size: dto.size ?? 0,
        mimeType: getMimeTypeByAttachmentType(type),
        duration: dto.duration,
        uploadProgress: 100,
        uploadStatus: 'completed',
    }
}

/**
 * Преобразует DTO сообщения в domain entity
 */
export const mapMessageFromDto = (dto: ChatMessageDto): Message => ({
    id: String(dto.id),
    role: dto.role === 'assistant' ? 'assistant' : 'user',
    content: dto.content,
    createdAt: new Date(dto.created_at),
    attachments: dto.files?.map(mapAttachmentFromDto) ?? [],
    isStreaming: false,
})

/**
 * Преобразует domain attachment в DTO для отправки
 */
export const mapAttachmentToDto = (attachment: Attachment): ChatAttachmentDto => ({
    type: attachment.type,
    url: attachment.remoteUrl ?? '',
    name: attachment.name,
    size: attachment.size,
    duration: attachment.duration,
})

/**
 * Преобразует массив сообщений из DTO
 */
export const mapMessagesFromDto = (dtos: ChatMessageDto[]): Message[] =>
    dtos.map(mapMessageFromDto)
