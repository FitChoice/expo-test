/**
 * Hook для выбора файлов (изображения, видео, документы)
 * Чистый хук - только выбор файлов, без бизнес-логики загрузки
 * Использует expo-image-picker и expo-document-picker
 */

import { useCallback } from 'react'
import * as ImagePicker from 'expo-image-picker'
import * as DocumentPicker from 'expo-document-picker'

export interface PickedFile {
	uri: string
	fileName: string
	mimeType: string
	fileSize: number
	width?: number
	height?: number
	durationMs?: number
}

interface UseFilePickerReturn {
	pickImages: () => Promise<PickedFile[]>
	pickVideo: () => Promise<PickedFile | null>
	pickDocuments: () => Promise<PickedFile[]>
}

/**
 * Извлекает имя файла из URI
 */
const getFileName = (uri: string, fallback: string): string => {
    const parts = uri.split('/')
    return parts[parts.length - 1] || fallback
}

export const useFilePicker = (): UseFilePickerReturn => {
    const pickImages = useCallback(async (): Promise<PickedFile[]> => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
            if (status !== 'granted') {
                console.warn('Нет разрешения на доступ к галерее')
                return []
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsMultipleSelection: true,
                quality: 0.8,
                selectionLimit: 5,
            })

            if (result.canceled) return []

            return result.assets.map((asset) => ({
                uri: asset.uri,
                fileName: asset.fileName || getFileName(asset.uri, `image_${Date.now()}.jpg`),
                mimeType: asset.mimeType || 'image/jpeg',
                fileSize: asset.fileSize || 0,
                width: asset.width,
                height: asset.height,
            }))
        } catch (error) {
            console.error('Failed to pick images:', error)
            return []
        }
    }, [])

    const pickVideo = useCallback(async (): Promise<PickedFile | null> => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
            if (status !== 'granted') {
                console.warn('Нет разрешения на доступ к галерее')
                return null
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['videos'],
                allowsMultipleSelection: false,
                quality: 0.8,
                videoMaxDuration: 60, // 1 minute max
            })

            if (result.canceled || !result.assets[0]) return null

            const asset = result.assets[0]
            return {
                uri: asset.uri,
                fileName: asset.fileName || getFileName(asset.uri, `video_${Date.now()}.mp4`),
                mimeType: asset.mimeType || 'video/mp4',
                fileSize: asset.fileSize || 0,
                width: asset.width,
                height: asset.height,
                durationMs: asset.duration ? asset.duration * 1000 : undefined,
            }
        } catch (error) {
            console.error('Failed to pick video:', error)
            return null
        }
    }, [])

    const pickDocuments = useCallback(async (): Promise<PickedFile[]> => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                multiple: true,
                copyToCacheDirectory: true,
            })

            if (result.canceled) return []

            return result.assets.map((asset) => ({
                uri: asset.uri,
                fileName: asset.name,
                mimeType: asset.mimeType || 'application/octet-stream',
                fileSize: asset.size || 0,
            }))
        } catch (error) {
            console.error('Failed to pick documents:', error)
            return []
        }
    }, [])

    return {
        pickImages,
        pickVideo,
        pickDocuments,
    }
}
