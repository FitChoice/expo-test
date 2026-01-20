// Короткие названия дней недели (пн-вс)
export const WEEK_DAYS_SHORT = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'] as const

// Численное значение ширины одной ячейки (100 / 7)
export const CALENDAR_CELL_WIDTH_NUMBER = 14.285714

// Строковое значение для стилей
export const CALENDAR_CELL_WIDTH = `${CALENDAR_CELL_WIDTH_NUMBER}%`

// Цвета активности
export const CALENDAR_COLORS = {
	active: '#aaec4d',
	inactive: '#3f3f3f',
} as const
