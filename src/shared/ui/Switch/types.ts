export interface SwitchProps {
	/** Состояние переключателя */
	checked: boolean
	/** Обработчик изменения состояния */
	onChange: (checked: boolean) => void
	/** Отключен ли переключатель */
	disabled?: boolean
	/** Дополнительные классы */
	className?: string
}
