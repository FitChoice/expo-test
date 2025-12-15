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
	uploadProgress: number // 0-100
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

/**
 * Определяет тип вложения по MIME-типу
 */
export const getAttachmentTypeFromMime = (mimeType: string): AttachmentType => {
    if (mimeType.startsWith('image/')) return 'image'
    if (mimeType.startsWith('video/')) return 'video'
    if (mimeType.startsWith('audio/')) return 'audio'
    return 'file'
}
