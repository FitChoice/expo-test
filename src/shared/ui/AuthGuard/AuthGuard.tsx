import { type ReactNode } from 'react'

interface AuthGuardProps {
	children: ReactNode
}

/**
 * Компонент для проверки авторизации
 * Пока просто возвращает children без проверки
 */
export const AuthGuard = ({ children }: AuthGuardProps) => {
	// Временно отключаем проверку авторизации
	// В реальном приложении здесь будет логика проверки токена

	return <>{children}</>
}
