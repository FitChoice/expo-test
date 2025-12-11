/**
 * Общие функции форматирования
 * Переиспользуются во всём приложении
 */

/**
 * Форматирует длительность в мс в формат "M:SS"
 * @param ms - длительность в миллисекундах
 * @returns строка в формате "0:00"
 */
export const formatDuration = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

/**
 * Форматирует размер файла в человекочитаемый формат
 * @param bytes - размер в байтах
 * @returns строка вида "1.5 MB"
 */
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    const size = sizes[i]
    if (!size) return `${bytes} B`
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${size}`
}

/**
 * Форматирует время из строки "HH:MM:SS" в "HH:MM"
 * @param time - строка времени
 * @returns строка в формате "HH:MM"
 */
export const formatTime = (time: string): string => {
    if (!time) return ''
    // Берем первые 5 символов для формата HH:MM
    // Это работает для строк вида "08:30:00" или "08:30"
    if (time.includes(':')) {
        const parts = time.split(':')
        return `${parts[0]}:${parts[1]}`
    }
    return time
}
