/**
 * Hook для загрузки attachment с прогрессом
 * Централизует логику upload + store update
 * Single Responsibility: только загрузка
 */

import { useCallback, useState } from 'react'
import { useChatStore, createAttachment } from './useChatStore'
import type { AttachmentType } from '@/entities/chat'
import { apiClient } from '@/shared/api/client'

interface UploadParams {
    type: AttachmentType
    localUri: string
    name: string
    mimeType: string
    size?: number
    duration?: number
    width?: number
    height?: number
}

type AvatarPresignUrlResponse = {
    url: string
}

export const useAttachmentUpload = (userId: number | null) => {
    const [isUploading, setIsUploading] = useState(false)
    const {
        addPendingAttachment,
        updateAttachmentProgress,
        markAttachmentUploaded,
        markAttachmentError,
    } = useChatStore()

    const uploadAttachment = useCallback(
        async (params: UploadParams) => {
            if (!userId) {
                throw new Error('User is required for upload')
            }
            if (params.type !== 'image') {
                throw new Error('Only image attachments are supported right now')
            }
            const attachment = createAttachment({
                type: params.type,
                localUri: params.localUri,
                name: params.name,
                size: params.size ?? 0,
                mimeType: params.mimeType,
                duration: params.duration,
                width: params.width,
                height: params.height,
            })

            addPendingAttachment(attachment)

            const safeName = (params.name || 'image.jpg').trim() || 'image.jpg'
            const prefixedName = `${userId}-${safeName}`

            try {
                setIsUploading(true)
                const presign = await apiClient.put<undefined, AvatarPresignUrlResponse>(
                    `/user/avatar/presign-url?filename=${encodeURIComponent(prefixedName)}`,
                    undefined
                )

                if (!presign.success || !presign.data?.url) {
                    throw new Error(presign.error || 'Failed to get presigned URL')
                }

                const uploadUrl = presign.data.url
                const formData = new FormData()
                formData.append('file', {
                    uri: params.localUri,
                    name: safeName,
                    type: params.mimeType,
                } as unknown as Blob)

                updateAttachmentProgress(attachment.id, 0)

                const response = await fetch(uploadUrl, {
                    method: 'POST',
                    body: formData,
                })

                if (!response.ok) {
                    throw new Error(`Upload failed with status ${response.status}`)
                }

                const publicUrl = uploadUrl.split('?')[0]
                updateAttachmentProgress(attachment.id, 100)
                markAttachmentUploaded(attachment.id, publicUrl)
                return attachment.id
            } catch (error) {
                markAttachmentError(attachment.id)
                throw error
            } finally {
                setIsUploading(false)
            }
        },
        [addPendingAttachment, markAttachmentError, markAttachmentUploaded, updateAttachmentProgress, userId]
    )

    return {
        uploadAttachment,
        isUploading,
    }
}
