/**
 * Chat Zustand store
 * Client state: pending attachments + Mock mode
 * Server state managed by TanStack Query (in real mode)
 */

import { create } from 'zustand'
import type { Attachment, AttachmentType, Message } from '@/entities/chat'
import { generateId } from '@/shared/lib'
import { WELCOME_MESSAGE } from '@/entities/chat'

interface ChatState {
    // === Mock Mode ===
    isMockMode: boolean
    mockMessages: Message[]
    toggleMockMode: () => void
    addMockMessage: (message: Message) => void
    clearMockMessages: () => void

    // === Pending Attachments ===
    pendingAttachments: Attachment[]
    addPendingAttachment: (attachment: Attachment) => void
    removePendingAttachment: (id: string) => void
    updateAttachmentProgress: (id: string, progress: number) => void
    markAttachmentUploaded: (id: string, remoteUrl: string) => void
    markAttachmentError: (id: string) => void
    clearPendingAttachments: () => void
}

export const useChatStore = create<ChatState>((set) => ({
    // === Mock Mode ===
    isMockMode: false,
    mockMessages: [WELCOME_MESSAGE], // Начинаем с приветственного сообщения

    toggleMockMode: () =>
        set((state) => {
            const newMode = !state.isMockMode
            // При переключении в mock режим - сбрасываем сообщения
            return {
                isMockMode: newMode,
                mockMessages: newMode ? [WELCOME_MESSAGE] : state.mockMessages,
            }
        }),

    addMockMessage: (message) =>
        set((state) => ({
            mockMessages: [...state.mockMessages, message],
        })),

    clearMockMessages: () =>
        set({ mockMessages: [WELCOME_MESSAGE] }),

    // === Pending Attachments ===
    pendingAttachments: [],

    addPendingAttachment: (attachment) =>
        set((state) => ({
            pendingAttachments: [
                ...state.pendingAttachments,
                { ...attachment, id: attachment.id || generateId('att') },
            ],
        })),

    removePendingAttachment: (id) =>
        set((state) => ({
            pendingAttachments: state.pendingAttachments.filter((a) => a.id !== id),
        })),

    updateAttachmentProgress: (id, progress) =>
        set((state) => ({
            pendingAttachments: state.pendingAttachments.map((a) =>
                a.id === id ? { ...a, uploadProgress: progress, uploadStatus: 'uploading' } : a
            ),
        })),

    markAttachmentUploaded: (id, remoteUrl) =>
        set((state) => ({
            pendingAttachments: state.pendingAttachments.map((a) =>
                a.id === id
                    ? { ...a, remoteUrl, uploadProgress: 100, uploadStatus: 'completed' }
                    : a
            ),
        })),

    markAttachmentError: (id) =>
        set((state) => ({
            pendingAttachments: state.pendingAttachments.map((a) =>
                a.id === id ? { ...a, uploadStatus: 'error' } : a
            ),
        })),

    clearPendingAttachments: () => set({ pendingAttachments: [] }),
}))

/**
 * Factory для создания Attachment из выбранного файла
 */
export const createAttachment = (params: {
    type: AttachmentType
    localUri: string
    name: string
    size: number
    mimeType: string
    duration?: number
    width?: number
    height?: number
}): Attachment => ({
    id: generateId('att'),
    type: params.type,
    localUri: params.localUri,
    name: params.name,
    size: params.size,
    mimeType: params.mimeType,
    duration: params.duration,
    width: params.width,
    height: params.height,
    uploadProgress: 0,
    uploadStatus: 'pending',
})
