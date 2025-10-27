# Makefile для Fitchoice Mobile App (Expo + React Native)
# 🚀 Удобные команды для разработки и сборки

.PHONY: help start ios android web check format lint lint-fix types \
	install update outdated doctor fix \
	clean pods \
	prebuild prebuild-ios prebuild-android \
	build-android rebuild

.DEFAULT_GOAL := help

# ============================================================================
# 📱 РАЗРАБОТКА (основные команды)
# ============================================================================

## Запуск dev сервера
start:
	@echo "🚀 Запуск dev сервера..."
	@pnpm start

## Запуск на iOS
ios:
	@echo "🍎 Запуск на iOS..."
	@pnpm ios

## Запуск на Android
android:
	@echo "🤖 Запуск на Android..."
	@pnpm android

## Запуск в веб
web:
	@echo "🌐 Запуск web версии..."
	@pnpm web

# ============================================================================
# 🔨 СБОРКА И PREBUILD
# ============================================================================

## Prebuild (пересоздание нативных проектов)
prebuild:
	@echo "🔨 Prebuild нативных проектов..."
	@npx expo prebuild --clean
	@echo "💡 Не забудьте: make pods"

## Prebuild только для iOS
prebuild-ios:
	@echo "🍎 Prebuild iOS..."
	@npx expo prebuild --platform ios --clean
	@echo "💡 Затем: make pods"

## Prebuild только для Android
prebuild-android:
	@echo "🤖 Prebuild Android..."
	@npx expo prebuild --platform android --clean

# ============================================================================
# 🍎 iOS (CocoaPods)
# ============================================================================

## Только обновление pods (без pnpm)
pods:
	@echo "🍎 Установка iOS pods..."
	@cd ios && pod install --repo-update

# ============================================================================
# 🤖 ANDROID
# ============================================================================

## Production APK
build-android:
	@echo "🤖 Сборка production APK..."
	@cd android && ./gradlew assembleRelease
	@echo "✅ APK: android/app/build/outputs/apk/release/"

# ============================================================================
# 📦 ЗАВИСИМОСТИ
# ============================================================================

## Установка ВСЕХ зависимостей (pnpm + iOS pods)
install:
	@echo "📦 Установка зависимостей..."
	@echo "  → Устанавливаем npm пакеты..."
	@pnpm install
	@echo "  → Устанавливаем iOS pods..."
	@cd ios && pod install --repo-update
	@echo "✅ Всё установлено!"

## Обновление зависимостей
update:
	@echo "📦 Обновление зависимостей..."
	@pnpm update

## Проверка устаревших пакетов
outdated:
	@echo "🔍 Устаревшие пакеты..."
	@pnpm outdated

## Диагностика проекта
doctor:
	@echo "🩺 Диагностика..."
	@npx expo-doctor

## Автофикс зависимостей
fix:
	@echo "🔧 Автофикс зависимостей..."
	@npx expo install --fix

# ============================================================================
# 🧹 ОЧИСТКА
# ============================================================================

## ПОЛНАЯ очистка всех билдов и кешей
clean:
	@echo "🧹 ПОЛНАЯ очистка (JS + iOS + Android)..."
	@echo "  → Удаляем node_modules..."
	@rm -rf node_modules
	@echo "  → Удаляем .expo кэш..."
	@rm -rf .expo
	@echo "  → Удаляем iOS Pods..."
	@rm -rf ios/Pods ios/Podfile.lock ios/build
	@echo "  → Удаляем Xcode DerivedData..."
	@rm -rf ~/Library/Developer/Xcode/DerivedData
	@echo "  → Удаляем Android билды..."
	@cd android && ./gradlew clean 2>/dev/null || true
	@rm -rf android/.gradle android/app/build android/build
	@echo "  → Очищаем pnpm кэш..."
	@pnpm store prune
	@echo "✅ Всё очищено!"
	@echo ""
	@echo "💡 Для восстановления: make install"

# ============================================================================
# 🔄 ПОЛНАЯ ПЕРЕСБОРКА (после обновлений)
# ============================================================================

## Полная пересборка (рекомендуется после обновлений SDK/зависимостей)
rebuild: clean install prebuild
	@echo ""
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo "✅ Пересборка завершена!"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo ""
	@echo "Теперь запускайте:"
	@echo "  make ios      - для iOS"
	@echo "  make android  - для Android"
	@echo ""

# ============================================================================
# ✅ ПРОВЕРКА КОДА
# ============================================================================

## ПОЛНАЯ проверка кода
check:
	@echo "✅ Полная проверка..."
	@pnpm run check

## Форматирование
format:
	@echo "🎨 Форматирование..."
	@pnpm run format

## Линтинг
lint:
	@echo "🔍 Линтинг..."
	@pnpm run lint

## Автофикс линтинга
lint-fix:
	@echo "🔧 Автофикс линтинга..."
	@pnpm run lint:fix

## Проверка типов
types:
	@echo "📝 Проверка типов..."
	@pnpm run type-check

# ============================================================================
# 💡 ПОМОЩЬ
# ============================================================================

## Показать все команды
help:
	@echo ""
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo "🚀 Fitchoice - Makefile команды"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo ""
	@echo "📱 РАЗРАБОТКА:"
	@echo "  make start       - Запуск dev сервера"
	@echo "  make ios         - Запуск на iOS"
	@echo "  make android     - Запуск на Android"
	@echo "  make web         - Запуск web версии"
	@echo ""
	@echo "🔨 СБОРКА:"
	@echo "  make prebuild    - Пересоздать нативные проекты (iOS + Android)"
	@echo "  make prebuild-ios     - Пересоздать только iOS"
	@echo "  make prebuild-android - Пересоздать только Android"
	@echo "  make build-android    - Production APK для Android"
	@echo ""
	@echo "🍎 iOS:"
	@echo "  make pods        - Обновить только iOS pods (без pnpm)"
	@echo ""
	@echo "🤖 ANDROID:"
	@echo "  make build-android - Production APK для Android"
	@echo ""
	@echo "📦 ЗАВИСИМОСТИ:"
	@echo "  make install     - Установка ВСЕХ зависимостей (pnpm + iOS pods)"
	@echo "  make update      - Обновление зависимостей"
	@echo "  make outdated    - Проверка устаревших пакетов"
	@echo "  make doctor      - Диагностика проекта (expo-doctor)"
	@echo "  make fix         - Автофикс зависимостей"
	@echo ""
	@echo "🔄 ПЕРЕСБОРКА:"
	@echo "  make rebuild     - ПОЛНАЯ пересборка (после обновлений)"
	@echo ""
	@echo "🧹 ОЧИСТКА:"
	@echo "  make clean       - ПОЛНАЯ очистка (JS + iOS + Android + кэши)"
	@echo ""
	@echo "✅ ПРОВЕРКА:"
	@echo "  make check       - Полная проверка (format + lint + types)"
	@echo "  make format      - Форматирование кода"
	@echo "  make lint        - Линтинг"
	@echo "  make lint-fix    - Автофикс линтинга"
	@echo "  make types       - Проверка типов TypeScript"
	@echo ""
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo "💡 После обновления SDK или зависимостей:"
	@echo "   make rebuild"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo ""

