import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as MediaLibrary from 'expo-media-library'

import { progressKeys } from '@/entities/progress/api/queryKeys'
import { deleteProgressPhoto, saveProgressBatch } from '@/entities/progress/lib/storage'
import type { TempCapturedPhoto } from '@/entities/progress/model/types'
import { getUserId } from '@/shared/lib/auth'

type SaveBatchInput = {
	items: TempCapturedPhoto[]
	saveToGallery?: boolean
}

export const useSaveProgressBatchMutation = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ items, saveToGallery }: SaveBatchInput) => {
			const userId = await getUserId()
			if (!userId) throw new Error('Не удалось определить пользователя')

			const maybeSaveToGallery =
				saveToGallery && MediaLibrary?.createAssetAsync
					? (uri: string) => MediaLibrary.createAssetAsync(uri)
					: undefined

			return saveProgressBatch({
				userId,
				items,
				saveToGallery: maybeSaveToGallery,
			})
		},
		onSuccess: async (_data, _variables, _ctx) => {
			const userId = await getUserId()
			if (userId) {
				await queryClient.invalidateQueries({ queryKey: progressKeys.list(userId) })
			}
		},
	})
}

export const useDeleteProgressPhotoMutation = () => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (photoId: string) => {
			const userId = await getUserId()
			if (!userId) throw new Error('Не удалось определить пользователя')
			await deleteProgressPhoto(userId, photoId)
		},
		onSuccess: async () => {
			const userId = await getUserId()
			if (userId) {
				await queryClient.invalidateQueries({ queryKey: progressKeys.list(userId) })
			}
		},
	})
}

