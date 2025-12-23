import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { listProgressPhotos } from '@/entities/progress/lib/storage'
import { progressKeys } from '@/entities/progress/api/queryKeys'
import type { ProgressPhoto, ProgressSeries } from '@/entities/progress/model/types'
import { getUserId } from '@/shared/lib/auth'
import { groupPhotosByDate } from '@/entities/progress/lib/series'

type UseProgressListQueryOptions<TData> = {
	select?: (data: ProgressPhoto[]) => TData
}

export const useProgressListQuery = <TData = ProgressPhoto[]>(options?: UseProgressListQueryOptions<TData>) => {
	const [userId, setUserId] = useState<string | null>(null)

	useEffect(() => {
		const read = async () => {
			const id = await getUserId()
			if (id) setUserId(id)
		}
		read()
	}, [])

	return useQuery<ProgressPhoto[]>({
		queryKey: userId ? progressKeys.list(userId) : progressKeys.all,
		enabled: Boolean(userId),
		queryFn: async () => {
			if (!userId) throw new Error('Не удалось определить пользователя')
			return listProgressPhotos(userId)
		},
		select: options?.select,
	})
}

export const useProgressSeriesQuery = () =>
	useProgressListQuery<ProgressSeries[]>({
		select: groupPhotosByDate,
	})

