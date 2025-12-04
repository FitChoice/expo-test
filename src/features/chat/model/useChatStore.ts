/**
 * Chat Zustand store
 * Client state only - pending attachments
 * Server state managed by TanStack Query
 * Recording state is local to useAudioRecorder hook (SRP)
 */

import { create } from 'zustand'
import type { Attachment, AttachmentType } from '@/entities/chat'
import { generateId } from '@/shared/lib'

interface ChatState {
	// Pending attachments not yet sent
	pendingAttachments: Attachment[]

	// Actions
	addPendingAttachment: (attachment: Attachment) => void
	removePendingAttachment: (id: string) => void
	updateAttachmentProgress: (id: string, progress: number) => void
	markAttachmentUploaded: (id: string, remoteUrl: string) => void
	markAttachmentError: (id: string) => void
	clearPendingAttachments: () => void
}

export const useChatStore = create<ChatState>((set) => ({
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
