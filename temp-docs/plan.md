# План реализации User Profile Module (v2)

## Ревью и исправления

### Выявленные проблемы в v1:

| Проблема | Нарушение | Исправление |
|----------|-----------|-------------|
| Создание `profileApi` при наличии `userApi` | DRY | Расширить `userApi` |
| Zustand store для user data | Архитектура | TanStack Query для серверных данных |
| `DeleteAccountModal` / `LogoutModal` как отдельные widgets | Over-abstraction | Использовать `ConfirmModal` напрямую |
| `useProfileActions` hook с бизнес-логикой | FSD (features не должны содержать UI hooks с навигацией) | Логика inline в pages |
| `entities/profile` для серверных данных | FSD (entities = domain model, не кэш) | Типы в shared/types или features |

### Паттерны из кодовой базы:

1. **Данные с сервера** → `TanStack Query` (см. `HomeScreen.tsx` lines 53-61)
2. **Форма/сессия** → `Zustand` (см. `useSurveyFlow`, `useTrainingStore`)  
3. **UI state** → `useState` локально в компонентах
4. **API** → расширение существующих модулей (`userApi`, `trainingApi`)
5. **Widgets** → чистые UI компоненты без бизнес-логики

---

## 0. Подготовка: Удаление Legacy

**Файлы на удаление:**
```
src/pages/profile/ui/ProfileScreen.tsx  # Полностью заменяется
```

---

## 1. Расширение существующих модулей

### 1.1 Расширить `features/user/api/userApi.ts`

```typescript
// Добавить методы:

export interface UserProfile {
  id: number
  name: string
  email: string
  avatar: string | null
  level: number
  experience: number
  experienceToNextLevel: number
}

export interface NotificationSettings {
  basic: boolean
  progress: boolean  
  reports: boolean
  system: boolean
}

export const userApi = {
  // Существующие методы остаются:
  // updateUser, deleteUser, changePassword, updatePassword
  
  // Новые методы:
  async getProfile(userId: string): Promise<ApiResult<UserProfile>> {
    return apiClient.get(`/user/${userId}`)
  },

  async updateAvatar(userId: string, imageUri: string): Promise<ApiResult<{ avatar: string }>> {
    return apiClient.upload(`/user/${userId}/avatar`, imageUri, 'avatar')
  },

  async getNotifications(userId: string): Promise<ApiResult<NotificationSettings>> {
    return apiClient.get(`/user/${userId}/notifications`)
  },

  async updateNotifications(
    userId: string, 
    settings: NotificationSettings
  ): Promise<ApiResult<void>> {
    return apiClient.put(`/user/${userId}/notifications`, settings)
  },

  async logout(): Promise<ApiResult<void>> {
    return apiClient.post('/auth/logout', {})
  },
}
```

### 1.2 Добавить типы в `features/user/api/types.ts` (новый файл)

```typescript
export interface UserProfile {
  id: number
  name: string
  email: string
  avatar: string | null
  level: number
  experience: number
  experienceToNextLevel: number
}

export interface NotificationSettings {
  basic: boolean
  progress: boolean
  reports: boolean
  system: boolean
}

export interface UpdateProfileInput {
  name?: string
}
```

---

## 2. Shared UI Components

### 2.1 Структура новых компонентов

```
src/shared/ui/
├── ConfirmModal/
│   ├── index.ts
│   ├── types.ts
│   └── ConfirmModal.tsx
├── Toast/
│   ├── index.ts
│   ├── types.ts
│   ├── Toast.tsx
│   └── useToast.ts
├── SettingsItem/
│   ├── index.ts
│   ├── types.ts
│   └── SettingsItem.tsx
├── Avatar/
│   ├── index.ts
│   ├── types.ts
│   └── Avatar.tsx
└── ProgressBar/
    ├── index.ts
    ├── types.ts
    └── ProgressBar.tsx
```

### 2.2 ConfirmModal

**Файл:** `src/shared/ui/ConfirmModal/ConfirmModal.tsx`

```typescript
import { Modal, View, Text, Pressable } from 'react-native'
import { BlurView } from 'expo-blur'
import { Button } from '../Button'

interface ConfirmModalProps {
  visible: boolean
  title: string
  subtitle?: string
  confirmText: string
  cancelText: string
  confirmVariant?: 'primary' | 'danger'
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  title,
  subtitle,
  confirmText,
  cancelText,
  confirmVariant = 'primary',
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 justify-center items-center">
        <BlurView intensity={52} className="absolute inset-0" />
        <View className="bg-dark-500 rounded-2xl p-6 mx-4 w-full max-w-sm">
          <Text className="font-rimma text-2xl text-white text-center mb-2">
            {title}
          </Text>
          {subtitle && (
            <Text className="text-t2 text-light-text-500 text-center mb-6">
              {subtitle}
            </Text>
          )}
          <View className="flex-row gap-1">
            <Button 
              variant="secondary" 
              size="l" 
              fullWidth 
              onPress={onCancel}
              disabled={isLoading}
            >
              {cancelText}
            </Button>
            <Button 
              variant={confirmVariant === 'danger' ? 'tertiary' : 'primary'}
              size="l" 
              fullWidth 
              onPress={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? 'Загрузка...' : confirmText}
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  )
}
```

### 2.3 Toast

**Файл:** `src/shared/ui/Toast/Toast.tsx`

```typescript
import { useEffect } from 'react'
import { View, Text } from 'react-native'
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  runOnJS 
} from 'react-native-reanimated'
import { Icon } from '../Icon'

interface ToastProps {
  visible: boolean
  message: string
  variant?: 'success' | 'error'
  duration?: number
  onHide: () => void
}

export const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  variant = 'success',
  duration = 3000,
  onHide,
}) => {
  const translateY = useSharedValue(-100)
  
  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { duration: 300 })
      const timer = setTimeout(() => {
        translateY.value = withTiming(-100, { duration: 300 }, () => {
          runOnJS(onHide)()
        })
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [visible])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  if (!visible) return null

  return (
    <Animated.View 
      style={animatedStyle}
      className="absolute top-12 left-4 right-4 bg-fill-800 rounded-2xl p-4 flex-row items-center gap-3 shadow-lg z-50"
    >
      <Icon 
        name={variant === 'success' ? 'check' : 'warning'} 
        size={24} 
        color={variant === 'success' ? '#00CF1B' : '#FF2854'} 
      />
      <Text className="text-t2 text-white flex-1">{message}</Text>
    </Animated.View>
  )
}
```

### 2.4 SettingsItem

**Файл:** `src/shared/ui/SettingsItem/SettingsItem.tsx`

```typescript
import { View, Text, Pressable } from 'react-native'

interface SettingsItemProps {
  label: string
  description?: string
  rightElement?: React.ReactNode
  onPress?: () => void
  showDivider?: boolean
}

export const SettingsItem: React.FC<SettingsItemProps> = ({
  label,
  description,
  rightElement,
  onPress,
  showDivider = true,
}) => {
  const Container = onPress ? Pressable : View
  
  return (
    <>
      <Container 
        onPress={onPress}
        className="flex-row items-center justify-between py-3"
      >
        <View className="flex-1">
          <Text className="text-t2 text-white">{label}</Text>
          {description && (
            <Text className="text-t4 text-light-text-500 mt-1">{description}</Text>
          )}
        </View>
        {rightElement}
      </Container>
      {showDivider && <View className="h-px bg-fill-800" />}
    </>
  )
}
```

### 2.5 Avatar

**Файл:** `src/shared/ui/Avatar/Avatar.tsx`

```typescript
import { View, Image, Pressable } from 'react-native'
import { Icon } from '../Icon'

interface AvatarProps {
  source: string | null
  size?: number
  editable?: boolean
  onPress?: () => void
}

export const Avatar: React.FC<AvatarProps> = ({
  source,
  size = 100,
  editable = false,
  onPress,
}) => {
  const Container = onPress ? Pressable : View

  return (
    <Container 
      onPress={onPress}
      style={{ width: size, height: size }}
      className="rounded-full overflow-hidden bg-fill-700"
    >
      {source ? (
        <Image 
          source={{ uri: source }} 
          className="w-full h-full"
          resizeMode="cover"
        />
      ) : (
        <View className="w-full h-full items-center justify-center">
          <Icon name="user" size={size * 0.5} color="#949494" />
        </View>
      )}
      
      {editable && (
        <View className="absolute inset-0 bg-black/50 items-center justify-center">
          <Icon name="pencil-simple" size={24} color="#FFFFFF" />
        </View>
      )}
    </Container>
  )
}
```

### 2.6 ProgressBar

**Файл:** `src/shared/ui/ProgressBar/ProgressBar.tsx`

```typescript
import { View } from 'react-native'

interface ProgressBarProps {
  progress: number  // 0-1
  height?: number
  trackColor?: string
  fillColor?: string
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 8,
  trackColor = '#3F3F3F',
  fillColor = '#C5F680',
}) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 1)
  
  return (
    <View 
      style={{ height, backgroundColor: trackColor }}
      className="rounded-full overflow-hidden"
    >
      <View 
        style={{ 
          width: `${clampedProgress * 100}%`, 
          height: '100%',
          backgroundColor: fillColor,
        }}
        className="rounded-full"
      />
    </View>
  )
}
```

### 2.7 Обновить `shared/ui/index.ts`

```typescript
// Добавить экспорты:
export { ConfirmModal } from './ConfirmModal'
export { Toast, useToast } from './Toast'
export { SettingsItem } from './SettingsItem'
export { Avatar } from './Avatar'
export { ProgressBar } from './ProgressBar'
```

---

## 3. Widgets

### 3.1 Структура

```
src/widgets/profile/
├── index.ts
└── ui/
    ├── ProfileHeader.tsx
    ├── SettingsSection.tsx
    ├── FAQAccordion.tsx
    └── index.ts
```

**Важно:** Widgets — чистые UI компоненты без бизнес-логики. Никаких API вызовов, navigation, или мутаций.

### 3.2 ProfileHeader

```typescript
// src/widgets/profile/ui/ProfileHeader.tsx
import { View, Text, TouchableOpacity } from 'react-native'
import { Avatar, ProgressBar, Icon, Input } from '@/shared/ui'

interface ProfileHeaderProps {
  name: string
  email: string
  avatar: string | null
  level: number
  experience: number
  experienceToNextLevel: number
  isEditMode: boolean
  editedName: string
  onNameChange: (name: string) => void
  onAvatarPress: () => void
  onSettingsPress: () => void
  onSave: () => void
  onCancel: () => void
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  email,
  avatar,
  level,
  experience,
  experienceToNextLevel,
  isEditMode,
  editedName,
  onNameChange,
  onAvatarPress,
  onSettingsPress,
  onSave,
  onCancel,
}) => {
  const progress = experienceToNextLevel > 0 
    ? experience / experienceToNextLevel 
    : 0

  return (
    <View className="items-center pt-4">
      {/* Settings button */}
      <TouchableOpacity 
        onPress={onSettingsPress}
        className="absolute right-0 top-4 w-12 h-12 rounded-2xl bg-fill-700 items-center justify-center"
      >
        <Icon name="gear-fine" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Avatar */}
      <Avatar 
        source={avatar} 
        size={100} 
        editable={isEditMode}
        onPress={onAvatarPress}
      />

      {/* Name */}
      {isEditMode ? (
        <View className="w-full mt-4">
          <Input
            value={editedName}
            onChangeText={onNameChange}
            placeholder="Введите имя"
          />
          <View className="flex-row gap-2 mt-4">
            <Button variant="ghost" size="s" onPress={onCancel}>
              Отменить
            </Button>
            <Button variant="primary" size="s" onPress={onSave}>
              Сохранить
            </Button>
          </View>
        </View>
      ) : (
        <Text className="text-t1.1 text-white mt-4">{name}</Text>
      )}

      {/* Email */}
      <Text className="text-t3-regular text-light-text-500 mt-1">{email}</Text>

      {/* Level & Experience */}
      <View className="flex-row items-center gap-2 mt-4">
        <Text className="text-t2-bold text-white">{level} уровень</Text>
        <View className="bg-white/20 rounded-full px-3 py-1 backdrop-blur">
          <Text className="text-t4 text-white">{experience} опыта</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View className="w-full mt-4">
        <ProgressBar progress={progress} />
      </View>
    </View>
  )
}
```

### 3.3 SettingsSection

```typescript
// src/widgets/profile/ui/SettingsSection.tsx
import { View, Text } from 'react-native'

interface SettingsSectionProps {
  title: string
  children: React.ReactNode
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  children,
}) => {
  return (
    <View className="bg-dark-500 rounded-2xl p-6 mb-4">
      <Text className="text-t1.1 text-white mb-4">{title}</Text>
      {children}
    </View>
  )
}
```

### 3.4 FAQAccordion

```typescript
// src/widgets/profile/ui/FAQAccordion.tsx
import { useState } from 'react'
import { View, Text, TouchableOpacity, LayoutAnimation } from 'react-native'
import { Icon } from '@/shared/ui'

interface FAQItem {
  id: string
  question: string
  answer: string
}

interface FAQAccordionProps {
  items: FAQItem[]
}

export const FAQAccordion: React.FC<FAQAccordionProps> = ({ items }) => {
  const [expandedIds, setExpandedIds] = useState<string[]>([])

  const toggleItem = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setExpandedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }

  return (
    <View>
      {items.map((item, index) => {
        const isExpanded = expandedIds.includes(item.id)
        const isLast = index === items.length - 1
        
        return (
          <View key={item.id}>
            <TouchableOpacity 
              onPress={() => toggleItem(item.id)}
              className="flex-row items-center justify-between py-3"
            >
              <Text className="text-t2 text-white flex-1 pr-4">
                {item.question}
              </Text>
              <Icon 
                name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                size={20} 
                color="#FFFFFF" 
              />
            </TouchableOpacity>
            
            {isExpanded && (
              <Text className="text-t2 text-light-text-200 pb-3">
                {item.answer}
              </Text>
            )}
            
            {!isLast && <View className="h-px bg-fill-800" />}
          </View>
        )
      })}
    </View>
  )
}
```

### 3.5 Экспорты widgets

```typescript
// src/widgets/profile/ui/index.ts
export { ProfileHeader } from './ProfileHeader'
export { SettingsSection } from './SettingsSection'
export { FAQAccordion } from './FAQAccordion'

// src/widgets/profile/index.ts
export * from './ui'
```

---

## 4. Константы

**Файл:** `src/shared/constants/profile.ts` (новый)

```typescript
export const FAQ_ITEMS = [
  {
    id: '1',
    question: 'Как начать тренировку?',
    answer: 'Выберите программу тренировок на главном экране и нажмите "Начать".',
  },
  {
    id: '2', 
    question: 'Как изменить программу тренировок?',
    answer: 'Перейдите в профиль и нажмите "Изменить программу тренировок".',
  },
  {
    id: '3',
    question: 'Как работает система уровней?',
    answer: 'За каждую тренировку вы получаете опыт. Накопив достаточно опыта, вы переходите на новый уровень.',
  },
  {
    id: '4',
    question: 'Можно ли отменить подписку?',
    answer: 'Да, вы можете отменить подписку в любое время в настройках.',
  },
  {
    id: '5',
    question: 'Как связаться с поддержкой?',
    answer: 'Напишите на support@fitchoice.app или позвоните по номеру +7 (999) 123-45-67.',
  },
]

export const APP_VERSION = '1.0.0'
export const SUPPORT_EMAIL = 'support@fitchoice.app'
export const SUPPORT_PHONE = '+7 (999) 123-45-67'
```

---

## 5. Pages

### 5.1 Структура

```
src/pages/profile/
├── index.ts
└── ui/
    ├── ProfileScreen.tsx
    ├── SettingsScreen.tsx
    ├── ChangePasswordScreen.tsx
    ├── PrivacyPolicyScreen.tsx
    ├── TermsOfServiceScreen.tsx
    └── index.ts
```

### 5.2 ProfileScreen (главный)

Паттерн из `HomeScreen.tsx`: useState + useQuery + inline логика.

```typescript
// src/pages/profile/ui/ProfileScreen.tsx
import { useState, useEffect } from 'react'
import { View, ScrollView, TouchableOpacity, Text } from 'react-native'
import { useRouter } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as ImagePicker from 'expo-image-picker'
import { 
  BackgroundLayout, 
  AuthGuard, 
  ConfirmModal, 
  Toast,
  Icon 
} from '@/shared/ui'
import { NavigationBar } from '@/widgets/navigation-bar'
import { ProfileHeader } from '@/widgets/profile'
import { userApi } from '@/features/user/api'
import { getUserId, clearAuthData } from '@/shared/lib/auth'

export const ProfileScreen = () => {
  return (
    <AuthGuard>
      <BackgroundLayout>
        <ProfileContent />
      </BackgroundLayout>
    </AuthGuard>
  )
}

const ProfileContent = () => {
  const router = useRouter()
  const queryClient = useQueryClient()
  
  // Local UI state
  const [userId, setUserId] = useState<number | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editedName, setEditedName] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [toast, setToast] = useState<{ visible: boolean; message: string; variant: 'success' | 'error' }>({
    visible: false,
    message: '',
    variant: 'success',
  })

  // Get userId on mount
  useEffect(() => {
    const fetchUserId = async () => {
      const id = await getUserId()
      setUserId(id)
    }
    fetchUserId()
  }, [])

  // Fetch profile data
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID required')
      const result = await userApi.getProfile(userId.toString())
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    enabled: !!userId,
  })

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (name: string) => {
      if (!userId) throw new Error('User ID required')
      return userApi.updateUser(userId.toString(), { name })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] })
      setIsEditMode(false)
      setToast({ visible: true, message: 'Профиль обновлен', variant: 'success' })
    },
    onError: () => {
      setToast({ visible: true, message: 'Ошибка обновления', variant: 'error' })
    },
  })

  // Delete account mutation  
  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('User ID required')
      return userApi.deleteUser(userId.toString())
    },
    onSuccess: async () => {
      await clearAuthData()
      router.replace('/auth')
    },
    onError: () => {
      setToast({ visible: true, message: 'Ошибка удаления аккаунта', variant: 'error' })
    },
  })

  // Handlers
  const handleEditStart = () => {
    setEditedName(profile?.name || '')
    setIsEditMode(true)
  }

  const handleSave = () => {
    updateProfileMutation.mutate(editedName)
  }

  const handleCancel = () => {
    setIsEditMode(false)
    setEditedName('')
  }

  const handleAvatarPress = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })
    
    if (!result.canceled && userId) {
      await userApi.updateAvatar(userId.toString(), result.assets[0].uri)
      queryClient.invalidateQueries({ queryKey: ['profile', userId] })
    }
  }

  const handleLogout = async () => {
    await userApi.logout()
    await clearAuthData()
    router.replace('/auth')
  }

  const handleDeleteConfirm = () => {
    setShowDeleteModal(false)
    deleteAccountMutation.mutate()
  }

  if (isLoading || !profile) {
    return <View className="flex-1" /> // или Loader
  }

  return (
    <View className="flex-1">
      <Toast 
        visible={toast.visible}
        message={toast.message}
        variant={toast.variant}
        onHide={() => setToast(prev => ({ ...prev, visible: false }))}
      />
      
      <ScrollView 
        className="flex-1 px-5"
        contentContainerStyle={{ paddingTop: 60, paddingBottom: 120 }}
      >
        <ProfileHeader
          name={profile.name}
          email={profile.email}
          avatar={profile.avatar}
          level={profile.level}
          experience={profile.experience}
          experienceToNextLevel={profile.experienceToNextLevel}
          isEditMode={isEditMode}
          editedName={editedName}
          onNameChange={setEditedName}
          onAvatarPress={handleAvatarPress}
          onSettingsPress={() => router.push('/settings')}
          onSave={handleSave}
          onCancel={handleCancel}
        />

        {/* CTA Banner */}
        <TouchableOpacity 
          onPress={() => router.push('/survey')}
          className="bg-dark-500 rounded-[32px] p-6 mt-8 flex-row items-center justify-between"
        >
          <Text className="text-t2-bold text-white flex-1">
            Изменить программу тренировок
          </Text>
          <Icon name="chevron-right" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </ScrollView>

      <NavigationBar />

      {/* Modals */}
      <ConfirmModal
        visible={showDeleteModal}
        title="вы точно хотите удалить аккаунт?"
        subtitle="Это действие нельзя отменить"
        confirmText="Удалить"
        cancelText="Нет"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteModal(false)}
        isLoading={deleteAccountMutation.isPending}
      />

      <ConfirmModal
        visible={showLogoutModal}
        title="выйти из аккаунта?"
        confirmText="Выйти"
        cancelText="Нет"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </View>
  )
}
```

### 5.3 SettingsScreen

```typescript
// src/pages/profile/ui/SettingsScreen.tsx
import { useState, useEffect } from 'react'
import { View, ScrollView, Text, Linking } from 'react-native'
import { useRouter } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  BackgroundLayout, 
  BackButton, 
  Switch, 
  SettingsItem,
  Icon,
  ConfirmModal,
} from '@/shared/ui'
import { SettingsSection, FAQAccordion } from '@/widgets/profile'
import { userApi } from '@/features/user/api'
import { getUserId, clearAuthData } from '@/shared/lib/auth'
import { FAQ_ITEMS, APP_VERSION, SUPPORT_EMAIL, SUPPORT_PHONE } from '@/shared/constants/profile'

export const SettingsScreen = () => {
  const router = useRouter()
  const queryClient = useQueryClient()
  
  const [userId, setUserId] = useState<number | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  useEffect(() => {
    getUserId().then(setUserId)
  }, [])

  // Notifications query
  const { data: notifications } = useQuery({
    queryKey: ['notifications', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID required')
      const result = await userApi.getNotifications(userId.toString())
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    enabled: !!userId,
  })

  // Update notifications mutation
  const updateNotificationsMutation = useMutation({
    mutationFn: async (settings: typeof notifications) => {
      if (!userId || !settings) throw new Error('Required')
      return userApi.updateNotifications(userId.toString(), settings)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] })
    },
  })

  // Delete mutation
  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('User ID required')
      return userApi.deleteUser(userId.toString())
    },
    onSuccess: async () => {
      await clearAuthData()
      router.replace('/auth')
    },
  })

  const handleNotificationToggle = (key: keyof NonNullable<typeof notifications>) => {
    if (!notifications) return
    updateNotificationsMutation.mutate({
      ...notifications,
      [key]: !notifications[key],
    })
  }

  const handleLogout = async () => {
    setShowLogoutModal(false)
    await userApi.logout()
    await clearAuthData()
    router.replace('/auth')
  }

  return (
    <BackgroundLayout>
      <View className="flex-1">
        <View className="px-5 pt-4">
          <BackButton onPress={() => router.back()} />
        </View>

        <ScrollView 
          className="flex-1 px-5"
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Notifications */}
          <SettingsSection title="Уведомления">
            <SettingsItem
              label="Основные"
              rightElement={
                <Switch 
                  checked={notifications?.basic ?? true}
                  onChange={() => handleNotificationToggle('basic')}
                />
              }
            />
            <SettingsItem
              label="Прогресс и мотивация"
              rightElement={
                <Switch 
                  checked={notifications?.progress ?? true}
                  onChange={() => handleNotificationToggle('progress')}
                />
              }
            />
            <SettingsItem
              label="Отчетность"
              rightElement={
                <Switch 
                  checked={notifications?.reports ?? true}
                  onChange={() => handleNotificationToggle('reports')}
                />
              }
            />
            <SettingsItem
              label="Системные"
              showDivider={false}
              rightElement={
                <Switch 
                  checked={notifications?.system ?? true}
                  onChange={() => handleNotificationToggle('system')}
                />
              }
            />
          </SettingsSection>

          {/* Account */}
          <SettingsSection title="Аккаунт">
            <SettingsItem
              label="Сменить пароль"
              onPress={() => router.push('/change-password')}
              rightElement={<Icon name="chevron-right" size={20} color="#949494" />}
            />
            <SettingsItem
              label="Удалить аккаунт"
              onPress={() => setShowDeleteModal(true)}
              rightElement={<Icon name="chevron-right" size={20} color="#949494" />}
            />
            <SettingsItem
              label="Выйти"
              onPress={() => setShowLogoutModal(true)}
              showDivider={false}
              rightElement={<Icon name="sign-out" size={20} color="#949494" />}
            />
          </SettingsSection>

          {/* About */}
          <SettingsSection title="О приложении">
            <SettingsItem
              label="Версия"
              rightElement={<Text className="text-t3 text-light-text-500">{APP_VERSION}</Text>}
            />
            <SettingsItem
              label="Поддержка"
              onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}
              rightElement={<Icon name="chevron-right" size={20} color="#949494" />}
            />
            <SettingsItem
              label="Политика конфиденциальности"
              onPress={() => router.push('/privacy-policy')}
              rightElement={<Icon name="chevron-right" size={20} color="#949494" />}
            />
            <SettingsItem
              label="Пользовательское соглашение"
              onPress={() => router.push('/terms')}
              rightElement={<Icon name="chevron-right" size={20} color="#949494" />}
            />
            <SettingsItem
              label="Оценить приложение"
              onPress={() => {/* Open App Store */}}
              showDivider={false}
              rightElement={<Icon name="chevron-right" size={20} color="#949494" />}
            />
          </SettingsSection>

          {/* FAQ */}
          <SettingsSection title="FAQ">
            <FAQAccordion items={FAQ_ITEMS} />
          </SettingsSection>

          {/* Contacts */}
          <SettingsSection title="Контакты">
            <SettingsItem
              label={SUPPORT_PHONE}
              onPress={() => Linking.openURL(`tel:${SUPPORT_PHONE}`)}
              rightElement={<Icon name="chevron-right" size={20} color="#949494" />}
            />
            <SettingsItem
              label={SUPPORT_EMAIL}
              onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}
              showDivider={false}
              rightElement={<Icon name="chevron-right" size={20} color="#949494" />}
            />
          </SettingsSection>
        </ScrollView>

        {/* Modals */}
        <ConfirmModal
          visible={showDeleteModal}
          title="вы точно хотите удалить аккаунт?"
          subtitle="Это действие нельзя отменить"
          confirmText="Удалить"
          cancelText="Нет"
          confirmVariant="danger"
          onConfirm={() => {
            setShowDeleteModal(false)
            deleteAccountMutation.mutate()
          }}
          onCancel={() => setShowDeleteModal(false)}
          isLoading={deleteAccountMutation.isPending}
        />

        <ConfirmModal
          visible={showLogoutModal}
          title="выйти из аккаунта?"
          confirmText="Выйти"
          cancelText="Нет"
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutModal(false)}
        />
      </View>
    </BackgroundLayout>
  )
}
```

### 5.4 ChangePasswordScreen

```typescript
// src/pages/profile/ui/ChangePasswordScreen.tsx
import { useState } from 'react'
import { View, ScrollView, Text } from 'react-native'
import { useRouter } from 'expo-router'
import { BackgroundLayout, BackButton, Input, Button, Toast } from '@/shared/ui'
import { userApi } from '@/features/user/api'
import { getUserId } from '@/shared/lib/auth'

export const ChangePasswordScreen = () => {
  const router = useRouter()
  
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showToast, setShowToast] = useState(false)

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!oldPassword) {
      newErrors.oldPassword = 'Введите текущий пароль'
    }
    if (!newPassword) {
      newErrors.newPassword = 'Введите новый пароль'
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Минимум 8 символов'
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Подтвердите пароль'
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    
    setIsLoading(true)
    try {
      const userId = await getUserId()
      if (!userId) throw new Error('User ID required')
      
      const result = await userApi.changePassword(
        userId.toString(),
        oldPassword,
        newPassword
      )
      
      if (result.success) {
        setShowToast(true)
        setOldPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setTimeout(() => router.back(), 2000)
      } else {
        if (result.error?.includes('incorrect') || result.error?.includes('неверн')) {
          setErrors({ oldPassword: 'Неверный пароль' })
        } else {
          setErrors({ general: result.error || 'Ошибка смены пароля' })
        }
      }
    } catch (error) {
      setErrors({ general: 'Произошла ошибка' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <BackgroundLayout>
      <Toast 
        visible={showToast}
        message="Пароль успешно изменён"
        variant="success"
        onHide={() => setShowToast(false)}
      />
      
      <View className="flex-1 px-5">
        <View className="pt-4">
          <BackButton onPress={() => router.back()} />
        </View>

        <ScrollView className="flex-1" contentContainerStyle={{ paddingTop: 20 }}>
          <Text className="text-t1 text-white mb-6">Смена пароля</Text>

          <View className="gap-4">
            <Input
              variant="password"
              label="Текущий пароль"
              value={oldPassword}
              onChangeText={(text) => {
                setOldPassword(text)
                setErrors(prev => ({ ...prev, oldPassword: '' }))
              }}
              placeholder="Введите текущий пароль"
              error={errors.oldPassword}
            />

            <Input
              variant="password"
              label="Новый пароль"
              value={newPassword}
              onChangeText={(text) => {
                setNewPassword(text)
                setErrors(prev => ({ ...prev, newPassword: '' }))
              }}
              placeholder="Минимум 8 символов"
              error={errors.newPassword}
            />

            <Input
              variant="password"
              label="Подтвердите пароль"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text)
                setErrors(prev => ({ ...prev, confirmPassword: '' }))
              }}
              placeholder="Повторите новый пароль"
              error={errors.confirmPassword}
            />

            <Button
              variant="ghost"
              size="s"
              onPress={() => router.push('/forgot-password')}
            >
              Не помню пароль
            </Button>

            {errors.general && (
              <Text className="text-feedback-negative-900 text-t4">{errors.general}</Text>
            )}
          </View>

          <View className="mt-8">
            <Button
              variant="primary"
              size="l"
              fullWidth
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </View>
        </ScrollView>
      </View>
    </BackgroundLayout>
  )
}
```

### 5.5 PrivacyPolicyScreen / TermsOfServiceScreen

```typescript
// src/pages/profile/ui/PrivacyPolicyScreen.tsx
import { View, ScrollView, Text } from 'react-native'
import { useRouter } from 'expo-router'
import { BackgroundLayout, BackButton } from '@/shared/ui'

export const PrivacyPolicyScreen = () => {
  const router = useRouter()

  return (
    <BackgroundLayout>
      <View className="flex-1 px-5">
        <View className="pt-4">
          <BackButton onPress={() => router.back()} />
        </View>

        <ScrollView className="flex-1" contentContainerStyle={{ paddingTop: 20, paddingBottom: 40 }}>
          <Text className="text-t1 text-white mb-6">Политика конфиденциальности</Text>
          <Text className="text-t2 text-light-text-200 leading-6">
            {/* Текст политики */}
            Настоящая Политика конфиденциальности определяет порядок обработки 
            персональных данных пользователей приложения FitChoice...
          </Text>
        </ScrollView>
      </View>
    </BackgroundLayout>
  )
}

// src/pages/profile/ui/TermsOfServiceScreen.tsx - аналогично
```

---

## 6. App Routes

### 6.1 Обновить существующие

```typescript
// src/app/profile.tsx
import { ProfileScreen } from '@/pages/profile'

export default function ProfilePage() {
  return <ProfileScreen />
}
```

### 6.2 Создать новые

```typescript
// src/app/settings.tsx
import { SettingsScreen } from '@/pages/profile'
export default function SettingsPage() {
  return <SettingsScreen />
}

// src/app/change-password.tsx  
import { ChangePasswordScreen } from '@/pages/profile'
export default function ChangePasswordPage() {
  return <ChangePasswordScreen />
}

// src/app/privacy-policy.tsx
import { PrivacyPolicyScreen } from '@/pages/profile'
export default function PrivacyPolicyPage() {
  return <PrivacyPolicyScreen />
}

// src/app/terms.tsx
import { TermsOfServiceScreen } from '@/pages/profile'
export default function TermsPage() {
  return <TermsOfServiceScreen />
}
```

---

## 7. План выполнения

### Этап 1: Подготовка (30 мин)
- [ ] Создать структуру папок
- [ ] Удалить legacy `ProfileScreen.tsx`

### Этап 2: API (1 час)
- [ ] Расширить `userApi.ts` новыми методами
- [ ] Создать `features/user/api/types.ts`

### Этап 3: Shared UI (3 часа)
- [ ] `ConfirmModal`
- [ ] `Toast` + `useToast`
- [ ] `SettingsItem`
- [ ] `Avatar`
- [ ] `ProgressBar`
- [ ] Обновить `shared/ui/index.ts`

### Этап 4: Widgets (1.5 часа)
- [ ] `ProfileHeader`
- [ ] `SettingsSection`
- [ ] `FAQAccordion`
- [ ] Создать `widgets/profile/index.ts`

### Этап 5: Constants (15 мин)
- [ ] `shared/constants/profile.ts`

### Этап 6: Pages (3 часа)
- [ ] `ProfileScreen` (новый)
- [ ] `SettingsScreen`
- [ ] `ChangePasswordScreen`
- [ ] `PrivacyPolicyScreen`
- [ ] `TermsOfServiceScreen`
- [ ] Обновить `pages/profile/index.ts`

### Этап 7: Routes (30 мин)
- [ ] Обновить `app/profile.tsx`
- [ ] Создать `app/settings.tsx`
- [ ] Создать `app/change-password.tsx`
- [ ] Создать `app/privacy-policy.tsx`
- [ ] Создать `app/terms.tsx`

### Этап 8: Тестирование (1 час)
- [ ] Проверить все экраны
- [ ] Проверить модали
- [ ] Проверить Toast
- [ ] Проверить валидацию

---

## 8. Итоговая оценка

| Компонент | Время | Примечания |
|-----------|-------|------------|
| API | 1ч | Расширение существующего |
| Shared UI | 3ч | 5 компонентов |
| Widgets | 1.5ч | 3 виджета |
| Pages | 3ч | 5 экранов |
| Routes | 0.5ч | 5 роутов |
| Тесты | 1ч | Ручное тестирование |
| **Итого** | **~10ч** | Без fallback |

---

## 9. Соответствие принципам

### FSD ✅
- `entities` — не создаём (данные с API через TanStack Query)
- `features/user/api` — расширяем существующий
- `widgets/profile` — чистые UI компоненты
- `pages/profile` — композиция с бизнес-логикой
- `app` — только роуты

### DRY ✅
- Используем существующий `userApi`
- Один `ConfirmModal` для всех диалогов
- Общие `SettingsItem`, `Avatar`, `ProgressBar`

### SOLID ✅
- **S**: Каждый компонент — одна ответственность
- **O**: Компоненты расширяемы через props
- **L**: Компоненты взаимозаменяемы
- **I**: Минимальные интерфейсы
- **D**: Зависимости через props, не хардкод

### Без костылей ✅
- Нет fallback для blur (только expo-blur)
- Нет legacy кода
- Нет условных платформенных хаков
