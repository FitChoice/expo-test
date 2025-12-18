/**
 * FileAttachment - отображение файла в сообщении
 * Точное соответствие макету: компактная карточка с иконкой
 */

import React from 'react'
import { View, Text, Pressable } from 'react-native'
import type { Attachment } from '@/entities/chat'
import { Icon } from '@/shared/ui'

interface FileAttachmentProps {
	attachment: Attachment
	isUserMessage: boolean
}

export const FileAttachment: React.FC<FileAttachmentProps> = ({
	attachment,
	isUserMessage,
}) => {
	return (
		<Pressable
			className={`mb-2 flex-row items-center rounded-2xl p-3 ${
				isUserMessage ? 'self-end bg-fill-700' : 'self-start bg-fill-800'
			}`}
			style={{ minWidth: 180, maxWidth: '85%' }}
		>
			{/* File icon - серый квадрат с иконкой */}
			<View className="mr-3 h-10 w-10 items-center justify-center rounded-lg bg-fill-500">
				<Icon name="file" size={20} color="#FFFFFF" />
			</View>

			{/* File name */}
			<Text
				className="flex-1 font-rimma text-t3-regular text-light-text-100"
				numberOfLines={1}
			>
				{attachment.name}
			</Text>
		</Pressable>
	)
}
