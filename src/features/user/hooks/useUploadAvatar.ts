import { useMutation, useQueryClient } from '@tanstack/react-query'
import { userApi } from '../api'
import { showToast } from '@/shared/lib'
import type { AvatarPickResult } from '@/shared/lib/media/pickAvatarImage'
import type { UserProfile } from '../api/types'

type UploadAvatarParams = {
	userId: number
	asset: AvatarPickResult
}

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
			const presign = await userApi.getAvatarPresignUrl(String(userId), asset.fileName)

			if (!presign.success) {
				throw new Error(presign.error || 'Не удалось получить ссылку загрузки')
			}

			const presignUrl = presign.data.url
			await uploadFileToPresignUrl(presignUrl, asset)

			const [baseUrl] = presignUrl.split('?')
			const avatarUrl = baseUrl || presignUrl

			const update = await userApi.updateUser(userId, { avatar_url: avatarUrl })
			if (!update.success) {
				throw new Error(update.error || 'Не удалось сохранить аватар')
			}

			// добавляем cache-bust, чтобы изображение обновилось сразу
			const avatarUrlWithBust = `${avatarUrl}${avatarUrl.includes('?') ? '&' : '?'}t=${Date.now()}`

			return {
				...update.data,
				avatar_url: update.data.avatar_url || avatarUrlWithBust,
			}
		},
		onSuccess: (updatedUserProfile, variables) => {
			queryClient.setQueryData<UserProfile | undefined>(
				{ queryKey: ['profile', variables.userId] },
				(prev) =>
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
