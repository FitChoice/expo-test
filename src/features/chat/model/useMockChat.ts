/**
 * useMockChat - хуки для Mock режима чата
 * Эмулирует отправку сообщений и AI ответы без бэкенда
 */

import { useState, useCallback, useRef } from 'react'
import { useChatStore } from './useChatStore'
import type { Message, Attachment } from '@/entities/chat'
import { generateId } from '@/shared/lib'

// Mock AI responses
const MOCK_RESPONSES = {
    text: [
        'Отличный вопрос! Давайте разберёмся подробнее. 🤔',
        'Интересная мысль! Я думаю, что здесь важно учитывать несколько аспектов...',
        'Спасибо за сообщение! Вот что я могу сказать по этому поводу:',
        'Хороший вопрос! Позвольте мне поделиться своими мыслями.',
        'Это действительно важная тема. Давайте обсудим! 💪',
    ],
    audio: [
        'Я получил ваше голосовое сообщение! 🎤 К сожалению, я пока не могу прослушать аудио, но ценю, что вы поделились им.',
        'Голосовое сообщение получено! 🎧 Спасибо, что записали его для меня.',
        'Отлично, аудио доставлено! Голосовые сообщения - это здорово для общения.',
    ],
    image: [
        'Вижу интересное изображение! 🖼️ Выглядит отлично!',
        'Красивое фото! 📸 Спасибо, что поделились.',
        'Получил ваше изображение! Интересный кадр. 🌟',
    ],
    file: [
        'Файл получен! 📄 Спасибо за отправку документа.',
        'Документ доставлен! Я сохранил его для вас. 📁',
        'Отлично, файл загружен успешно! ✅',
    ],
}

const getRandomResponse = (type: keyof typeof MOCK_RESPONSES): string => {
    const responses = MOCK_RESPONSES[type]
    return responses[Math.floor(Math.random() * responses.length)]
}

/**
 * Hook для эмуляции стриминга AI ответа
 */
export const useMockStreamResponse = () => {
    const [streamingContent, setStreamingContent] = useState('')
    const [isStreaming, setIsStreaming] = useState(false)
    const streamTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const addMockMessage = useChatStore((state) => state.addMockMessage)

    const startStream = useCallback(
        async (content: string, attachments: Attachment[]) => {
            // Сначала добавляем сообщение пользователя
            const userMessage: Message = {
                id: generateId('msg'),
                role: 'user',
                content,
                createdAt: new Date(),
                attachments: attachments.map((a) => ({
                    ...a,
                    // В mock режиме используем localUri как remoteUrl
                    remoteUrl: a.localUri,
                    uploadStatus: 'completed' as const,
                    uploadProgress: 100,
                })),
                isStreaming: false,
            }
            addMockMessage(userMessage)

            // Определяем тип ответа на основе вложений
            let responseType: keyof typeof MOCK_RESPONSES = 'text'
            if (attachments.some((a) => a.type === 'audio')) {
                responseType = 'audio'
            } else if (attachments.some((a) => a.type === 'image')) {
                responseType = 'image'
            } else if (attachments.some((a) => a.type === 'file' || a.type === 'video')) {
                responseType = 'file'
            }

            // Начинаем "стриминг" ответа
            const fullResponse = getRandomResponse(responseType)
            setIsStreaming(true)
            setStreamingContent('')

            // Эмулируем посимвольный стриминг
            let currentIndex = 0
            const streamInterval = setInterval(() => {
                if (currentIndex < fullResponse.length) {
                    setStreamingContent((prev) => prev + fullResponse[currentIndex])
                    currentIndex++
                } else {
                    clearInterval(streamInterval)

                    // Добавляем полное сообщение ассистента
                    const assistantMessage: Message = {
                        id: generateId('msg'),
                        role: 'assistant',
                        content: fullResponse,
                        createdAt: new Date(),
                        attachments: [],
                        isStreaming: false,
                    }
                    addMockMessage(assistantMessage)

                    // Сбрасываем стриминг
                    streamTimeoutRef.current = setTimeout(() => {
                        setIsStreaming(false)
                        setStreamingContent('')
                    }, 100)
                }
            }, 30) // 30ms на символ - быстрый "стриминг"

            // Сохраняем reference для cleanup
            streamTimeoutRef.current = streamInterval as unknown as NodeJS.Timeout
        },
        [addMockMessage]
    )

    const stopStream = useCallback(() => {
        if (streamTimeoutRef.current) {
            clearInterval(streamTimeoutRef.current)
            streamTimeoutRef.current = null
        }
        setIsStreaming(false)
        setStreamingContent('')
    }, [])

    return {
        streamingContent,
        isStreaming,
        startStream,
        stopStream,
    }
}

/**
 * Hook для "загрузки" файла в mock режиме
 * Эмулирует прогресс загрузки
 */
export const useMockUploadFile = () => {
    const { updateAttachmentProgress, markAttachmentUploaded } = useChatStore()

    const uploadFile = useCallback(
        async (attachmentId: string, localUri: string) => {
            // Эмулируем прогресс загрузки
            let progress = 0
            const interval = setInterval(() => {
                progress += Math.random() * 20 + 10 // 10-30% за шаг
                if (progress >= 100) {
                    progress = 100
                    clearInterval(interval)
                    // В mock режиме используем localUri как "remoteUrl"
                    markAttachmentUploaded(attachmentId, localUri)
                } else {
                    updateAttachmentProgress(attachmentId, progress)
                }
            }, 200) // Обновление каждые 200ms
        },
        [markAttachmentUploaded, updateAttachmentProgress]
    )

    return { uploadFile }
}

