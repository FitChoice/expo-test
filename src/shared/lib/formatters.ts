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
 * Форматирует ISO-дату (UTC) в строку "HH:MM"
 * @param time - дата/время в формате ISO 8601 (UTC)
 * @returns строка в формате "HH:MM" или пустая строка при неверном вводе
 */
export const formatTime = (time: string): string => {
	if (!time) return ''

	const date = new Date(time)
	if (Number.isNaN(date.getTime())) return ''

	const hours = date.getUTCHours().toString().padStart(2, '0')
	const minutes = date.getUTCMinutes().toString().padStart(2, '0')

	return `${hours}:${minutes}`
}

/**
 * Форматирует ISO-дату в формат "DD.MM.YYYY"
 * @param dateString - дата в формате ISO 8601
 * @returns строка в формате "DD.MM.YYYY"
 */
export const formatDateDots = (dateString: string): string => {
	if (!dateString) return ''
	const date = new Date(dateString)
	if (Number.isNaN(date.getTime())) return ''

	const day = String(date.getDate()).padStart(2, '0')
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const year = date.getFullYear()

	return `${day}.${month}.${year}`
}
