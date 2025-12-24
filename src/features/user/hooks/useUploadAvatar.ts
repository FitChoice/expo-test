import { useMutation, useQueryClient } from '@tanstack/react-query'
import { userApi } from '../api'
import { showToast } from '@/shared/lib'
import type { AvatarPickResult } from '@/shared/lib/media/pickAvatarImage'
import type { UserProfile } from '../api/types'

type UploadAvatarParams = {
	userId: number
	asset: AvatarPickResult
}

const STORAGE_BASE_URL = 'https://storage.yandexcloud.net/fitdb'

const uploadFileToPresignUrl = async (url: string, asset: AvatarPickResult) => {
	const response = await fetch(asset.uri)
	const blob = await response.blob()

	const uploadResponse = await fetch(url, {
		method: 'PUT',
		headers: {
			'Content-Type': asset.mimeType || 'image/jpeg',
		},
		body: blob,
	})

	if (!uploadResponse.ok) {
		throw new Error(`Upload failed with status ${uploadResponse.status}`)
	}
}

/**
 * useUploadAvatar
 * Инкапсулирует presign → PUT → updateUser
 */
export const useUploadAvatar = () => {
	const queryClient = useQueryClient()

	return useMutation<UserProfile, Error, UploadAvatarParams>({
		mutationFn: async ({ userId, asset }) => {
			const fileName = asset.fileName.trim() || 'avatar.jpg'
			const storageFileName = `${userId}-${fileName}`
			const presign = await userApi.getImagePresignUrl(storageFileName)

		
			if (!presign.success) {
				throw new Error(presign.error || 'Не удалось получить ссылку загрузки')
			}

			const presignUrl = presign.data.url

			
			await uploadFileToPresignUrl(presignUrl, asset)

			const avatarUrl = `${STORAGE_BASE_URL}/${encodeURIComponent(storageFileName)}`
			const update = await userApi.updateUser(userId, { avatar_url: avatarUrl })
			if (!update.success) {
				throw new Error(update.error || 'Не удалось сохранить аватар')
			}

			return {
				...update.data,
				avatar_url: update.data.avatar_url || avatarUrl,
			}
		},
		onSuccess: (updatedUserProfile, variables) => {
			queryClient.setQueryData<UserProfile | undefined>(['profile', variables.userId], (prev) =>
				prev
					? {
							...prev,
							avatar_url: updatedUserProfile.avatar_url,
						}
					: updatedUserProfile
			)
			queryClient.invalidateQueries({ queryKey: ['profile', variables.userId] })
			showToast.success('Аватар обновлен')
		},
		onError: (error) => {
			showToast.error(error.message || 'Ошибка загрузки аватара')
		},
	})
}
