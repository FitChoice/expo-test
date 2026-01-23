/**
 * Shared utility functions
 */

/**
 * Generates a unique ID using timestamp and random number
 * @param prefix - Optional prefix for the ID (default: none)
 * @returns A unique string ID
 */
export const generateId = (prefix?: string): string => {
	const id = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
	return prefix ? `${prefix}_${id}` : id
}

/**
 * Creates a delay promise
 * @param ms - Milliseconds to delay
 * @returns Promise that resolves after the delay
 */
export const delayTimeout = (ms: number): Promise<void> => {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Clamps a number between min and max values
 * @param value - The value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 */
export const clamp = (value: number, min: number, max: number): number => {
	return Math.min(Math.max(value, min), max)
}

/**
 * Formats a number to fixed decimal places
 * @param value - The number to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted number string
 */
export const formatNumber = (value: number, decimals: number = 2): string => {
	return value.toFixed(decimals)
}
