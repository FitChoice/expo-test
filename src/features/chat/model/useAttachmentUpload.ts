/**
 * Hook для загрузки attachment с прогрессом
 * Централизует логику upload + store update
 * Single Responsibility: только загрузка
 */

import { useCallback } from 'react'
import { useUploadFile } from './useChatQueries'
import { useChatStore, createAttachment } from './useChatStore'
import type { AttachmentType } from '@/entities/chat'

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

export const useAttachmentUpload = () => {
    const uploadFileMutation = useUploadFile()
    const {
        addPendingAttachment,
        updateAttachmentProgress,
        markAttachmentUploaded,
        markAttachmentError,
    } = useChatStore()

    const uploadAttachment = useCallback(
        (params: UploadParams) => {
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

            uploadFileMutation.mutate(
                {
                    file: {
                        uri: params.localUri,
                        name: params.name,
                        type: params.mimeType,
                    },
                    onProgress: (progress) => {
                        updateAttachmentProgress(attachment.id, progress)
                    },
                },
                {
                    onSuccess: (data) => {
                        markAttachmentUploaded(attachment.id, data.url)
                    },
                    onError: () => {
                        markAttachmentError(attachment.id)
                    },
                }
            )

            return attachment.id
        },
        [
            addPendingAttachment,
            markAttachmentError,
            markAttachmentUploaded,
            updateAttachmentProgress,
            uploadFileMutation,
        ]
    )

    return {
        uploadAttachment,
        isUploading: uploadFileMutation.isPending,
    }
}
