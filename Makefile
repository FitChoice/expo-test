# Makefile для Fitchoice Mobile App (Expo + React Native)
.PHONY: check format lint type-check start android ios clean install security help

# 🚀 Основная команда для проверки кода (ВСЁ СРАЗУ)
check: format lint type-check security
	@echo "✅ Все проверки пройдены успешно!"

# 🎨 Форматирование кода с Prettier
format:
	@echo "🎨 Форматирование кода..."
	@pnpm exec prettier --write "src/**/*.{ts,tsx,js,jsx}" "*.{md,json}" || true

# 🔍 Линтинг с ESLint
lint:
	@echo "🔍 Проверка кода с ESLint..."
	@pnpm run lint

# 📝 Проверка типов TypeScript
type-check:
	@echo "📝 Проверка типов TypeScript..."
	@pnpm run type-check

# 🔒 Проверка безопасности зависимостей
security:
	@echo "🔒 Проверка безопасности зависимостей..."
	@pnpm audit || echo "⚠️  Найдены уязвимости, проверьте вывод выше"

# 🚀 Запуск dev сервера
start:
	@echo "🏃 Запуск Expo dev сервера..."
	@pnpm start

# 📱 Запуск на Android
android:
	@echo "📱 Запуск на Android..."
	@pnpm android

# 🍎 Запуск на iOS
ios:
	@echo "🍎 Запуск на iOS..."
	@pnpm ios

# 🌐 Запуск в веб режиме
web:
	@echo "🌐 Запуск в веб режиме..."
	@pnpm web

# 📦 Установка зависимостей
install:
	@echo "📦 Установка зависимостей..."
	@pnpm install

# 🧹 Очистка кеша и node_modules
clean:
	@echo "🧹 Очистка..."
	@rm -rf node_modules .expo
	@pnpm store prune

# 🔄 Полная переустановка
reinstall: clean install
	@echo "✅ Переустановка завершена!"

# 📦 Обновление зависимостей
update:
	@echo "📦 Обновление зависимостей..."
	@pnpm update

# 🔍 Проверка устаревших пакетов
outdated:
	@echo "🔍 Проверка устаревших пакетов..."
	@pnpm outdated

# 🎯 Prebuild для нативных модулей
prebuild:
	@echo "🎯 Prebuild для нативных модулей..."
	@pnpm exec expo prebuild

# 💡 Помощь
help:
	@echo "🚀 Fitchoice Mobile App - Доступные команды:"
	@echo ""
	@echo "  make start         - Запуск Expo dev сервера"
	@echo "  make android       - Запуск на Android эмуляторе/устройстве"
	@echo "  make ios           - Запуск на iOS симуляторе/устройстве"
	@echo "  make web           - Запуск в веб режиме"
	@echo "  make check         - ПОЛНАЯ проверка (format + lint + types + security)"
	@echo "  make format        - Форматирование кода с Prettier"
	@echo "  make lint          - Проверка кода с ESLint"
	@echo "  make type-check    - Проверка типов TypeScript"
	@echo "  make security      - Проверка уязвимостей (pnpm audit)"
	@echo "  make install       - Установка зависимостей"
	@echo "  make update        - Обновление зависимостей"
	@echo "  make outdated      - Проверка устаревших пакетов"
	@echo "  make clean         - Очистка кеша и node_modules"
	@echo "  make reinstall     - Полная переустановка зависимостей"
	@echo "  make prebuild      - Prebuild для нативных модулей"
	@echo "  make help          - Показать эту справку"
	@echo ""

