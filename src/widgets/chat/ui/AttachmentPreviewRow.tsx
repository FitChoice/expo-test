/**
 * AttachmentPreviewRow - превью вложений перед отправкой
 * Точное соответствие макету 10:
 * - Квадратные превью изображений ~56x56
 * - X кнопка в правом верхнем углу (маленький серый круг)
 * - "Ошибка" красным текстом на тёмном overlay
 */

import React from 'react'
import { View, Text, Image, ScrollView, Pressable, ActivityIndicator } from 'react-native'
import type { Attachment } from '@/entities/chat'
import { Icon } from '@/shared/ui'

interface AttachmentPreviewRowProps {
	attachments: Attachment[]
	onRemove: (id: string) => void
}

export const AttachmentPreviewRow: React.FC<AttachmentPreviewRowProps> = ({
	attachments,
	onRemove,
}) => {
	if (attachments.length === 0) return null

	return (
		<View className="px-3 pb-2">
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={{ gap: 8 }}
			>
				{attachments.map((attachment) => (
					<AttachmentPreviewItem
						key={attachment.id}
						attachment={attachment}
						onRemove={() => onRemove(attachment.id)}
					/>
				))}
			</ScrollView>
		</View>
	)
}

interface AttachmentPreviewItemProps {
	attachment: Attachment
	onRemove: () => void
}

const AttachmentPreviewItem: React.FC<AttachmentPreviewItemProps> = ({
	attachment,
	onRemove,
}) => {
	const isImage = attachment.type === 'image'
	const isUploading = attachment.uploadStatus === 'uploading'
	const isError = attachment.uploadStatus === 'error'

	if (isImage) {
		// Image preview - квадрат 56x56 как в макете 10
		return (
			<View className="relative">
				<Image
					source={{ uri: attachment.localUri }}
					className="rounded-xl"
					style={{ width: 56, height: 56 }}
					resizeMode="cover"
				/>

				{/* Upload overlay */}
				{isUploading && (
					<View className="absolute inset-0 items-center justify-center rounded-xl bg-black/60">
						<ActivityIndicator size="small" color="#C5F680" />
					</View>
				)}

				{/* Error overlay - как в макете 10 "Ошибка" */}
				{isError && (
					<View className="absolute inset-0 items-center justify-center rounded-xl bg-black/70">
						<Text
							className="text-feedback-negative-900"
							style={{ fontFamily: 'Inter', fontWeight: '400', fontSize: 10 }}
						>
							Ошибка
						</Text>
					</View>
				)}

				{/* Remove button - маленький X в углу (как в макете) */}
				<Pressable
					onPress={onRemove}
					className="bg-fill-600 absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full"
					hitSlop={8}
				>
					<Icon name="close" size={10} color="#FFFFFF" />
				</Pressable>
			</View>
		)
	}

	// File preview - компактная карточка как в макете 12
	return (
		<View
			className="flex-row items-center rounded-xl bg-fill-800"
			style={{ minWidth: 180, maxWidth: 220, paddingHorizontal: 12, paddingVertical: 10 }}
		>
			{/* File icon */}
			<View
				className="mr-2 h-8 w-8 items-center justify-center rounded-lg"
				style={{ backgroundColor: isError ? '#FF453A' : '#8E8E93' }}
			>
				<Icon name="file" size={16} color="#FFFFFF" />
			</View>

			{/* File info */}
			<View className="mr-2 flex-1">
				<Text
					className="text-light-text-100"
					numberOfLines={1}
					style={{ fontFamily: 'Inter', fontWeight: '400', fontSize: 13 }}
				>
					{attachment.name}
				</Text>

				{/* Status - как в макете 12 "Загружается" с progress */}
				{isUploading && (
					<View className="mt-1 flex-row items-center">
						<Text
							className="mr-2 text-light-text-200"
							style={{ fontFamily: 'Inter', fontWeight: '400', fontSize: 11 }}
						>
							Загружается
						</Text>
						<View className="h-0.5 flex-1 overflow-hidden rounded-full bg-fill-500">
							<View
								className="h-full rounded-full bg-brand-green-500"
								style={{ width: `${attachment.uploadProgress}%` }}
							/>
						</View>
					</View>
				)}

				{attachment.uploadStatus === 'completed' && (
					<Text
						className="mt-0.5 text-brand-green-500"
						style={{ fontFamily: 'Inter', fontWeight: '400', fontSize: 11 }}
					>
						Загружено
					</Text>
				)}

				{isError && (
					<Text
						className="mt-0.5 text-feedback-negative-900"
						style={{ fontFamily: 'Inter', fontWeight: '400', fontSize: 11 }}
					>
						Ошибка
					</Text>
				)}
			</View>

			{/* Remove button */}
			<Pressable onPress={onRemove} hitSlop={8}>
				<Icon name="close" size={14} color="#8F8F92" />
			</Pressable>
		</View>
	)
}
